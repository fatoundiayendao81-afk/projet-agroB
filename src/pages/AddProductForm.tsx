import { useState } from "react";
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, image: base64String }));
        setPreview(base64String);
      };
      reader.readAsDataURL(file); // convertit l’image en base64
    }
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productService.addProduct(formData);
      Swal.fire({
        icon: "success",
        title: "Produit ajouté",
        text: "Le produit a été ajouté avec succès !",
      });

      // Réinitialiser le formulaire
      setFormData({
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
      setPreview(null);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'ajouter le produit.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-8 space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center mb-4">
        Ajouter un produit
      </h2>

      {/* Nom du produit */}
      <div>
        <label className="block text-gray-700 mb-1">Nom du produit</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Prix et Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">Prix (€)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-gray-700 mb-1">Catégorie</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image */}
      <div>
        <label className="block text-gray-700 mb-1">Image du produit</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded-lg px-3 py-2"
        />
        {preview && (
          <img
            src={preview}
            alt="Aperçu du produit"
            className="mt-3 w-32 h-32 object-cover rounded-lg border"
          />
        )}
      </div>

      {/* Unité et Ferme */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-1">Unité</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Ex: kg, L, unité"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Ferme (optionnel)</label>
          <input
            type="text"
            name="farmName"
            value={formData.farmName}
            onChange={handleChange}
            placeholder="Ex: Ferme du Soleil"
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Disponibilité */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label className="text-gray-700">Produit disponible à la vente</label>
      </div>

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Ajout en cours..." : "Ajouter le produit"}
      </button>
    </form>
  );
};

export default AddProductForm;
