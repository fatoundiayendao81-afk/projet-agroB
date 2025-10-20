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
};

const AddProductModal = ({ isOpen, onClose }: AddProductModalProps) => {
  const { currentUser, isProducer, isAdmin } = useAuth();

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

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price" || name === "stock" ? Number(value) : value,
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
      Swal.fire("Non connecté", "Veuillez vous connecter pour ajouter un produit", "error");
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...formData,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        farmName: formData.farmName || currentUser.farmName || "",
        status: isAdmin() ? "approved" : "pending",
      };
      await productService.addProduct(productData);
      Swal.fire("Succès", "Produit ajouté avec succès", "success");
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
    } catch (err) {
      Swal.fire("Erreur", "Impossible d'ajouter le produit", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Ajouter un nouveau produit
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: Tomates bio"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Décrivez brièvement votre produit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (FCFA) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Catégorie + unité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unité de vente *</label>
              <input
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex: Kg, L, Unité..."
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {preview && (
              <img
                src={preview}
                alt="Aperçu"
                className="w-32 h-32 mt-3 object-cover rounded-xl border border-gray-200"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm text-gray-700">Produit disponible à la vente</label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
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
