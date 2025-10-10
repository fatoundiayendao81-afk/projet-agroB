import React, { useState } from "react";
import categories from "../data/categories.json";
import type { Product, ProductFormProps } from "../types";

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData = {},
}) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [price, setPrice] = useState<number | string>(initialData.price || "");
  const [image, setImage] = useState(initialData.image || "");
  const [category, setCategory] = useState(initialData.category || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: initialData.id || Date.now().toString(),
      title,
      description,
      price: parseInt(price as string),
      image,
      category,
      sellerId: initialData.sellerId || "1",
      sellerName: initialData.sellerName || "",
      available: initialData.available || true,
      stock: initialData.stock || 0,
      createdAt: initialData.createdAt || new Date().toISOString(),
    };

    onSubmit(newProduct);

    if (!initialData.id) {
      setTitle("");
      setDescription("");
      setPrice("");
      setImage("");
      setCategory("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-lg space-y-6 max-w-lg mx-auto border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {initialData.id ? "Modifier un produit" : "Ajouter un produit"}
      </h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Titre du produit *
        </label>
        <input
          type="text"
          placeholder="Ex: Tomates fraîches bio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          placeholder="Décrivez votre produit en détail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-vertical"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Prix (FCFA) *
        </label>
        <input
          type="number"
          placeholder="Ex: 1500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="1"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          URL de l'image *
        </label>
        <input
          type="text"
          placeholder="https://exemple.com/image.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Catégorie *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
        >
          <option value="" className="text-gray-400">
            -- Choisir une catégorie --
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name} className="text-gray-700">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {initialData.id ? "Mettre à jour le produit" : "Ajouter le produit"}
      </button>
    </form>
  );
};

export default ProductForm;
