import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";
import type { Product } from "../types";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [error, setError] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory]);

  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      let productsData: Product[];

      if (searchTerm || selectedCategory) {
        productsData = await productService.searchProducts(
          searchTerm,
          selectedCategory
        );
      } else {
        productsData = await productService.getProducts();
      }

      setProducts(productsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      setError("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    loadProducts();
  };

  const handleReset = (): void => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement des produits...</p>
      </div>
    );
  }

  // ====== Rendu principal ======
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === EN-TÊTE === */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Nos Produits Frais
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez tous nos produits directement issus de l'agriculture
            locale
          </p>
        </div>

        {/* === BARRE DE RECHERCHE ET FILTRES === */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Groupe de recherche */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Rechercher un produit (tomates, lait, œufs...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <span>🔍</span> Rechercher
              </button>
            </div>

            {/* Groupe de filtres */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">🥕 Toutes les catégories</option>
                  <option value="légumes">🥕 Légumes</option>
                  <option value="fruits">🍎 Fruits</option>
                  <option value="grains">🌾 Grains</option>{" "}
                  {/* CORRECTION : "grains" au lieu de "viandes" */}
                </select>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <span>🔄</span> Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* === MESSAGE D'ERREUR === */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* === INFORMATIONS SUR LES RÉSULTATS === */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <p className="text-gray-700 font-medium">
            {products.length} produit(s) trouvé(s)
            {searchTerm && (
              <span className="text-green-600"> pour "{searchTerm}"</span>
            )}
            {selectedCategory && (
              <span className="text-green-600"> dans "{selectedCategory}"</span>
            )}
          </p>

          <Link
            to="/cart"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
          >
            <span>🛒</span> Voir mon panier
          </Link>
        </div>

        {/* === GRILLE DES PRODUITS === */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun produit n'est disponible pour le moment"}
            </p>

            {(searchTerm || selectedCategory) && (
              <button
                onClick={handleReset}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <p className="text-gray-600 mb-4 text-lg">
                {products.length === 1
                  ? "Vous avez vu notre seul produit disponible"
                  : `Vous avez vu tous nos ${products.length} produits disponibles`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
                >
                  <span>←</span> Retour à l'accueil
                </Link>
                <button
                  onClick={handleReset}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Voir tous les produits
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
