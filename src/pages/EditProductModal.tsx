import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import type { Product } from "../types";

type EditProductModalProps = {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  isProducer: () => boolean;
  isAdmin: () => boolean;
};

const categories = [
  { id: "1", name: "légumes" },
  { id: "2", name: "fruits" },
  { id: "3", name: "grains" },
];

const EditProductModal = ({
  productId,
  isOpen,
  onClose,
  currentUser,
  isProducer,
  isAdmin,
}: EditProductModalProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Charger le produit
  useEffect(() => {
    if (!productId || !isOpen) return;

    const loadProduct = async () => {
      try {
        const prod = await productService.getProductById(productId);
        setProduct(prod);
        setFormData({
          title: prod.title,
          description: prod.description,
          price: prod.price,
          category: prod.category,
          unit: prod.unit,
          stock: prod.stock,
          image: prod.image,
          farmName: prod.farmName || "",
          available: prod.available,
        });
        setPreview(prod.image || null);
      } catch (err) {
        console.error(err);
      }
    };

    loadProduct();
  }, [productId, isOpen]);

  if (!isOpen || !product) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let value: string | number | boolean = e.target.value;
    const name = e.target.name;

    if (e.target.type === "checkbox") value = e.target.checked;
    if (name === "price" || name === "stock") value = Number(value);

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({ ...prev, image: base64 }));
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    try {
      if (isProducer()) {
        await productService.updateProduct(product.id, formData);
        alert("Modification soumise pour approbation !");
      } else if (isAdmin()) {
        await productService.adminUpdateProduct(product.id, formData);
        alert("Produit modifié avec succès !");
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Modifier le produit</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            placeholder="Nom du produit"
            className="w-full border rounded px-4 py-2"
            required
          />

          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded px-4 py-2"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="price"
              value={formData.price || 0}
              onChange={handleChange}
              placeholder="Prix"
              className="w-full border rounded px-4 py-2"
              required
            />
            <input
              type="number"
              name="stock"
              value={formData.stock || 0}
              onChange={handleChange}
              placeholder="Stock"
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>

          <select
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="unit"
            value={formData.unit || ""}
            onChange={handleChange}
            placeholder="Unité"
            className="w-full border rounded px-4 py-2"
            required
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="preview" className="w-32 h-32 mt-2 rounded" />}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? "Chargement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
