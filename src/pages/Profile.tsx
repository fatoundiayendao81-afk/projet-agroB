// pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import userService from "../services/userService";
import approvalService from "../services/approvalService";
import Swal from "sweetalert2";
import type {
  Product,
  Order,
  User,
  ProductApproval,
  OrderApproval,
  Stats,
} from "../types";

// Import des icônes Lucide React
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
  FileCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  Shield,
  Mail,
  Phone,
  MapPin,
  Store,
  Download,
  Search,
  Eye,
  Star,
  Calendar,
  Target,
  PieChart,
  Activity,
  Crop,
  UserCog,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";

// Components Tremor pour les graphiques
import {
  Card,
  Metric,
  Text,
  LineChart,
  BarChart,
  ProgressBar,
  Badge,
} from "@tremor/react";
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
  monthlyGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
}

const Profile: React.FC = () => {
  const { currentUser, updateProfile, isClient, isProducer, isAdmin, logout } =
    useAuth();

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    farmName: "",
    description: "",
  });
  const generateSalesPath = (data: Array<{ sales: number }>) => {
    if (!data.length) return "";
    const maxY = Math.max(...data.map((d) => d.sales));
    const minY = Math.min(...data.map((d) => d.sales));

    return data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * 400;
        const y = 240 - ((point.sales - minY) / (maxY - minY)) * 200;
        return `${index === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  };

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
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    monthlyGrowth: 12.5,
    averageOrderValue: 45200,
    conversionRate: 3.2,
    customerSatisfaction: 94.2,
  });

  // Données simulées pour les graphiques
  const salesData = [
    { month: "Jan", sales: 1240000 },
    { month: "Fév", sales: 1850000 },
    { month: "Mar", sales: 1520000 },
    { month: "Avr", sales: 2180000 },
    { month: "Mai", sales: 1950000 },
    { month: "Jun", sales: 2640000 },
  ];

  const categoryData = [
    { name: "Légumes", value: 35 },
    { name: "Fruits", value: 25 },
    { name: "Produits Laitiers", value: 20 },
    { name: "Viandes", value: 15 },
    { name: "Autres", value: 5 },
  ];

  const performanceData = [
    { name: "Lun", value: 65 },
    { name: "Mar", value: 78 },
    { name: "Mer", value: 82 },
    { name: "Jeu", value: 75 },
    { name: "Ven", value: 88 },
    { name: "Sam", value: 92 },
    { name: "Dim", value: 70 },
  ];

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
      monthlyGrowth: 12.5,
      averageOrderValue: 45200,
      conversionRate: 3.2,
      customerSatisfaction: 94.2,
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
      window.location.href = "/add-product";
    } else if (isAdmin()) {
      window.location.href = "/add-product";
    }
  };

  const handleEditProduct = (productId: string): void => {
    if (isProducer() && currentUser) {
      window.location.href = `/edit-product/${productId}`;
    } else if (isAdmin()) {
      window.location.href = `/edit-product/${productId}`;
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (!currentUser) return;

    const result = await Swal.fire({
      title: "Supprimer le produit ?",
      text: "Êtes-vous sûr de vouloir supprimer ce produit ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        if (isProducer()) {
          const approval = await productService.deleteProduct(productId);
          console.log(approval);
          setMessage({
            type: "success",
            text: "Demande de suppression soumise pour approbation",
          });
        } else if (isAdmin()) {
          await productService.adminDeleteProduct(productId);
          setMessage({
            type: "success",
            text: "Produit supprimé avec succès !",
          });
        }

        loadRoleSpecificData();

        Swal.fire({
          title: "Succès",
          text: isProducer()
            ? "Votre demande de suppression a été envoyée pour approbation."
            : "Le produit a été supprimé avec succès.",
          icon: "success",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            (error as Error).message ||
            "Erreur lors de la suppression du produit",
        });

        Swal.fire({
          title: "Erreur",
          text:
            (error as Error).message ||
            "Une erreur est survenue lors de la suppression du produit.",
          icon: "error",
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
        const approval = await orderService.cancelOrder(
          orderId,
          "Annulation demandée par le client",
          currentUser.id
        );
        console.log(approval);
        setMessage({
          type: "success",
          text: "Demande d'annulation soumise pour approbation",
        });
        loadRoleSpecificData();
      } else if (isAdmin()) {
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

  const handleExportData = (type: string) => {
    Swal.fire({
      title: "Exportation des données",
      text: `Préparation de l'export ${type}...`,
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
    });
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fonctions de filtrage
  const filteredProducts = allProducts.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = allOrders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === EN-TÊTE DU PROFIL AVEC DESIGN AMÉLIORÉ === */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 opacity-5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="flex-shrink-0 relative">
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg">
                {isAdmin() ? "👨‍💼" : isProducer() ? "👨‍🌾" : "👤"}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isAdmin()
                      ? "bg-purple-500"
                      : isProducer()
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                >
                  <Shield className="text-white" size={12} />
                </div>
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentUser.name}
                  </h1>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold mb-3 shadow-sm ${
                      isAdmin()
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        : isProducer()
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
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
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                  <Calendar size={16} />
                  <span>
                    Membre depuis le{" "}
                    <span className="font-semibold">
                      {new Date(currentUser.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="max-w-xs truncate">
                      {currentUser.address}
                    </span>
                  </div>
                )}
                {currentUser.farmName && (
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-gray-400" />
                    <span>{currentUser.farmName}</span>
                  </div>
                )}
              </div>

              {/* Badge pour les approbations en attente */}
              {(isProducer() || isClient()) && stats.myPendingApprovals > 0 && (
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-medium shadow-sm">
                  <Clock size={16} className="mr-2" />
                  {stats.myPendingApprovals} demande(s) en attente de validation
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === MESSAGES D'ALERTE AMÉLIORÉS === */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
              message.type === "success"
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle className="mr-3 flex-shrink-0" size={20} />
              ) : (
                <AlertTriangle className="mr-3 flex-shrink-0" size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* === NAVIGATION PAR ONGLETS PROFESSIONNELLE === */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <nav className="flex space-x-1 overflow-x-auto">
              {[
                { id: "overview", label: "Tableau de Bord", icon: BarChart3 },
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
                  className={`flex items-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {(tab.id === "approvals" || tab.id === "my-approvals") &&
                    stats.myPendingApprovals > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {stats.myPendingApprovals}
                      </span>
                    )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* === CONTENU DES ONGLETS === */}

        {/* INDICATEUR DE CHARGEMENT PROFESSIONNEL */}
        {dataLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-gray-600 font-medium">
                Chargement des données...
              </span>
            </div>
          </div>
        )}

        {/* ONGLET TABLEAU DE BORD PROFESSIONNEL */}
        {!dataLoading && activeTab === "overview" && (
          <div className="space-y-8">
            {/* STATISTIQUES ADMIN AVEC TREMOR */}
            {isAdmin() && (
              <>
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-blue-100">
                          Utilisateurs Total
                        </Text>
                        <Metric className="text-white">
                          {stats.totalUsers}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <TrendingUp
                            size={16}
                            className="text-blue-200 mr-1"
                          />
                          <Text className="text-blue-200">
                            +{stats.monthlyGrowth}% ce mois
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Users className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-green-100">Produits</Text>
                        <Metric className="text-white">
                          {stats.productsCount}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <Package size={16} className="text-green-200 mr-1" />
                          <Text className="text-green-200">
                            {stats.pendingProducts} en attente
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Package className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-purple-100">Commandes</Text>
                        <Metric className="text-white">
                          {stats.ordersCount}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <ShoppingCart
                            size={16}
                            className="text-purple-200 mr-1"
                          />
                          <Text className="text-purple-200">
                            {stats.completedOrders} livrées
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <ShoppingCart className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-orange-100">
                          Chiffre d'Affaires
                        </Text>
                        <Metric className="text-white">
                          {(stats.totalSales / 1000000).toFixed(1)}M FCFA
                        </Metric>
                        <div className="flex items-center mt-2">
                          <DollarSign
                            size={16}
                            className="text-orange-200 mr-1"
                          />
                          <Text className="text-orange-200">
                            {stats.averageOrderValue.toLocaleString()} FCFA
                            moyenne
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <CreditCard className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* GRAPHIQUES ET ANALYTIQUES - DESIGN ULTRA MODERNE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique des ventes - Design premium */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-700/50 p-6 relative overflow-hidden">
                    {/* Effet de brillance */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          📈 Ventes Mensuelles
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Évolution du chiffre d'affaires
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/40 to-blue-500/40 backdrop-blur-sm rounded-2xl border border-green-400/50">
                        <TrendingUp size={20} className="text-white" />
                        <span className="font-bold text-white text-sm">
                          +{stats.monthlyGrowth}%
                        </span>
                      </div>
                    </div>

                    {/* Container graphique avec effet glass */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-600/40 p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10"></div>

                      {/* Graphique avec dégradé personnalisé */}
                      <div className="h-64 relative">
                        <LineChart
                          data={salesData}
                          index="month"
                          categories={["sales"]}
                          colors={["cyan"]}
                          valueFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}M FCFA`
                          }
                          className="h-64"
                        />

                        {/* Overlay avec dégradé pour la courbe */}
                        <div className="absolute inset-0 pointer-events-none">
                          <svg className="w-full h-full" viewBox="0 0 400 240">
                            <defs>
                              <linearGradient
                                id="lineGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="50%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>

                            {/* Recréer la ligne avec dégradé */}
                            <path
                              d={generateSalesPath(salesData)}
                              stroke="url(#lineGradient)"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Légende en bas */}
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Chiffre d'affaires</span>
                      </div>
                      <span>Dernières 12 mois</span>
                    </div>
                  </div>

                  {/* Graphique circulaire - Design premium avec camembert coloré */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-gray-700/50 p-6 relative overflow-hidden">
                    {/* Effet de brillance */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          🎯 Répartition Catégories
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Part de marché des produits
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 flex items-center justify-center">
                        <PieChart size={20} className="text-purple-400" />
                      </div>
                    </div>

                    {/* Container graphique avec effet glass */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-600/30 p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>

                      {/* Camembert personnalisé avec couleurs vives */}
                      <div className="h-64 flex items-center justify-center">
                        <div className="relative w-48 h-48">
                          {/* Camembert avec dégradés colorés */}
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full transform rotate-[-90deg]"
                          >
                            {/* Segment 1 - Vert */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#gradient1)"
                              strokeWidth="20"
                              strokeDasharray={`${
                                categoryData[0]?.value || 25
                              } ${100 - (categoryData[0]?.value || 25)}`}
                              strokeDashoffset="0"
                            />

                            {/* Segment 2 - Bleu */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#gradient2)"
                              strokeWidth="20"
                              strokeDasharray={`${
                                categoryData[1]?.value || 20
                              } ${100 - (categoryData[1]?.value || 20)}`}
                              strokeDashoffset={-(categoryData[0]?.value || 25)}
                            />

                            {/* Segment 3 - Jaune */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#gradient3)"
                              strokeWidth="20"
                              strokeDasharray={`${
                                categoryData[2]?.value || 15
                              } ${100 - (categoryData[2]?.value || 15)}`}
                              strokeDashoffset={
                                -(categoryData[0]?.value || 25) -
                                (categoryData[1]?.value || 20)
                              }
                            />

                            {/* Segment 4 - Rouge */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#gradient4)"
                              strokeWidth="20"
                              strokeDasharray={`${
                                categoryData[3]?.value || 10
                              } ${100 - (categoryData[3]?.value || 10)}`}
                              strokeDashoffset={
                                -(categoryData[0]?.value || 25) -
                                (categoryData[1]?.value || 20) -
                                (categoryData[2]?.value || 15)
                              }
                            />

                            {/* Segment 5 - Violet */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="url(#gradient5)"
                              strokeWidth="20"
                              strokeDasharray={`${
                                categoryData[4]?.value || 30
                              } ${100 - (categoryData[4]?.value || 30)}`}
                              strokeDashoffset={
                                -(categoryData[0]?.value || 25) -
                                (categoryData[1]?.value || 20) -
                                (categoryData[2]?.value || 15) -
                                (categoryData[3]?.value || 10)
                              }
                            />

                            {/* Définitions des dégradés */}
                            <defs>
                              <linearGradient
                                id="gradient1"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                              </linearGradient>

                              <linearGradient
                                id="gradient2"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#2563eb" />
                              </linearGradient>

                              <linearGradient
                                id="gradient3"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                              </linearGradient>

                              <linearGradient
                                id="gradient4"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#dc2626" />
                              </linearGradient>

                              <linearGradient
                                id="gradient5"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#7c3aed" />
                              </linearGradient>
                            </defs>

                            {/* Centre du camembert */}
                            <circle cx="50" cy="50" r="25" fill="#1f2937" />
                          </svg>

                          {/* Texte au centre */}
                          <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
                            <div className="text-center">
                              <div className="text-white text-lg font-bold">
                                100%
                              </div>
                              <div className="text-gray-400 text-xs">Total</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Légende des couleurs */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {categoryData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-lg flex-shrink-0 shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${
                                index === 0
                                  ? "#10b981, #059669"
                                  : index === 1
                                  ? "#3b82f6, #2563eb"
                                  : index === 2
                                  ? "#f59e0b, #d97706"
                                  : index === 3
                                  ? "#ef4444, #dc2626"
                                  : "#8b5cf6, #7c3aed"
                              })`,
                            }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-white font-bold text-sm">
                            {item.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* STATISTIQUES DÉTAILLÉES - DESIGN MODERNE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <Activity className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Commandes Actives
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {stats.pendingOrders + stats.shippedOrders}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <Target className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">
                          Taux de Conversion
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {stats.conversionRate}%
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <FileCheck className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-amber-100 text-sm font-medium">
                          Validations en Attente
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {stats.myPendingApprovals}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <Star className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-violet-100 text-sm font-medium">
                          Satisfaction Client
                        </p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {stats.customerSatisfaction}%
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* PERFORMANCE RAPIDE */}
                <Card className="rounded-2xl shadow-lg border-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Performance Hebdomadaire
                  </h3>
                  <BarChart
                    data={performanceData}
                    index="name"
                    categories={["value"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-72"
                  />
                </Card>
              </>
            )}

            {/* TABLEAU DE BORD PRODUCTEUR */}
            {isProducer() && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-green-100">Produits Total</Text>
                        <Metric className="text-white">
                          {stats.productsCount}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <Package size={16} className="text-green-200 mr-1" />
                          <Text className="text-green-200">
                            {stats.pendingProducts} en attente
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Package className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-blue-100">
                          Produits Approuvés
                        </Text>
                        <Metric className="text-white">
                          {stats.completedOrders}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <CheckCircle
                            size={16}
                            className="text-blue-200 mr-1"
                          />
                          <Text className="text-blue-200">
                            {(
                              (stats.completedOrders / stats.productsCount) *
                              100
                            ).toFixed(1)}
                            % de taux d'approbation
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <CheckCircle className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-orange-100">
                          Demandes en Attente
                        </Text>
                        <Metric className="text-white">
                          {stats.myPendingApprovals}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <Clock size={16} className="text-orange-200 mr-1" />
                          <Text className="text-orange-200">
                            En cours de traitement
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <FileCheck className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* PERFORMANCE DES PRODUITS */}
                <Card className="rounded-2xl shadow-lg border-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Performance des Produits
                  </h3>
                  <div className="space-y-4">
                    {userProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "/api/placeholder/40/40"}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {product.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {product.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {product.price?.toLocaleString()} FCFA
                            </p>
                            <p className="text-sm text-gray-600">
                              Stock: {product.stock}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              product.status === "approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : product.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {getProductStatusText(product.status || "pending")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* STATISTIQUES DE VENTES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-2xl shadow-lg border-0">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Statut des Produits
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Approuvés</span>
                          <span>{stats.completedOrders}</span>
                        </div>
                        <ProgressBar
                          value={
                            (stats.completedOrders / stats.productsCount) * 100
                          }
                          color="green"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>En attente</span>
                          <span>{stats.pendingProducts}</span>
                        </div>
                        <ProgressBar
                          value={
                            (stats.pendingProducts / stats.productsCount) * 100
                          }
                          color="yellow"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Activité Récente
                    </h4>
                    <div className="space-y-3">
                      {myProductApprovals.slice(0, 3).map((approval) => (
                        <div
                          key={approval.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              approval.status === "approved"
                                ? "bg-green-100 text-green-600"
                                : approval.status === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            <FileCheck size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {approval.action === "create"
                                ? "Nouveau produit"
                                : approval.action === "update"
                                ? "Modification produit"
                                : "Suppression produit"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {getApprovalStatusText(approval.status)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TABLEAU DE BORD CLIENT */}
            {isClient() && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-purple-100">Commandes Total</Text>
                        <Metric className="text-white">
                          {stats.ordersCount}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <ShoppingCart
                            size={16}
                            className="text-purple-200 mr-1"
                          />
                          <Text className="text-purple-200">
                            Historique complet
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <ShoppingCart className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-yellow-500 to-yellow-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-yellow-100">En Attente</Text>
                        <Metric className="text-white">
                          {stats.pendingOrders}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <Clock size={16} className="text-yellow-200 mr-1" />
                          <Text className="text-yellow-200">
                            En cours de traitement
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Clock className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-green-100">Livrées</Text>
                        <Metric className="text-white">
                          {stats.completedOrders}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <CheckCircle
                            size={16}
                            className="text-green-200 mr-1"
                          />
                          <Text className="text-green-200">
                            Commandes terminées
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <CheckCircle className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-orange-100">En Cours</Text>
                        <Metric className="text-white">
                          {stats.myPendingApprovals}
                        </Metric>
                        <div className="flex items-center mt-2">
                          <FileCheck
                            size={16}
                            className="text-orange-200 mr-1"
                          />
                          <Text className="text-orange-200">
                            Demandes en attente
                          </Text>
                        </div>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl">
                        <FileCheck className="text-white" size={32} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* DERNIÈRES COMMANDES */}
                <Card className="rounded-2xl shadow-lg border-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Dernières Commandes
                    </h3>
                    <button
                      onClick={() => handleExportData("commandes")}
                      className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                    >
                      <Download size={16} />
                      Exporter
                    </button>
                  </div>
                  <div className="space-y-4">
                    {userOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Commande #
                            {order.orderNumber || order.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            • {order.items?.length || 0} articles
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-green-600">
                            {order.total?.toLocaleString()} FCFA
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* RÉSUMÉ DES DÉPENSES */}
                <Card className="rounded-2xl shadow-lg border-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Vos Dépenses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <DollarSign
                        className="text-blue-600 mx-auto mb-2"
                        size={24}
                      />
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalSales?.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-gray-600">Total dépensé</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <ShoppingCart
                        className="text-green-600 mx-auto mb-2"
                        size={24}
                      />
                      <p className="text-2xl font-bold text-green-600">
                        {stats.ordersCount}
                      </p>
                      <p className="text-sm text-gray-600">Commandes totales</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <Star
                        className="text-purple-600 mx-auto mb-2"
                        size={24}
                      />
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.ordersCount > 0
                          ? (
                              stats.totalSales / stats.ordersCount
                            ).toLocaleString()
                          : 0}{" "}
                        FCFA
                      </p>
                      <p className="text-sm text-gray-600">
                        Moyenne par commande
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ONGLET PROFIL - VERSION AMÉLIORÉE */}
        {!dataLoading && activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800">
                Informations Personnelles
              </h3>
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Edit size={20} />
                    Modifier le profil
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations de base */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="+225 XX XX XX XX"
                    />
                  </div>
                  {isProducer() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'exploitation
                      </label>
                      <input
                        type="text"
                        name="farmName"
                        value={profile.farmName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Nom de votre ferme"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
                    rows={3}
                    placeholder="Votre adresse complète"
                  />
                </div>

                {isProducer() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de l'exploitation
                    </label>
                    <textarea
                      name="description"
                      value={profile.description}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
                      rows={4}
                      placeholder="Décrivez votre exploitation, vos méthodes de production, etc."
                    />
                  </div>
                )}
              </div>

              {/* Sidebar avec statistiques */}
              <div className="space-y-6">
                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Statistiques du Compte
                  </h4>
                  <div className="space-y-3">
                    {isProducer() && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Produits
                          </span>
                          <span className="font-semibold">
                            {stats.productsCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            En attente
                          </span>
                          <span className="font-semibold text-yellow-600">
                            {stats.pendingProducts}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Approuvés
                          </span>
                          <span className="font-semibold text-green-600">
                            {stats.completedOrders}
                          </span>
                        </div>
                      </>
                    )}
                    {isClient() && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Commandes
                          </span>
                          <span className="font-semibold">
                            {stats.ordersCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            En cours
                          </span>
                          <span className="font-semibold text-blue-600">
                            {stats.pendingOrders}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Livrées</span>
                          <span className="font-semibold text-green-600">
                            {stats.completedOrders}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Membre depuis
                      </span>
                      <span className="font-semibold">
                        {new Date(currentUser.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Actions Rapides
                  </h4>
                  <div className="space-y-2">
                    {isProducer() && (
                      <button
                        onClick={handleAddProduct}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Ajouter un produit
                      </button>
                    )}
                    <button
                      onClick={() => (window.location.href = "/settings")}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings size={16} />
                      Paramètres
                    </button>
                    <button
                      onClick={logout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </Card>
              </div>
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Mes Demandes de Validation
                  </h3>
                  <Badge
                    color={stats.myPendingApprovals > 0 ? "orange" : "green"}
                    size="lg"
                  >
                    {stats.myPendingApprovals} en attente
                  </Badge>
                </div>

                {/* Demandes de produits pour les producteurs */}
                {isProducer() && (
                  <Card className="rounded-2xl shadow-lg border-0 mb-6">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={20} />
                        Demandes de produits ({myProductApprovals.length})
                      </h4>

                      {myProductApprovals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileCheck
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                          />
                          <p className="text-gray-600">
                            Aucune demande de produit en attente
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myProductApprovals.map((approval) => (
                            <div
                              key={approval.id}
                              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-semibold text-gray-800">
                                    {approval.action === "create" &&
                                      "🆕 Création de produit"}
                                    {approval.action === "update" &&
                                      "✏️ Modification de produit"}
                                    {approval.action === "delete" &&
                                      "🗑️ Suppression de produit"}
                                  </h5>
                                  {approval.productData && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      <strong>Produit:</strong>{" "}
                                      {approval.productData.title}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500 mt-1">
                                    <Calendar
                                      size={14}
                                      className="inline mr-1"
                                    />
                                    Soumis le{" "}
                                    {new Date(
                                      approval.createdAt
                                    ).toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getApprovalStatusColor(
                                    approval.status
                                  )}`}
                                >
                                  {getApprovalStatusText(approval.status)}
                                </span>
                              </div>

                              {approval.reviewComment && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-700 flex items-start gap-2">
                                    <MessageSquare
                                      size={16}
                                      className="text-blue-600 mt-0.5 flex-shrink-0"
                                    />
                                    <span>
                                      <strong>Commentaire de l'admin:</strong>{" "}
                                      {approval.reviewComment}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Demandes de commandes pour les clients */}
                {isClient() && (
                  <Card className="rounded-2xl shadow-lg border-0">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Demandes de commandes ({myOrderApprovals.length})
                      </h4>

                      {myOrderApprovals.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileCheck
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                          />
                          <p className="text-gray-600">
                            Aucune demande de commande en attente
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myOrderApprovals.map((approval) => (
                            <div
                              key={approval.id}
                              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-semibold text-gray-800">
                                    {approval.action === "create" &&
                                      "🆕 Nouvelle commande"}
                                    {approval.action === "cancel" &&
                                      "❌ Annulation de commande"}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Référence:</strong>{" "}
                                    {approval.orderId}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    <Calendar
                                      size={14}
                                      className="inline mr-1"
                                    />
                                    Soumis le{" "}
                                    {new Date(
                                      approval.createdAt
                                    ).toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getApprovalStatusColor(
                                    approval.status
                                  )}`}
                                >
                                  {getApprovalStatusText(approval.status)}
                                </span>
                              </div>

                              {approval.reviewComment && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-700 flex items-start gap-2">
                                    <MessageSquare
                                      size={16}
                                      className="text-blue-600 mt-0.5 flex-shrink-0"
                                    />
                                    <span>
                                      <strong>Commentaire de l'admin:</strong>{" "}
                                      {approval.reviewComment}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

        {/* ONGLET COMMANDES - ADMIN */}
        {!dataLoading && activeTab === "orders" && isAdmin() && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Gestion des Commandes
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {allOrders.length} commande(s) • {stats.pendingOrders} en
                    attente
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Rechercher une commande..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                    />
                  </div>
                  <button
                    onClick={() => handleExportData("commandes")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={64}
                    className="text-gray-400 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune commande trouvée
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Aucune commande ne correspond à votre recherche"
                      : "Aucune commande n'a été passée pour le moment"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-l-xl">
                          Commande
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Client
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Date
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Total
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Statut
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-r-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart
                                  className="text-blue-600"
                                  size={16}
                                />
                              </div>
                              <span>
                                #{order.orderNumber || order.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.userName || "Client"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.userEmail}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "fr-FR"
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-green-600">
                              {order.total?.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="font-medium">
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
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
                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <Eye size={18} />
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Gestion des Utilisateurs
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {allUsers.length} utilisateur(s) • {stats.totalProducers}{" "}
                    producteurs • {stats.totalClients} clients
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                    />
                  </div>
                  <button
                    onClick={() => handleExportData("utilisateurs")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun utilisateur trouvé
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Aucun utilisateur ne correspond à votre recherche"
                      : "Aucun utilisateur inscrit"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-l-xl">
                          Utilisateur
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Email
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Rôle
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Date d'inscription
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Statut
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-r-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                                  user.role === "admin"
                                    ? "bg-purple-500"
                                    : user.role === "producer"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              >
                                {user.role === "admin" && <UserCog size={20} />}
                                {user.role === "producer" && <Crop size={20} />}
                                {user.role === "client" && <Users size={20} />}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.phone || "Aucun téléphone"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-900">{user.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : user.role === "producer"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {user.role === "admin" && "👨‍💼 Administrateur"}
                              {user.role === "producer" && "👨‍🌾 Producteur"}
                              {user.role === "client" && "👤 Client"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.blocked
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                              }`}
                            >
                              {user.blocked ? "🚫 Bloqué" : "✅ Actif"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
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
                                  className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Débloquer l'utilisateur"
                                >
                                  <CheckCircle size={18} />
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
                                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Bloquer l'utilisateur"
                                >
                                  <XCircle size={18} />
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
                                className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Supprimer l'utilisateur"
                              >
                                <Trash2 size={18} />
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Gestion des Produits
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {allProducts.length} produit(s) • {stats.pendingProducts} en
                    attente
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
                    />
                  </div>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Ajouter un produit
                  </button>
                  <button
                    onClick={() => handleExportData("produits")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Aucun produit ne correspond à votre recherche"
                      : "Aucun produit disponible"}
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Ajouter le premier produit
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-l-xl">
                          Produit
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Producteur
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Prix
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Stock
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Catégorie
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50">
                          Statut
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-r-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || "/api/placeholder/40/40"}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/api/placeholder/40/40";
                                }}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {product.title}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-900">
                              {product.sellerName}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-green-600">
                              {product.price?.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div
                              className={`font-medium ${
                                (product.stock || 0) > 10
                                  ? "text-green-600"
                                  : (product.stock || 0) > 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {product.stock || 0} unités
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                product.status === "approved"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : product.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {getProductStatusText(
                                product.status || "pending"
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {product.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveProduct(product.id)
                                    }
                                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approuver le produit"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectProduct(product.id)
                                    }
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Rejeter le produit"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditProduct(product.id)}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier le produit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer le produit"
                              >
                                <Trash2 size={18} />
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Mes Produits
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {userProducts.length} produit(s) • {stats.pendingProducts}{" "}
                    en attente d'approbation
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Ajouter un produit
                  </button>
                  <button
                    onClick={() => handleExportData("mes-produits")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                </div>
              </div>

              {userProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre premier produit
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Ajouter un produit
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white"
                    >
                      <div className="relative">
                        <img
                          src={product.image || "/api/placeholder/300/200"}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/300/200";
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              product.status === "approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : product.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {getProductStatusText(product.status || "pending")}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-green-600">
                            {product.price?.toLocaleString()} FCFA
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              (product.stock || 0) > 10
                                ? "text-green-600"
                                : (product.stock || 0) > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            Stock: {product.stock || 0}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Edit size={16} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} />
                            Supprimer
                          </button>
                        </div>
                        {product.status === "pending" && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 flex items-center gap-2">
                            <Clock size={14} />⏳ En attente de validation par
                            l'administrateur
                          </div>
                        )}
                        {product.status === "rejected" && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                            <XCircle size={14} />❌ Produit rejeté par
                            l'administrateur
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Mes Commandes
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {userOrders.length} commande(s) • {stats.pendingOrders} en
                    attente
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleExportData("mes-commandes")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter
                  </button>
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Nouvelle commande
                  </button>
                </div>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={64}
                    className="text-gray-400 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore passé de commande
                  </p>
                  <button
                    onClick={() => (window.location.href = "/products")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <ShoppingCart size={18} />
                    Découvrir les produits
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">
                            Commande #
                            {order.orderNumber || order.id.slice(0, 8)}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            Passée le{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            à{" "}
                            {new Date(order.createdAt).toLocaleTimeString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 lg:mt-0">
                          {getStatusIcon(order.status)}
                          <span className="font-semibold text-lg">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <CreditCard className="text-green-600" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Total</p>
                              <p className="text-lg font-bold text-green-600">
                                {order.total?.toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <Package className="text-blue-600" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Articles</p>
                              <p className="text-lg font-bold text-blue-600">
                                {order.items?.length || 0} article(s)
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="text-purple-600" size={20} />
                            <div>
                              <p className="text-sm text-gray-600">Livraison</p>
                              <p className="text-sm font-medium text-purple-600 line-clamp-1">
                                {order.shippingAddress ||
                                  "Adresse non spécifiée"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Articles de la commande */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Package size={18} />
                          Articles commandés:
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-800">
                                  {item.productName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-gray-900">
                                  {item.quantity} x{" "}
                                  {item.price?.toLocaleString()} FCFA
                                </span>
                                <div className="text-xs text-gray-500">
                                  Sous-total:{" "}
                                  {(
                                    item.quantity * (item.price || 0)
                                  ).toLocaleString()}{" "}
                                  FCFA
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            (window.location.href = `/order/${order.id}`)
                          }
                          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
                        >
                          <Eye size={18} />
                          Voir les détails
                        </button>
                        <div className="flex items-center gap-3">
                          {order.status === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "cancelled")
                              }
                              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 transition-colors"
                            >
                              <XCircle size={18} />
                              Demander l'annulation
                            </button>
                          )}
                          {order.status === "processing" && (
                            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                              <CheckCircle size={16} />✅ Commande confirmée et
                              en préparation
                            </div>
                          )}
                          {order.status === "shipped" && (
                            <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-2">
                              <Truck size={16} />
                              🚚 Commande expédiée
                            </div>
                          )}
                          {order.status === "delivered" && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-2">
                              <CheckCircle size={16} />
                              📦 Commande livrée
                            </div>
                          )}
                          {order.status === "cancelled" && (
                            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center gap-2">
                              <XCircle size={16} />❌ Commande annulée
                            </div>
                          )}
                        </div>
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
