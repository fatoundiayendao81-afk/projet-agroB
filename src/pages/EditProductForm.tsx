import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { productService } from "../services/productService";
import type { Product } from "../types";

// Catégories simulées
const categories = [
  { id: "1", name: "légumes" },
  { id: "2", name: "fruits" },
  { id: "3", name: "grains" },
];

const EditProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isProducer, isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    unit: "",
    available: true,
    stock: 0,
    farmName: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  // Charger le produit à modifier
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setFetchLoading(true);
        const productData = await productService.getProductById(id);
        setProduct(productData);
        setFormData({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image: productData.image,
          unit: productData.unit,
          available: productData.available,
          stock: productData.stock,
          farmName: productData.farmName || "",
        });
        setPreview(productData.image || null);
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        Swal.fire({
          icon: "error",
          title: "Produit non trouvé",
          text: "Le produit que vous essayez de modifier n'existe pas.",
        }).then(() => {
          navigate("/profile");
        });
      } finally {
        setFetchLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Vérifier les permissions
  useEffect(() => {
    if (product && currentUser) {
      // Seul le propriétaire du produit ou un admin peut le modifier
      const isOwner = product.sellerId === currentUser.id;
      const canEdit = isOwner || isAdmin();

      if (!canEdit) {
        Swal.fire({
          icon: "error",
          title: "Permission refusée",
          text: "Vous n'êtes pas autorisé à modifier ce produit.",
        }).then(() => {
          navigate("/profile");
        });
      }
    }
  }, [product, currentUser, isAdmin, navigate]);

  // Gestion des changements dans les inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | number | boolean = target.value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    }

    if (name === "price" || name === "stock") {
      value = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion de l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Fichier trop volumineux",
          text: "L'image ne doit pas dépasser 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, image: base64String }));
        setPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreview(null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !product) return;

    setLoading(true);

    try {
      // Validation des données
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Vérifier que formData.price existe avant de le comparer
      if (formData.price === undefined || formData.price <= 0) {
        throw new Error("Le prix doit être supérieur à 0");
      }

      // Vérifier que formData.stock existe avant de le comparer
    if (formData.stock === undefined || formData.stock < 0) {
        throw new Error("Le stock ne peut pas être négatif");
    }

      let result;
      if (isProducer()) {
        // Pour les producteurs : passer par le système d'approbation
        result = await productService.updateProduct(product.id, formData);

        Swal.fire({
          icon: "success",
          title: "Modification soumise !",
          html: `
            <div class="text-left">
              <p class="mb-2">Vos modifications ont été soumises pour approbation.</p>
              <p class="text-sm text-gray-600">Elles seront examinées par un administrateur avant d'être appliquées.</p>
            </div>
          `,
          confirmButtonText: "Compris",
        });
      } else if (isAdmin()) {
        // Pour les admins : modification directe
        result = await productService.adminUpdateProduct(product.id, formData);

        Swal.fire({
          icon: "success",
          title: "Produit modifié !",
          text: "Les modifications ont été appliquées directement.",
        });
      } else {
        throw new Error("Vous n'êtes pas autorisé à modifier ce produit");
      }

      // Redirection après succès
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la modification du produit:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: (error as Error).message || "Impossible de modifier le produit.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer le produit
  const handleDelete = async () => {
    if (!product) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmer la suppression",
      html: `
        <div class="text-left">
          <p class="mb-2">Êtes-vous sûr de vouloir supprimer le produit <strong>"${product.title}"</strong> ?</p>
          <p class="text-sm text-gray-600">Cette action est irréversible.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      try {
        if (isProducer()) {
          // Pour les producteurs : demande d'approbation
          await productService.deleteProduct(product.id);
          Swal.fire({
            icon: "success",
            title: "Demande de suppression soumise",
            text: "La suppression doit être approuvée par un administrateur.",
          });
        } else if (isAdmin()) {
          // Pour les admins : suppression directe
          await productService.adminDeleteProduct(product.id);
          Swal.fire({
            icon: "success",
            title: "Produit supprimé",
            text: "Le produit a été supprimé définitivement.",
          });
        }

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de supprimer le produit.",
        });
      }
    }
  };

  // Afficher le chargement
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Vérifier les permissions
  if (!currentUser || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour modifier un produit.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const isOwner = product.sellerId === currentUser.id;
  const canEdit = isOwner || isAdmin();

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Permission refusée
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'êtes pas autorisé à modifier ce produit.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour au profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Modifier le produit
            </h1>
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Informations sur le produit actuel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-800 mb-2">Produit actuel</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Nom:</strong> {product.title}
              </div>
              <div>
                <strong>Prix:</strong> {product.price.toLocaleString()} FCFA
              </div>
              <div>
                <strong>Stock:</strong> {product.stock} {product.unit}
              </div>
              <div>
                <strong>Statut:</strong>
                <span
                  className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    product.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : product.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.status === "approved"
                    ? "Approuvé"
                    : product.status === "pending"
                    ? "En attente"
                    : "Rejeté"}
                </span>
              </div>
            </div>
          </div>

          {/* Système d'approbation */}
          {isProducer() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Système d'approbation
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>
                      En tant que producteur, toutes vos modifications doivent
                      être approuvées par un administrateur. Le produit actuel
                      restera visible jusqu'à validation des changements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdmin() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Mode administrateur
                  </h3>
                  <div className="mt-1 text-sm text-green-700">
                    <p>
                      En tant qu'administrateur, vos modifications sont
                      appliquées directement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-2xl p-6 space-y-6"
        >
          {/* Informations de base */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations de base
            </h3>

            {/* Nom du produit */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Ex: Tomates bio, Pommes Golden..."
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Décrivez votre produit en détail..."
              />
            </div>

            {/* Prix et Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Catégorie et Unité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité de vente *
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Ex: kg, L, unité, botte..."
                />
              </div>
            </div>
          </div>

          {/* Image du produit */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Image du produit
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du produit
              </label>

              {/* Image actuelle */}
              {product.image && !preview && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Image actuelle:
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setPreview(product.image || null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Modifier l'image
                    </button>
                  </div>
                </div>
              )}

              {/* Upload nouvelle image */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              <p className="mt-1 text-sm text-gray-500">
                Formats supportés: JPG, PNG, WEBP. Taille max: 5MB
              </p>

              {/* Aperçu nouvelle image */}
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Nouvelle image:
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={preview}
                      alt="Aperçu du produit"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations supplémentaires
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'exploitation
              </label>
              <input
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Ex: Ferme du Soleil, Exploitation Lambert..."
              />
            </div>

            {/* Disponibilité */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Produit disponible à la vente
              </label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isProducer()
                    ? "Soumission en cours..."
                    : "Modification en cours..."}
                </>
              ) : (
                <>
                  {isProducer() ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Soumettre les modifications
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Appliquer les modifications
                    </>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 bg-gray-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer
            </button>
          </div>

          {/* Note informative */}
          <div className="text-center">
            <p className="text-sm text-gray-500">* Champs obligatoires</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
