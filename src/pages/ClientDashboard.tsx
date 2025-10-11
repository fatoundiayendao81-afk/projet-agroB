import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import type { Order } from "../types";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Star,
  Heart,
  History,
  Settings,
  Bell,
} from "lucide-react";

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Statistiques
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);

      if (currentUser) {
        const userOrders = await orderService.getUserOrders(currentUser.id);
        setOrders(userOrders || []);
        calculateStats(userOrders || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: Order[]): void => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;
    const totalSpent = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    setStats({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalSpent,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={20} />;
      case "processing":
        return <Settings className="text-blue-500" size={20} />;
      case "shipped":
        return <Truck className="text-orange-500" size={20} />;
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "processing":
        return "En traitement";
      case "shipped":
        return "Expédiée";
      case "completed":
        return "Livrée";
      default:
        return status;
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
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Mon Tableau de bord
            </h1>
            <p className="text-gray-600 mt-1">
              Suivez vos commandes et votre activité
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Aperçu", icon: ShoppingCart },
                { id: "orders", label: "Mes Commandes", icon: Package },
                { id: "favorites", label: "Favoris", icon: Heart },
                { id: "history", label: "Historique", icon: History },
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
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livrées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.deliveredOrders}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total dépensé
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSpent.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu des onglets */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Onglet Aperçu */}
          {activeTab === "overview" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commandes récentes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Commandes récentes
                  </h3>
                  {orders.slice(0, 5).length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart
                        size={48}
                        className="text-gray-400 mx-auto mb-4"
                      />
                      <p className="text-gray-500">Aucune commande récente</p>
                      <Link
                        to="/products"
                        className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
                      >
                        Découvrir nos produits
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                Commande #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="text-sm font-medium">
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-green-600">
                              {order.total?.toLocaleString()} FCFA
                            </span>
                            <Link
                              to={`/order/${order.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Voir détails
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions rapides
                  </h3>
                  <div className="space-y-3">
                    <Link
                      to="/products"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium">Continuer mes achats</p>
                        <p className="text-sm text-gray-500">
                          Parcourir les produits
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="text-red-600" size={20} />
                      <div>
                        <p className="font-medium">Mes favoris</p>
                        <p className="text-sm text-gray-500">
                          Produits sauvegardés
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="text-blue-600" size={20} />
                      <div>
                        <p className="font-medium">Paramètres du compte</p>
                        <p className="text-sm text-gray-500">
                          Gérer mon profil
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Commandes */}
          {activeTab === "orders" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Mes Commandes
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore passé de commande
                  </p>
                  <Link
                    to="/products"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Découvrir nos produits
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Commande #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-gray-500">
                            Passée le{" "}
                            {new Date(order.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-lg font-bold text-green-600">
                            {order.total?.toLocaleString()} FCFA
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Articles</p>
                          <p className="font-medium">
                            {order.items?.length || 1} article(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Livraison</p>
                          <p className="font-medium">
                            {order.shippingAddress || "Adresse non spécifiée"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Link
                          to={`/order/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Voir les détails
                        </Link>
                        {order.status === "completed" && (
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Noter la commande
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Favoris */}
          {activeTab === "favorites" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Mes Favoris
              </h2>
              <div className="text-center py-12">
                <Heart size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun favori
                </h3>
                <p className="text-gray-500 mb-4">
                  Ajoutez des produits à vos favoris pour les retrouver
                  facilement
                </p>
                <Link
                  to="/products"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Explorer les produits
                </Link>
              </div>
            </div>
          )}

          {/* Onglet Historique */}
          {activeTab === "history" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Historique des commandes
              </h2>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <History size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun historique de commande</p>
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
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Statut
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            #{order.id.slice(0, 8)}
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
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/order/${order.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Détails
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
