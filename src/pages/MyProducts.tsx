import React, { useState } from "react";
import ProductForm from "../components/ProductForm";
import type { Product } from "../types";

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (newProduct: Product): void => {
    setProducts([...products, { ...newProduct, id: Date.now().toString() }]);
  };

  const deleteProduct = (productId: string): void => {
    setProducts(products.filter((product) => product.id !== productId));
  };

  const updateProduct = (updatedProduct: Product): void => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const totalProducts = products.length;
  const totalRevenue = products.reduce(
    (total, product) => total + product.price,
    0
  );
  const mostExpensiveProduct =
    products.length > 0
      ? products.reduce((max, product) =>
          product.price > max.price ? product : max
        )
      : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Mes Produits
              </h1>
              <p className="text-gray-600">
                Gérez votre inventaire de produits agricoles
              </p>
            </div>

            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {totalProducts}
                </div>
                <div className="text-sm text-gray-500">Produits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalRevenue} FCFA
                </div>
                <div className="text-sm text-gray-500">Valeur totale</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Ajouter un produit
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Remplissez les informations de votre nouveau produit agricole
              </p>

              <ProductForm onSubmit={addProduct} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Mes produits en vente
                </h2>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {products.length} produit(s)
                </span>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Aucun produit pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par ajouter votre premier produit en utilisant le
                  formulaire à gauche.
                </p>
                <div className="text-sm text-gray-500">
                  Vos produits apparaîtront ici une fois ajoutés
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {product.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {product.price} FCFA
                            </div>
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>Ajouté récemment</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🏷️</span>
                            <span>En stock</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              /* Fonction de modification à implémenter */
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <span>✏️</span>
                            Modifier
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Supprimer
                          </button>

                          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
                            <span>👁️</span>
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mostExpensiveProduct && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Produit le plus valorisé
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">
                      {mostExpensiveProduct.title}
                    </p>
                    <p className="text-yellow-700 text-sm">
                      {mostExpensiveProduct.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-800">
                      {mostExpensiveProduct.price} FCFA
                    </p>
                    <p className="text-yellow-700 text-sm">Prix unitaire</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
