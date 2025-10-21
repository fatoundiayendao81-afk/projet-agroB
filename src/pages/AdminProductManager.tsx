import React, { useState, useEffect } from "react";
import AddProductModal from "../pages/AddProductModal";
import { productService } from "../services/productService";
import type { Product } from "../types";

const AdminProductManager: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Charger la liste des produits
  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Ouvrir/fermer le modal
  const handleOpenModal = () => setIsAddModalOpen(true);
  const handleCloseModal = () => setIsAddModalOpen(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des produits</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition transform hover:scale-[1.02]"
        >
          ➕ Ajouter un produit
        </button>
      </div>

      {/* Liste des produits */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">
            Aucun produit disponible pour le moment.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition"
            >
              <img
                src={product.image || "/placeholder.png"}
                alt={product.title}
                className="w-full h-48 object-cover rounded-xl mb-3"
              />
              <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <p className="text-green-700 font-bold mb-2">{product.price} FCFA</p>
              <p className="text-gray-500 text-sm mb-2">Stock : {product.stock}</p>
              <p
                className={`text-sm font-semibold ${
                  product.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.available ? "Disponible" : "Indisponible"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal d’ajout */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onProductAdded={fetchProducts} // Rafraîchit la liste
      />
    </div>
  );
};

export default AdminProductManager;
