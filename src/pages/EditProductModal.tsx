import React, { useState } from "react";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

const categories = ["Fruits", "Légumes", "Grains", "Produits laitiers", "Épices"];
const units = ["Kg", "Litre", "Pièce", "Botte", "Sachet"];

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "",
    unit: product?.unit || "",
    stock: product?.stock || "",
    image: product?.image || "",
  });

  const [dropdowns, setDropdowns] = useState({
    category: false,
    unit: false,
  });

  const [preview, setPreview] = useState<string | null>(product?.image || null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelect = (field: "category" | "unit", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Produit modifié avec succès !");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
  {/* --- Scrollable container --- */}
  <div className="bg-white/95 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-gray-100 animate-fade-in">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Modifier le produit
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ✖
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm"
            />
          </div>

          {/* --- MENU DÉROULANT : CATÉGORIE --- */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie *
            </label>
            <button
              type="button"
              onClick={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  category: !prev.category,
                }))
              }
              className="w-full flex justify-between items-center border border-gray-300 rounded-xl px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm"
            >
              {formData.category || "Sélectionner une catégorie"}
              <svg
                className={`w-5 h-5 ml-2 transition-transform ${
                  dropdowns.category ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.category && (
              <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                {categories.map((cat) => (
                  <li
                    key={cat}
                    onClick={() => handleSelect("category", cat)}
                    className={`px-4 py-3 hover:bg-green-50 cursor-pointer transition ${
                      formData.category === cat ? "bg-green-100 font-medium" : ""
                    }`}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* --- MENU DÉROULANT : UNITÉ --- */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unité de mesure *
            </label>
            <button
              type="button"
              onClick={() =>
                setDropdowns((prev) => ({
                  ...prev,
                  unit: !prev.unit,
                }))
              }
              className="w-full flex justify-between items-center border border-gray-300 rounded-xl px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-green-400 focus:border-green-500 transition shadow-sm"
            >
              {formData.unit || "Sélectionner une unité"}
              <svg
                className={`w-5 h-5 ml-2 transition-transform ${
                  dropdowns.unit ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.unit && (
              <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                {units.map((u) => (
                  <li
                    key={u}
                    onClick={() => handleSelect("unit", u)}
                    className={`px-4 py-3 hover:bg-green-50 cursor-pointer transition ${
                      formData.unit === u ? "bg-green-100 font-medium" : ""
                    }`}
                  >
                    {u}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-500"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image du produit
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-green-400"
            />
            {preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-[1.02]"
            >
              💾 Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-[1.02]"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
