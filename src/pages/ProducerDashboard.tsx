import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import type { Product, Order } from "../types";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  ArrowUp,
} from "lucide-react";

const ProducerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Statistiques
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);

      if (currentUser) {
        // Charger les produits du producteur
        const userProducts = await productService.getUserProducts(
          currentUser.id
        );
        setProducts(userProducts || []);

        // Charger les commandes (à adapter selon ton API)
        const userOrders = await orderService.getProducerOrders(currentUser.id);
        setOrders(userOrders || []);

        // Calculer les statistiques
        calculateStats(userProducts || [], userOrders || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products: Product[], orders: Order[]): void => {
    const totalProducts = products.length;
    const activeProducts = products.filter(
      (p) => p.status === "approved" && p.available
    ).length;
    const pendingProducts = products.filter(
      (p) => p.status === "pending"
    ).length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const monthlyRevenue = orders
      .filter((o) => {
        const orderDate = new Date(o.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          o.status === "completed"
        );
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    setStats({
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
    });
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter((p) => p.id !== productId));
        loadDashboardData(); // Recharger les stats
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de bord Producteur
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez vos produits et suivez vos ventes
              </p>
            </div>
            <Link
              to="/add-product"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouveau produit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Aperçu", icon: BarChart3 },
                { id: "products", label: "Produits", icon: Package },
                { id: "orders", label: "Commandes", icon: ShoppingCart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Cartes de statistiques */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Produits actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeProducts}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.pendingProducts} en attente de validation
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Commandes totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.pendingOrders} en attente
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Revenu total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUp size={12} />
                {stats.monthlyRevenue.toLocaleString()} FCFA ce mois
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de complétion
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders > 0
                      ? Math.round(
                          (stats.completedOrders / stats.totalOrders) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Commandes livrées</p>
            </div>
          </div>
        )}

        {/* Contenu des onglets */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Onglet Produits */}
          {activeTab === "products" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Produits
                </h2>
                <span className="text-sm text-gray-500">
                  {products.length} produit(s) au total
                </span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre premier produit
                  </p>
                  <Link
                    to="/add-product"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un produit
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={
                          product.image ||
                          "https://via.placeholder.com/300x200?text=Produit"
                        }
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {product.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : product.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status === "approved"
                              ? "Approuvé"
                              : product.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {product.price} FCFA
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                (window.location.href = `/edit-product/${product.id}`)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Commandes */}
          {activeTab === "orders" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Commandes Récentes
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={48}
                    className="text-gray-400 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-500">
                    Vos commandes apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Commande
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Client
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">#{order.id.slice(0, 8)}</td>
                          <td className="py-3 px-4">
                            {order.customerName || "Client"}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(order.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {order.total?.toLocaleString()} FCFA
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status === "completed"
                                ? "Livrée"
                                : order.status === "shipped"
                                ? "Expédiée"
                                : "En attente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Onglet Aperçu */}
          {activeTab === "overview" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Activité Récente
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produits récents */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Produits récents
                  </h3>
                  {products.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 border rounded-lg mb-2"
                    >
                      <img
                        src={
                          product.image ||
                          "https://via.placeholder.com/50x50?text=P"
                        }
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-xs text-gray-500">
                          {product.price} FCFA
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status === "approved" ? "Actif" : "En attente"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Commandes récentes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Commandes récentes
                  </h3>
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-3 border rounded-lg mb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">
                            Commande #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {order.total?.toLocaleString()} FCFA
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status === "completed"
                              ? "Livrée"
                              : "En cours"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
