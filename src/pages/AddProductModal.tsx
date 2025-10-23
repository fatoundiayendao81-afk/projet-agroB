import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { productService } from "../services/productService";
import type { Product } from "../types";

const categories = [
  { id: "1", name: "Légumes" },
  { id: "2", name: "Fruits" },
  { id: "3", name: "Grains" },
  { id: "4", name: "Tubercules" },
  { id: "5", name: "Herbes & Épices" },
];

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
};

const AddProductModal = ({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) => {
  const { currentUser, isAdmin } = useAuth();

  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    unit: "",
    available: true,
    stock: 0,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pré-remplir sellerId et farmName
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

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && "checked" in e.target
          ? e.target.checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Erreur", "L'image ne doit pas dépasser 5 Mo", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire(
        "Non connecté",
        "Veuillez vous connecter pour ajouter un produit",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const productData: Partial<Product> = {
        ...formData,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        farmName: formData.farmName || currentUser.farmName || "",
        status: isAdmin() ? "approved" : "pending",
      };

      await productService.addProduct(productData);

      Swal.fire("Succès", "Produit ajouté avec succès", "success");

      // Reset formulaire
      setFormData({
        title: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        unit: "",
        available: true,
        stock: 0,
      });
      setPreview(null);

      onClose();
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "Impossible d'ajouter le produit", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-4xl w-full max-w-lg max-h-[100vh] overflow-y-auto p-3  relative animate-fade-in">
        <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
    >
      ✕
    </button>
        <h2 className="text-xl font-bold text-center text-black-600 mb-5 bg-green-400 p-3 rounded-lg">
         ✏️ Ajouter un nouveau produit  </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nom du produit"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder= "Prix (FCFA)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Unité"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {preview && (
            <img
              src={preview}
              alt="Aperçu"
              className="w-24 h-24 mt-2 object-cover rounded-lg"
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm">Produit disponible</span>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              {loading ? "Envoi..." : "Ajouter le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
