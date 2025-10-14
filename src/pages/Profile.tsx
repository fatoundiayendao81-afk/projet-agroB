// pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import userService from "../services/userService";
import approvalService from "../services/approvalService";
import type {
  Product,
  Order,
  User,
  ProductApproval,
  OrderApproval,
  Stats,
} from "../types";
// Ajoutez ces imports si ce n'est pas déjà fait
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
  FileCheck, // Ajoutez celui-ci si manquant
} from "lucide-react";
import ApprovalsTab from "../components/ApprovalsTab";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  farmName: string;
  description: string;
}

interface ExtendedStats extends Stats {
  pendingProductApprovals: number;
  pendingOrderApprovals: number;
  myPendingApprovals: number;
}

const Profile: React.FC = () => {
  // Ajoutez cette fonction si ce n'est pas déjà fait
  // (Supprimé car doublon plus bas)

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
  const [myProductApprovals, setMyProductApprovals] = useState<
    ProductApproval[]
  >([]);
  const [myOrderApprovals, setMyOrderApprovals] = useState<OrderApproval[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const [stats, setStats] = useState<ExtendedStats>({
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
    pendingProductApprovals: 0,
    pendingOrderApprovals: 0,
    myPendingApprovals: 0,
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
        const [orders, orderApprovals] = await Promise.all([
          orderService.getUserOrders(currentUser.id),
          approvalService.getClientOrderApprovals(currentUser.id),
        ]);
        setUserOrders(orders || []);
        setMyOrderApprovals(orderApprovals || []);
        calculateClientStats(orders || [], orderApprovals || []);
      } else if (isProducer() && currentUser) {
        const [products, productApprovals] = await Promise.all([
          productService.getUserProducts(currentUser.id),
          approvalService.getProducerProductApprovals(currentUser.id),
        ]);
        setUserProducts(products || []);
        setMyProductApprovals(productApprovals || []);
        calculateProducerStats(products || [], productApprovals || []);
      } else if (isAdmin()) {
        const [products, orders, users, approvalStats] = await Promise.all([
          productService.getProducts(),
          orderService.getAllOrders(),
          userService.getAllUsers(),
          approvalService.getApprovalStats(),
        ]);

        setAllProducts(products || []);
        setAllOrders(orders || []);
        setAllUsers(users || []);
        calculateAdminStats(
          products || [],
          orders || [],
          users || [],
          approvalStats
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const calculateClientStats = (
    orders: Order[],
    orderApprovals: OrderApproval[]
  ): void => {
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

    const myPendingApprovals = orderApprovals.filter(
      (a) => a.status === "pending"
    ).length;

    setStats((prev) => ({
      ...prev,
      ordersCount,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      shippedOrders,
      totalSales,
      myPendingApprovals,
    }));
  };

  const calculateProducerStats = (
    products: Product[],
    productApprovals: ProductApproval[]
  ): void => {
    const productsCount = products.length;
    const pendingProducts = products.filter(
      (p) => p.status === "pending"
    ).length;
    const approvedProducts = products.filter(
      (p) => p.status === "approved"
    ).length;

    const myPendingApprovals = productApprovals.filter(
      (a) => a.status === "pending"
    ).length;

    setStats((prev) => ({
      ...prev,
      productsCount,
      pendingProducts,
      completedOrders: approvedProducts,
      myPendingApprovals,
    }));
  };

  interface ApprovalStats {
    pendingProductApprovals: number;
    pendingOrderApprovals: number;
    totalApprovals: number;
  }

  const calculateAdminStats = (
    products: Product[],
    orders: Order[],
    users: User[],
    approvalStats: ApprovalStats
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
      pendingProductApprovals: approvalStats.pendingProductApprovals,
      pendingOrderApprovals: approvalStats.pendingOrderApprovals,
      myPendingApprovals: approvalStats.totalApprovals,
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

  const handleAddProduct = async (): Promise<void> => {
    if (isProducer() && currentUser) {
      // Rediriger vers la page d'ajout de produit
      window.location.href = "/add-product";
    } else if (isAdmin()) {
      window.location.href = "/add-product";
    }
  };

  const handleEditProduct = (productId: string): void => {
    if (isProducer() && currentUser) {
      // Pour les producteurs, la modification passe par le système d'approbation
      window.location.href = `/edit-product/${productId}`;
    } else if (isAdmin()) {
      // Les admins peuvent modifier directement
      window.location.href = `/edit-product/${productId}`;
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (!currentUser) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        if (isProducer()) {
          // Pour les producteurs, créer une demande d'approbation
          const approval = await productService.deleteProduct(productId);
          // Use the approval variable here
          console.log(approval);
          setMessage({
            type: "success",
            text: "Demande de suppression soumise pour approbation",
          });
          loadRoleSpecificData();
        } else if (isAdmin()) {
          // Les admins peuvent supprimer directement
          await productService.adminDeleteProduct(productId);
          setMessage({
            type: "success",
            text: "Produit supprimé avec succès !",
          });
          loadRoleSpecificData();
        }
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
    if (!currentUser) return;

    try {
      if (status === "cancelled" && isClient()) {
        // Pour les clients, l'annulation passe par le système d'approbation
        const approval = await orderService.cancelOrder(
          orderId,
          "Annulation demandée par le client",
          currentUser.id
        );
        // Use the approval variable here
        console.log(approval);
        setMessage({
          type: "success",
          text: "Demande d'annulation soumise pour approbation",
        });
        loadRoleSpecificData();
      } else if (isAdmin()) {
        // Les admins peuvent modifier directement le statut
        await orderService.updateOrderStatus(orderId, status);
        setMessage({
          type: "success",
          text: `Statut de commande mis à jour: ${status}`,
        });
        loadRoleSpecificData();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          (error as Error).message || "Erreur lors de la mise à jour du statut",
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

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente de validation";
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      default:
        return status;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

              {/* Badge pour les approbations en attente */}
              {(isProducer() || isClient()) && stats.myPendingApprovals > 0 && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Clock size={14} className="mr-1" />
                  {stats.myPendingApprovals} demande(s) en attente de validation
                </div>
              )}
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
                      {
                        id: "approvals",
                        label: "Validations",
                        icon: FileCheck,
                      },
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
                      {
                        id: "my-approvals",
                        label: "Mes Demandes",
                        icon: FileCheck,
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
                      {
                        id: "my-approvals",
                        label: "Mes Demandes",
                        icon: FileCheck,
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
                  {(tab.id === "approvals" || tab.id === "my-approvals") &&
                    stats.myPendingApprovals > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {stats.myPendingApprovals}
                      </span>
                    )}
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

        {/* ONGLET APERÇU */}
        {!dataLoading && activeTab === "overview" && (
          <div className="space-y-8">
            {/* STATISTIQUES ADMIN */}
            {isAdmin() && (
              <>
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
                          Validations en attente
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.myPendingApprovals}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <FileCheck className="text-orange-600" size={24} />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {stats.pendingProductApprovals} produits •{" "}
                      {stats.pendingOrderApprovals} commandes
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
                      <div className="text-gray-700 font-medium">
                        En attente
                      </div>
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
              </>
            )}

            {/* STATISTIQUES PRODUCTEUR */}
            {isProducer() && (
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
                        Demandes en attente
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.myPendingApprovals}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FileCheck className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATISTIQUES CLIENT */}
            {isClient() && (
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
                      <p className="text-sm font-medium text-gray-600">
                        Livrées
                      </p>
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
                        Demandes en attente
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.myPendingApprovals}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FileCheck className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}
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

        {/* ONGLET VALIDATIONS - ADMIN */}
        {!dataLoading && activeTab === "approvals" && isAdmin() && (
          <ApprovalsTab
            currentUser={currentUser}
            onDataUpdate={loadRoleSpecificData}
          />
        )}

        {/* ONGLET MES DEMANDES - PRODUCTEUR/CLIENT */}
        {!dataLoading &&
          activeTab === "my-approvals" &&
          (isProducer() || isClient()) && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Mes Demandes de Validation
                </h3>

                {/* Demandes de produits pour les producteurs */}
                {isProducer() && (
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <Package size={20} />
                      Demandes de produits ({myProductApprovals.length})
                    </h4>

                    {myProductApprovals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileCheck
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>Aucune demande de produit en attente</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myProductApprovals.map((approval) => (
                          <div
                            key={approval.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold">
                                  {approval.action === "create" &&
                                    "Création de produit"}
                                  {approval.action === "update" &&
                                    "Modification de produit"}
                                  {approval.action === "delete" &&
                                    "Suppression de produit"}
                                </h5>
                                {approval.productData && (
                                  <p className="text-sm text-gray-600">
                                    Produit: {approval.productData.title}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Soumis le{" "}
                                  {new Date(
                                    approval.createdAt
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getApprovalStatusColor(
                                  approval.status
                                )}`}
                              >
                                {getApprovalStatusText(approval.status)}
                              </span>
                            </div>

                            {approval.reviewComment && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Commentaire de l'admin:</strong>{" "}
                                  {approval.reviewComment}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Demandes de commandes pour les clients */}
                {isClient() && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <ShoppingCart size={20} />
                      Demandes de commandes ({myOrderApprovals.length})
                    </h4>

                    {myOrderApprovals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileCheck
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>Aucune demande de commande en attente</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myOrderApprovals.map((approval) => (
                          <div
                            key={approval.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold">
                                  {approval.action === "create" &&
                                    "Nouvelle commande"}
                                  {approval.action === "cancel" &&
                                    "Annulation de commande"}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Commande: {approval.orderId}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Soumis le{" "}
                                  {new Date(
                                    approval.createdAt
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getApprovalStatusColor(
                                  approval.status
                                )}`}
                              >
                                {getApprovalStatusText(approval.status)}
                              </span>
                            </div>

                            {approval.reviewComment && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Commentaire de l'admin:</strong>{" "}
                                  {approval.reviewComment}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        {/* ONGLET COMMANDES - ADMIN */}
        {/* ONGLET COMMANDES - ADMIN */}
        {!dataLoading && activeTab === "orders" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Gestion des Commandes
                </h3>
                <span className="text-sm text-gray-500">
                  {allOrders.length} commande(s) • {stats.pendingOrders} en
                  attente
                </span>
              </div>
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
                              <button
                                onClick={() =>
                                  (window.location.href = `/order/${order.id}`)
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                Détails
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

        {/* ONGLET UTILISATEURS - ADMIN */}
        {!dataLoading && activeTab === "users" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Gestion des Utilisateurs
                </h3>
                <span className="text-sm text-gray-500">
                  {allUsers.length} utilisateur(s)
                </span>
              </div>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Actions
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
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {user.blocked ? (
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `Débloquer l'utilisateur ${user.name} ?`
                                      )
                                    ) {
                                      try {
                                        await userService.unblockUser(user.id);
                                        setMessage({
                                          type: "success",
                                          text: "Utilisateur débloqué avec succès",
                                        });
                                        loadRoleSpecificData();
                                      } catch {
                                        setMessage({
                                          type: "error",
                                          text: "Erreur lors du déblocage",
                                        });
                                      }
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 hover:bg-green-50 rounded"
                                >
                                  Débloquer
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `Bloquer l'utilisateur ${user.name} ?`
                                      )
                                    ) {
                                      try {
                                        await userService.blockUser(user.id);
                                        setMessage({
                                          type: "success",
                                          text: "Utilisateur bloqué avec succès",
                                        });
                                        loadRoleSpecificData();
                                      } catch {
                                        setMessage({
                                          type: "error",
                                          text: "Erreur lors du blocage",
                                        });
                                      }
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                                >
                                  Bloquer
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Supprimer définitivement l'utilisateur ${user.name} ?`
                                    )
                                  ) {
                                    try {
                                      await userService.deleteUser(user.id);
                                      setMessage({
                                        type: "success",
                                        text: "Utilisateur supprimé avec succès",
                                      });
                                      loadRoleSpecificData();
                                    } catch {
                                      setMessage({
                                        type: "error",
                                        text: "Erreur lors de la suppression",
                                      });
                                    }
                                  }
                                }}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium px-2 py-1 hover:bg-gray-50 rounded"
                              >
                                Supprimer
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

        {/* ONGLET PRODUITS - ADMIN */}
        {!dataLoading && activeTab === "products" && isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Gestion des Produits
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {allProducts.length} produit(s) • {stats.pendingProducts} en
                    attente
                  </span>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un produit
                  </button>
                </div>
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
                                onClick={() => handleEditProduct(product.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                              >
                                Supprimer
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
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {userProducts.length} produit(s) • {stats.pendingProducts}{" "}
                    en attente d'approbation
                  </span>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un produit
                  </button>
                </div>
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
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-green-600">
                            {product.price?.toLocaleString()} FCFA
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock || 0}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit size={16} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 size={16} />
                            Supprimer
                          </button>
                        </div>
                        {product.status === "pending" && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            ⏳ En attente de validation par l'administrateur
                          </div>
                        )}
                        {product.status === "rejected" && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                            ❌ Produit rejeté par l'administrateur
                          </div>
                        )}
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Mes Commandes
                </h3>
                <span className="text-sm text-gray-500">
                  {userOrders.length} commande(s) • {stats.pendingOrders} en
                  attente
                </span>
              </div>

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

                      {/* Articles de la commande */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Articles:
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{item.productName}</span>
                              <span>
                                {item.quantity} x {item.price?.toLocaleString()}{" "}
                                FCFA
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() =>
                            (window.location.href = `/order/${order.id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          Voir les détails
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            Demander l'annulation
                          </button>
                        )}
                        {order.status === "processing" && (
                          <div className="text-sm text-blue-600">
                            ✅ Commande confirmée et en préparation
                          </div>
                        )}
                        {order.status === "shipped" && (
                          <div className="text-sm text-orange-600">
                            🚚 Commande expédiée
                          </div>
                        )}
                        {order.status === "delivered" && (
                          <div className="text-sm text-green-600">
                            📦 Commande livrée
                          </div>
                        )}
                        {order.status === "cancelled" && (
                          <div className="text-sm text-red-600">
                            ❌ Commande annulée
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Les autres onglets (commandes, utilisateurs, produits, mes produits, mes commandes) restent similaires */}
        {/* ... Le code existant pour ces onglets ... */}
      </div>
    </div>
  );
};

export default Profile;
