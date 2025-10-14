import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { productService } from "../services/productService";
import type { Product } from "../types";

// Catégories simulées (à remplacer par un fetch API si besoin)
const categories = [
  { id: "1", name: "légumes" },
  { id: "2", name: "fruits" },
  { id: "3", name: "grains" },
];

const AddProductForm = () => {
  const { currentUser, isProducer, isAdmin } = useAuth();
  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    sellerId: "",
    sellerName: "",
    farmName: "",
    unit: "",
    available: true,
    stock: 0,
  });

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Initialiser les données du vendeur
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        farmName: currentUser.farmName || "",
      }));
    }
  }, [currentUser]);

  // ✅ Gestion des changements dans les inputs (corrigé pour TypeScript)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | number | boolean = target.value;

    // Si c'est un checkbox, utiliser target.checked
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    }

    // Conversion automatique pour les nombres
    if (name === "price" || name === "stock") {
      value = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Gestion de l'image depuis la galerie
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
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
      reader.readAsDataURL(file); // convertit l'image en base64
    }
  };

  // ✅ Soumission du formulaire avec système d'approbation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        icon: "error",
        title: "Non connecté",
        text: "Veuillez vous connecter pour ajouter un produit",
      });
      return;
    }

    setLoading(true);

    try {
      // Validation des données
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (formData.price !== undefined && formData.price <= 0) {
        throw new Error("Le prix doit être supérieur à 0");
      }

      if (formData.stock !== undefined && formData.stock < 0) {
        throw new Error("Le stock ne peut pas être négatif");
      }

      // Préparer les données du produit
      // Préparer les données du produit
      // Préparer les données du produit
      // Préparer les données du produit
      const productData: Partial<Product> = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: formData.image,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        farmName: formData.farmName || currentUser.farmName || "",
        available: true,
        status: isAdmin() ? "approved" : "pending", // Les admins n'ont pas besoin d'approbation
      };

      // Ajouter le produit
      await productService.addProduct(productData);

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        farmName: currentUser.farmName || "",
        available: true,
        status: isAdmin() ? "approved" : "pending", // Les admins n'ont pas besoin d'approbation
      });
      setPreview(null);

      // Redirection après succès
      setTimeout(() => {
        window.location.href = "/profile";
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: (error as Error).message || "Impossible d'ajouter le produit.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Afficher un message si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Accès non autorisé
        </h2>
        <p className="text-gray-600 mb-4">
          Vous devez être connecté pour ajouter un produit.
        </p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Vérifier les permissions
  if (!isProducer() && !isAdmin()) {
    return (
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Permission refusée
        </h2>
        <p className="text-gray-600 mb-4">
          Seuls les producteurs et administrateurs peuvent ajouter des produits.
        </p>
        <button
          onClick={() => (window.location.href = "/profile")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Retour au profil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* En-tête avec informations sur le système d'approbation */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Ajouter un nouveau produit
          </h1>

          {isProducer() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Système d'approbation
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      En tant que producteur, tous vos produits doivent être
                      approuvés par un administrateur avant d'être visibles dans
                      le catalogue. Vous serez notifié une fois la validation
                      effectuée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdmin() && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Mode administrateur
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      En tant qu'administrateur, vos produits sont
                      automatiquement approuvés et directement visibles dans le
                      catalogue.
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
                  placeholder="0.00"
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
                  placeholder="0"
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              <p className="mt-1 text-sm text-gray-500">
                Formats supportés: JPG, PNG, WEBP. Taille max: 5MB
              </p>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Aperçu:
                  </p>
                  <img
                    src={preview}
                    alt="Aperçu du produit"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
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

          {/* Bouton de soumission */}
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
                    : "Ajout en cours..."}
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
                      Soumettre pour approbation
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Ajouter le produit
                    </>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/profile")}
              className="flex-1 bg-gray-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
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

export default AddProductForm;
