import React, { useState } from "react";
import ProductForm from "../components/ProductForm";
import type { Product } from "../types";
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  TrendingUp,
  Package,
  Award,
  BarChart3,
  Calendar,
  Tag,
  Sparkles,
  ArrowUp,
  Download,
  Share2,
} from "lucide-react";

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const addProduct = (newProduct: Product): void => {
    setProducts([
      ...products,
      {
        ...newProduct,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        stock: newProduct.stock || 10,
        available: true,
      },
    ]);
  };

  const updateProduct = (updatedProduct: Product): void => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  };

  const deleteProduct = (productId: string): void => {
    setProducts(products.filter((product) => product.id !== productId));
  };

  const startEditing = (product: Product): void => {
    setEditingProduct(product);
  };

  const cancelEditing = (): void => {
    setEditingProduct(null);
  };

  // Statistiques
  const totalProducts = products.length;
  const totalRevenue = products.reduce(
    (total, product) => total + product.price * (product.stock || 0),
    0
  );
  const averagePrice = totalProducts > 0 ? totalRevenue / totalProducts : 0;
  const mostExpensiveProduct =
    products.length > 0
      ? products.reduce((max, product) =>
          product.price > max.price ? product : max
        )
      : null;

  const stats = [
    {
      label: "Total Produits",
      value: totalProducts,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Valeur Stock",
      value: `${totalRevenue.toLocaleString()} FCFA`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Prix Moyen",
      value: `${Math.round(averagePrice).toLocaleString()} FCFA`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "En Stock",
      value: products.reduce(
        (total, product) => total + (product.stock || 0),
        0
      ),
      icon: <Package className="w-5 h-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-green-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Mes Produits
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gérez votre inventaire et maximisez vos ventes
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 lg:mt-0">
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-600/25 hover:scale-105">
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
              <button className="flex items-center space-x-2 border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-2xl font-semibold transition-all duration-300">
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <ArrowUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar - Product Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-green-100 sticky top-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {editingProduct
                      ? "Mettez à jour les informations"
                      : "Ajoutez un nouveau produit à votre catalogue"}
                  </p>
                </div>
              </div>

              <ProductForm
                onSubmit={editingProduct ? updateProduct : addProduct}
                initialData={editingProduct || undefined}
              />

              {editingProduct && (
                <button
                  onClick={cancelEditing}
                  className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300"
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </div>

          {/* Main Content - Products List */}
          <div className="xl:col-span-3">
            {/* Products Header */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-green-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Mes produits en vente
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {products.length} produit(s) actifs dans votre catalogue
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {products.length} actifs
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-green-100">
                <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Votre catalogue est vide
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Commencez par ajouter votre premier produit agricole.
                  Remplissez le formulaire pour mettre en ligne votre offre.
                </p>
                <div className="text-sm text-gray-500">
                  🌱 Les produits ajoutés apparaîtront ici automatiquement
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-24 h-24 lg:w-28 lg:h-28 object-cover rounded-2xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                          />
                          {product.available && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              En stock
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                              {product.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>

                            {/* Product Meta */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                              <div className="flex items-center space-x-1">
                                <Tag className="w-4 h-4" />
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {product.category}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Package className="w-4 h-4" />
                                <span>Stock: {product.stock || 0} unités</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Ajouté le{" "}
                                  {new Date(
                                    product.createdAt!
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {product.price.toLocaleString()} FCFA
                            </div>
                            {product.unit && (
                              <div className="text-sm text-gray-500">
                                par {product.unit}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => startEditing(product)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer</span>
                          </button>

                          <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-medium transition-all duration-300">
                            <Eye className="w-4 h-4" />
                            <span>Voir détails</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Most Valuable Product */}
            {mostExpensiveProduct && (
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-3xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-800">
                      Produit le plus valorisé
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Votre produit avec la plus haute valeur marchande
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-yellow-900 text-lg">
                      {mostExpensiveProduct.title}
                    </p>
                    <p className="text-yellow-800 text-sm">
                      Catégorie: {mostExpensiveProduct.category}
                    </p>
                  </div>
                  <div className="text-right mt-3 sm:mt-0">
                    <p className="text-2xl font-bold text-yellow-800">
                      {mostExpensiveProduct.price.toLocaleString()} FCFA
                    </p>
                    <p className="text-yellow-700 text-sm">Valeur unitaire</p>
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
