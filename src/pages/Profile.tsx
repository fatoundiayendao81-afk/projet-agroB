// pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import userService from "../services/userService";
import type { Product, Order, User } from "../types";
import {
  Package,
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  UserCheck,
  AlertTriangle,
  Loader,
} from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  farmName: string;
  description: string;
}

interface Stats {
  productsCount: number;
  ordersCount: number;
  pendingProducts: number;
  totalSales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  totalUsers: number;
  totalProducers: number;
  totalClients: number;
}

const Profile: React.FC = () => {
  const { currentUser, updateProfile, isClient, isProducer, isAdmin } =
    useAuth();

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    farmName: "",
    description: "",
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    ordersCount: 0,
    pendingProducts: 0,
    totalSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    shippedOrders: 0,
    totalUsers: 0,
    totalProducers: 0,
    totalClients: 0,
  });

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        farmName: currentUser.farmName || "",
        description: currentUser.description || "",
      });

      loadRoleSpecificData();
    }
  }, [currentUser]);

  const loadRoleSpecificData = async (): Promise<void> => {
    try {
      setDataLoading(true);
      if (isClient() && currentUser) {
        const orders = await orderService.getUserOrders(currentUser.id);
        setUserOrders(orders || []);
        calculateClientStats(orders || []);
      } else if (isProducer() && currentUser) {
        const products = await productService.getUserProducts(currentUser.id);
        setUserProducts(products || []);
        calculateProducerStats(products || []);
      } else if (isAdmin()) {
        const [products, orders, users] = await Promise.all([
          productService.getProducts(),
          orderService.getAllOrders(),
          userService.getAllUsers(),
        ]);

        setAllProducts(products || []);
        setAllOrders(orders || []);
        setAllUsers(users || []);
        calculateAdminStats(products || [], orders || [], users || []);
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const calculateClientStats = (orders: Order[]): void => {
    const ordersCount = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const totalSales = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    setStats((prev) => ({
      ...prev,
      ordersCount,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      shippedOrders,
      totalSales,
    }));
  };

  const calculateProducerStats = (products: Product[]): void => {
    const productsCount = products.length;
    const pendingProducts = products.filter(
      (p) => p.status === "pending"
    ).length;
    const approvedProducts = products.filter(
      (p) => p.status === "approved"
    ).length;

    setStats((prev) => ({
      ...prev,
      productsCount,
      pendingProducts,
      completedOrders: approvedProducts,
    }));
  };

  const calculateAdminStats = (
    products: Product[],
    orders: Order[],
    users: User[]
  ): void => {
    const productsCount = products.length;
    const pendingProducts = products.filter(
      (p) => p.status === "pending"
    ).length;
    const ordersCount = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const totalSales = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const totalUsers = users.length;
    const totalProducers = users.filter((u) => u.role === "producer").length;
    const totalClients = users.filter((u) => u.role === "client").length;

    setStats({
      productsCount,
      ordersCount,
      pendingProducts,
      totalSales,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      shippedOrders,
      totalUsers,
      totalProducers,
      totalClients,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (): Promise<void> => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(profile);
      setMessage({
        type: "success",
        text: "Profil mis à jour avec succès !",
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          (error as Error).message || "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        farmName: currentUser.farmName || "",
        description: currentUser.description || "",
      });
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleAddProduct = (): void => {
    window.location.href = "/add-product";
  };

  const handleEditProduct = (productId: string): void => {
    window.location.href = `/edit-product/${productId}`;
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await productService.deleteProduct(productId);
        setMessage({ type: "success", text: "Produit supprimé avec succès !" });
        loadRoleSpecificData();
      } catch (error) {
        setMessage({
          type: "error",
          text:
            (error as Error).message ||
            "Erreur lors de la suppression du produit",
        });
      }
    }
  };

  const handleApproveProduct = async (productId: string): Promise<void> => {
    try {
      await productService.updateProductStatus(productId, "approved");
      setMessage({ type: "success", text: "Produit approuvé avec succès !" });
      loadRoleSpecificData();
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors de l'approbation du produit",
      });
    }
  };

  const handleRejectProduct = async (productId: string): Promise<void> => {
    try {
      await productService.updateProductStatus(productId, "rejected");
      setMessage({ type: "success", text: "Produit rejeté avec succès !" });
      loadRoleSpecificData();
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du rejet du produit",
      });
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  ): Promise<void> => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setMessage({
        type: "success",
        text: `Statut de commande mis à jour: ${status}`,
      });
      loadRoleSpecificData();
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors de la mise à jour du statut",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "processing":
        return <Clock className="text-blue-500" size={16} />;
      case "shipped":
        return <Truck className="text-orange-500" size={16} />;
      case "delivered":
        return <CheckCircle className="text-green-500" size={16} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
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
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const getProductStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      default:
        return status;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Non connecté
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre profil
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === EN-TÊTE DU PROFIL === */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl">
                {isAdmin() ? "👨‍💼" : isProducer() ? "👨‍🌾" : "👤"}
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentUser.name}
              </h1>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  isAdmin()
                    ? "bg-purple-100 text-purple-800"
                    : isProducer()
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <span className="mr-2">
                  {isAdmin() && "👨‍💼"}
                  {isProducer() && "👨‍🌾"}
                  {isClient() && "👤"}
                </span>
                {isAdmin() && "Administrateur"}
                {isProducer() && "Producteur"}
                {isClient() && "Client"}
              </div>
              <p className="text-gray-600">
                Membre depuis le{" "}
                <span className="font-medium">
                  {new Date(currentUser.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* === MESSAGES D'ALERTE === */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle className="mr-3" size={20} />
              ) : (
                <AlertTriangle className="mr-3" size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* === NAVIGATION PAR ONGLETS === */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: "overview", label: "Aperçu", icon: BarChart3 },
                { id: "profile", label: "Profil", icon: UserCheck },
                ...(isAdmin()
                  ? [
                      { id: "orders", label: "Commandes", icon: ShoppingCart },
                      { id: "users", label: "Utilisateurs", icon: Users },
                      { id: "products", label: "Produits", icon: Package },
                    ]
                  : []),
                ...(isProducer()
                  ? [
                      {
                        id: "my-products",
                        label: "Mes Produits",
                        icon: Package,
                      },
                    ]
                  : []),
                ...(isClient()
                  ? [
                      {
                        id: "my-orders",
                        label: "Mes Commandes",
                        icon: ShoppingCart,
                      },
                    ]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

        {/* === CONTENU DES ONGLETS === */}

        {/* INDICATEUR DE CHARGEMENT */}
        {dataLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-green-600 mr-3" size={24} />
            <span className="text-gray-600">Chargement des données...</span>
          </div>
        )}

        {/* ONGLET APERÇU - ADMIN */}
        {!dataLoading && activeTab === "overview" && isAdmin() && (
          <div className="space-y-8">
            {/* STATISTIQUES ADMIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Utilisateurs
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.totalProducers} producteurs • {stats.totalClients}{" "}
                  clients
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Produits
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.productsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.pendingProducts} en attente
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Commandes
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.ordersCount}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingCart className="text-purple-600" size={24} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.completedOrders} livrées
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Chiffre d'affaires
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSales.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* STATUT DES COMMANDES */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Statut des Commandes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-center mb-2">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                  <div className="text-gray-700 font-medium">En attente</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-center mb-2">
                    <Truck className="text-blue-600" size={24} />
                  </div>
                  <div className="text-gray-700 font-medium">Expédiées</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.shippedOrders}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-center mb-2">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div className="text-gray-700 font-medium">Livrées</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedOrders}
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex justify-center mb-2">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <div className="text-gray-700 font-medium">Annulées</div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cancelledOrders}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET APERÇU - PRODUCTEUR */}
        {!dataLoading && activeTab === "overview" && isProducer() && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Produits
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.productsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.pendingProducts} en attente d'approbation
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Produits Approuvés
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Ventes Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSales.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET APERÇU - CLIENT */}
        {!dataLoading && activeTab === "overview" && isClient() && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Commandes
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.ordersCount}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingCart className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      En attente
                    </p>
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
                      {stats.completedOrders}
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
                      Dépenses Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSales.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET PROFIL */}
        {!dataLoading && activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
                    rows={2}
                  />
                </div>
                {isProducer() && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'exploitation
                      </label>
                      <input
                        type="text"
                        name="farmName"
                        value={profile.farmName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={profile.description}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
                        rows={4}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Sauvegarder
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit size={20} />
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        )}

        {/* ONGLET COMMANDES - ADMIN */}
        {!dataLoading && activeTab === "orders" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Gestion des Commandes
              </h3>
              {allOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={48}
                    className="text-gray-400 mx-auto mb-4"
                  />
                  <p className="text-gray-500">Aucune commande trouvée</p>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            #{order.orderNumber || order.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4">
                            {order.userName || order.userEmail || "Client"}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(order.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {order.total?.toLocaleString()} FCFA
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order.id,
                                    e.target.value as
                                      | "pending"
                                      | "processing"
                                      | "shipped"
                                      | "delivered"
                                      | "cancelled"
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="pending">En attente</option>
                                <option value="processing">
                                  En traitement
                                </option>
                                <option value="shipped">Expédiée</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET UTILISATEURS - ADMIN */}
        {!dataLoading && activeTab === "users" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Gestion des Utilisateurs
              </h3>
              {allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Utilisateur
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Rôle
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Date d'inscription
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "producer"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role === "admin" && "Administrateur"}
                              {user.role === "producer" && "Producteur"}
                              {user.role === "client" && "Client"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(user.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.blocked
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.blocked ? "Bloqué" : "Actif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET PRODUITS - ADMIN */}
        {!dataLoading && activeTab === "products" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Gestion des Produits
                </h3>
                <span className="text-sm text-gray-500">
                  {allProducts.length} produit(s) • {stats.pendingProducts} en
                  attente
                </span>
              </div>
              {allProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Produit
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Producteur
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Prix
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Stock
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
                      {allProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || "/api/placeholder/40/40"}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/api/placeholder/40/40";
                                }}
                              />
                              <div>
                                <div className="font-medium">
                                  {product.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{product.sellerName}</td>
                          <td className="py-3 px-4 font-semibold">
                            {product.price?.toLocaleString()} FCFA
                          </td>
                          <td className="py-3 px-4">
                            {product.stock || 0} unités
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                product.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : product.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getProductStatusText(
                                product.status || "pending"
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {product.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveProduct(product.id)
                                    }
                                    className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 hover:bg-green-50 rounded"
                                  >
                                    Approuver
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectProduct(product.id)
                                    }
                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() =>
                                  (window.location.href = `/product/${product.id}`)
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                Voir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET MES PRODUITS - PRODUCTEUR */}
        {!dataLoading && activeTab === "my-products" && isProducer() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Mes Produits
                </h3>
                <button
                  onClick={handleAddProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Ajouter un produit
                </button>
              </div>

              {userProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre premier produit
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un produit
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.image || "/api/placeholder/300/200"}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/300/200";
                        }}
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
                            {getProductStatusText(product.status || "pending")}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {product.price?.toLocaleString()} FCFA
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Supprimer"
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
          </div>
        )}

        {/* ONGLET MES COMMANDES - CLIENT */}
        {!dataLoading && activeTab === "my-orders" && isClient() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Mes Commandes
              </h3>

              {userOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={48}
                    className="text-gray-400 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore passé de commande
                  </p>
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Découvrir les produits
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Commande #
                            {order.orderNumber || order.id.slice(0, 8)}
                          </h3>
                          <p className="text-gray-500">
                            Passée le{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
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
                            {order.items?.length || 0} article(s)
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
                        <button
                          onClick={() =>
                            (window.location.href = `/order/${order.id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Voir les détails
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Annuler la commande
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
