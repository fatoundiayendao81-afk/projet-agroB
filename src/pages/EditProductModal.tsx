import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type { Product } from "../types";
import { productService } from "../services/productService";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isAdmin?: boolean;
  onProductUpdated?: () => void; // callback parent
}

const categories = ["Fruits", "Légumes", "Grains", "Produits laitiers", "Épices"];
const units = ["Kg", "Litre", "Pièce", "Botte", "Sachet"];

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  isAdmin = false,
  onProductUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    unit: "",
    stock: 0,
    image: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [dropdowns, setDropdowns] = useState({ category: false, unit: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        category: product.category || "",
        unit: product.unit || "",
        stock: product.stock || 0,
        image: product.image || "",
      });
      setPreview(product.image || null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelect = (field: "category" | "unit", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.updateProduct(product.id, formData);
      Swal.fire("Succès", "Produit modifié avec succès", "success");
      if (onProductUpdated) onProductUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "Impossible de modifier le produit", "error");
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
    </button>      {/* Header */}
        <div className=" items-center border-b border-gray-200 pb-4 mb-6">
          
          <h2 className="text-xl font-bold text-center text-black-600 mb-5 bg-green-400 p-3 rounded-lg">✏️ Modifier le produit</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500"
            />
          </div>

          {/* Catégorie & Unité */}
          <div className="grid grid-cols-2 gap-4">
            {/* Catégorie */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
              <button
                type="button"
                onClick={() => setDropdowns((prev) => ({ ...prev, category: !prev.category }))}
                className="w-full flex justify-between items-center border rounded-xl px-4 py-3 bg-white"
              >
                {formData.category || "Sélectionner une catégorie"} ▼
              </button>
              {dropdowns.category && (
                <ul className="absolute z-10 w-full mt-2 bg-white border rounded-xl shadow-lg overflow-hidden">
                  {categories.map((cat) => (
                    <li
                      key={cat}
                      onClick={() => handleSelect("category", cat)}
                      className={`px-4 py-2 hover:bg-green-50 cursor-pointer ${formData.category === cat ? "bg-green-100 font-medium" : ""}`}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Unité */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unité de mesure *</label>
              <button
                type="button"
                onClick={() => setDropdowns((prev) => ({ ...prev, unit: !prev.unit }))}
                className="w-full flex justify-between items-center border rounded-xl px-4 py-3 bg-white"
              >
                {formData.unit || "Sélectionner une unité"} ▼
              </button>
              {dropdowns.unit && (
                <ul className="absolute z-10 w-full mt-2 bg-white border rounded-xl shadow-lg overflow-hidden">
                  {units.map((u) => (
                    <li
                      key={u}
                      onClick={() => handleSelect("unit", u)}
                      className={`px-4 py-2 hover:bg-green-50 cursor-pointer ${formData.unit === u ? "bg-green-100 font-medium" : ""}`}
                    >
                      {u}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Prix & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (FCFA) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3"/>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image du produit</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border rounded-xl px-4 py-3"/>
            {preview && <img src={preview} alt="Aperçu" className="w-32 h-32 mt-2 object-cover rounded-lg"/>}
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-xl">{loading ? "Enregistrement..." : "💾 Enregistrer"}</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-500 text-white py-3 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
