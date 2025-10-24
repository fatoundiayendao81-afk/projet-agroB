import { useState, useEffect } from "react";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { productService } from "../services/productService";
import type { Product } from "../types";

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les produits
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Après ajout d’un produit
  const handleProductAdded = () => {
    fetchProducts();
    setIsAddModalOpen(false);
  };

  // Après modification d’un produit
  const handleProductUpdated = () => {
    fetchProducts();
    setEditProduct(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mes Produits</h1>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        ➕ Ajouter un produit
      </button>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col">
              <img
                src={product.image}
                alt={product.title}
                className="rounded-lg h-40 object-cover mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
              <p className="text-gray-500">{product.price} FCFA</p>
              <button
                onClick={() => setEditProduct(product)}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
              >
                ✏️ Modifier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Modal Modifier */}
      {editProduct && (
        <EditProductModal
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          product={editProduct}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default ProductPage;
