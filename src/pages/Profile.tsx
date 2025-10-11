import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import type { Product, Order } from "../types";

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
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    ordersCount: 0,
    pendingProducts: 0,
    totalSales: 0,
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
      if (isClient() && currentUser) {
        const orders = await orderService.getUserOrders(currentUser.id);
        setUserOrders(orders || []);
        setStats((prev) => ({ ...prev, ordersCount: orders?.length || 0 }));
      } else if (isProducer() && currentUser) {
        const products = await productService.getUserProducts(currentUser.id);
        setUserProducts(products || []);

        const pendingCount =
          products?.filter((p: Product) => p.status === "pending").length || 0;
        setStats((prev) => ({
          ...prev,
          productsCount: products?.length || 0,
          pendingProducts: pendingCount,
        }));
      } else if (isAdmin()) {
        const allProducts = await productService.getProducts();
        const pendingCount =
          allProducts?.filter((p: Product) => p.status === "pending").length ||
          0;

        const allOrders = await orderService.getAllOrders();
        const totalSales =
          allOrders?.reduce(
            (sum: number, order: Order) => sum + (order.total || 0),
            0
          ) || 0;

        setStats((prev) => ({
          ...prev,
          productsCount: allProducts?.length || 0,
          ordersCount: allOrders?.length || 0,
          pendingProducts: pendingCount,
          totalSales: totalSales,
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
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
          text: "Erreur lors de la suppression du produit",
        });
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Non connecté
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre profil
          </p>
        </div>
      </div>
    );
  }

  // ===== RENDU PRINCIPAL DU COMPOSANT =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Mon Profil
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
              <span className="text-xl mr-3">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === COLONNE GAUCHE - INFORMATIONS DU PROFIL === */}
          <div className="lg:col-span-2 space-y-8">
            {/* FORMULAIRE DE PROFIL */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Informations personnelles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <span>📝</span>
                        Nom complet
                      </span>
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
                      <span className="flex items-center gap-2">
                        <span>📧</span>
                        Adresse email
                      </span>
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
                      <span className="flex items-center gap-2">
                        <span>📞</span>
                        Téléphone
                      </span>
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
                      <span className="flex items-center gap-2">
                        <span>🏠</span>
                        Adresse
                      </span>
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
                </div>
              </div>

              {/* INFORMATIONS DE L'EXPLOITATION (PRODUCTEURS) */}
              {isProducer() && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                    Informations de l'exploitation
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <span>🏡</span>
                          Nom de l'exploitation
                        </span>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <span>📄</span>
                          Description
                        </span>
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
                  </div>
                </div>
              )}

              {/* BOUTONS D'ACTION */}
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
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Sauvegarder
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span>❌</span>
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>✏️</span>
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>

            {/* === SECTION SPÉCIFIQUE AU RÔLE === */}
            {isClient() && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Mes Commandes
                </h3>
                {userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            Commande #{order.id}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600">Total: {order.total}€</p>
                        <p className="text-sm text-gray-500">
                          Date:{" "}
                          {new Date(order.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucune commande pour le moment
                  </p>
                )}
              </div>
            )}

            {isProducer() && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Mes Produits
                  </h3>
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <span>➕</span>
                    Ajouter un produit
                  </button>
                </div>

                {userProducts.length > 0 ? (
                  <div className="space-y-4">
                    {userProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{product.title}</h4>
                            <p className="text-gray-600">{product.price}€</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : product.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status || "En attente"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucun produit publié pour le moment
                  </p>
                )}
              </div>
            )}
          </div>

          {/* === COLONNE DROITE - STATISTIQUES ET ACTIONS RAPIDES === */}
          <div className="space-y-8">
            {/* STATISTIQUES DU COMPTE */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Statistiques
              </h3>

              <div className="space-y-4">
                {isClient() && (
                  <>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="text-gray-700 font-medium">Commandes</div>
                      <div className="text-xl font-bold text-blue-600">
                        {stats.ordersCount}
                      </div>
                    </div>
                  </>
                )}

                {isProducer() && (
                  <>
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl mb-2">📦</div>
                      <div className="text-gray-700 font-medium">Produits</div>
                      <div className="text-xl font-bold text-green-600">
                        {stats.productsCount}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="text-2xl mb-2">⏳</div>
                      <div className="text-gray-700 font-medium">
                        En attente
                      </div>
                      <div className="text-xl font-bold text-yellow-600">
                        {stats.pendingProducts}
                      </div>
                    </div>
                  </>
                )}

                {isAdmin() && (
                  <>
                    <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl mb-2">📦</div>
                      <div className="text-gray-700 font-medium">
                        Produits total
                      </div>
                      <div className="text-xl font-bold text-purple-600">
                        {stats.productsCount}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="text-gray-700 font-medium">Commandes</div>
                      <div className="text-xl font-bold text-blue-600">
                        {stats.ordersCount}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="text-2xl mb-2">⏳</div>
                      <div className="text-gray-700 font-medium">
                        En attente
                      </div>
                      <div className="text-xl font-bold text-yellow-600">
                        {stats.pendingProducts}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="text-gray-700 font-medium">
                        Chiffre d'affaires
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {stats.totalSales}€
                      </div>
                    </div>
                  </>
                )}

                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-gray-700 font-medium">
                    Dernière connexion
                  </div>
                  <div className="text-sm font-bold text-gray-600">
                    {currentUser.lastLogin
                      ? new Date(currentUser.lastLogin).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Jamais"}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS RAPIDES */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Actions Rapides
              </h3>

              <div className="space-y-3">
                {isClient() && (
                  <>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      📋 Voir mes commandes
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      ❓ Contacter le support
                    </button>
                  </>
                )}

                {isProducer() && (
                  <>
                    <button
                      onClick={handleAddProduct}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      ➕ Ajouter un produit
                    </button>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      📊 Voir les statistiques
                    </button>
                  </>
                )}

                {isAdmin() && (
                  <>
                    <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      👥 Gérer les utilisateurs
                    </button>
                    <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                      ⏳ Produits en attente
                    </button>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      📊 Tableau de bord
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { productService } from "../services/productService";
// import orderService from "../services/orderService";
// import type {Product, Order } from "../types";

// interface ProfileForm {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   farmName: string;
//   description: string;
// }

// interface Stats {
//   productsCount: number;
//   ordersCount: number;
//   pendingProducts: number;
//   totalSales: number;
// }

// const Profile: React.FC = () => {
//   const { currentUser, updateProfile, isClient, isProducer, isAdmin } =
//     useAuth();

//   const [profile, setProfile] = useState<ProfileForm>({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     farmName: "",
//     description: "",
//   });

//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [message, setMessage] = useState<{ type: string; text: string }>({
//     type: "",
//     text: "",
//   });

//   const [userProducts, setUserProducts] = useState<Product[]>([]);
//   const [userOrders, setUserOrders] = useState<Order[]>([]);
//   const [stats, setStats] = useState<Stats>({
//     productsCount: 0,
//     ordersCount: 0,
//     pendingProducts: 0,
//     totalSales: 0,
//   });

//   useEffect(() => {
//     if (currentUser) {
//       setProfile({
//         name: currentUser.name || "",
//         email: currentUser.email || "",
//         phone: currentUser.phone || "",
//         address: currentUser.address || "",
//         farmName: currentUser.farmName || "",
//         description: currentUser.description || "",
//       });

//       loadRoleSpecificData();
//     }
//   }, [currentUser]);

//   const loadRoleSpecificData = async (): Promise<void> => {
//     try {
//       if (isClient() && currentUser) {
//         const orders = await orderService.getUserOrders(currentUser.id);
//         setUserOrders(orders || []);
//         setStats((prev) => ({ ...prev, ordersCount: orders?.length || 0 }));
//       } else if (isProducer() && currentUser) {
//         const products = await productService.getUserProducts(currentUser.id);
//         setUserProducts(products || []);

//         const pendingCount =
//           products?.filter((p: Product) => p.status === "pending").length || 0;
//         setStats((prev) => ({
//           ...prev,
//           productsCount: products?.length || 0,
//           pendingProducts: pendingCount,
//         }));
//       } else if (isAdmin()) {
//         const allProducts = await productService.getProducts();
//         const pendingCount =
//           allProducts?.filter((p: Product) => p.status === "pending").length ||
//           0;

//         const allOrders = await orderService.getAllOrders();
//         const totalSales =
//           allOrders?.reduce(
//             (sum: number, order: Order) => sum + (order.total || 0),
//             0
//           ) || 0;

//         setStats((prev) => ({
//           ...prev,
//           productsCount: allProducts?.length || 0,
//           ordersCount: allOrders?.length || 0,
//           pendingProducts: pendingCount,
//           totalSales: totalSales,
//         }));
//       }
//     } catch (error) {
//       console.error("Erreur lors du chargement des données:", error);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ): void => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async (): Promise<void> => {
//     if (!isEditing) {
//       setIsEditing(true);
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       await updateProfile(profile);
//       setMessage({
//         type: "success",
//         text: "Profil mis à jour avec succès !",
//       });
//       setIsEditing(false);
//     } catch (error) {
//       setMessage({
//         type: "error",
//         text:
//           (error as Error).message || "Erreur lors de la mise à jour du profil",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = (): void => {
//     if (currentUser) {
//       setProfile({
//         name: currentUser.name || "",
//         email: currentUser.email || "",
//         phone: currentUser.phone || "",
//         address: currentUser.address || "",
//         farmName: currentUser.farmName || "",
//         description: currentUser.description || "",
//       });
//     }
//     setIsEditing(false);
//     setMessage({ type: "", text: "" });
//   };

//   const handleAddProduct = (): void => {
//     window.location.href = "/add-product";
//   };

//   const handleEditProduct = (productId: string): void => {
//     window.location.href = `/edit-product/${productId}`;
//   };

//   const handleDeleteProduct = async (productId: string): Promise<void> => {
//     if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
//       try {
//         await productService.deleteProduct(productId);
//         setMessage({ type: "success", text: "Produit supprimé avec succès !" });
//         loadRoleSpecificData();
//       } catch (error) {
//         setMessage({
//             type: "error",
//           text: "Erreur lors de la suppression du produit",
//         });
//       }
//     }
//   };

//   // === FONCTIONS DE REDIRECTION VERS LES DASHBOARDS ===
//   const goToAdminDashboard = (): void => {
//     window.location.href = "/admin-dashboard";
//   };

//   const goToProducerDashboard = (): void => {
//     window.location.href = "/producer-dashboard";
//   };

//   const goToClientDashboard = (): void => {
//     window.location.href = "/client-dashboard";
//   };

//   // Redirection automatique selon le rôle
//   useEffect(() => {
//     if (currentUser) {
//       if (isAdmin()) {
//         goToAdminDashboard();
//       } else if (isProducer()) {
//         goToProducerDashboard();
//       } else if (isClient()) {
//         goToClientDashboard();
//       }
//     }
//   }, [currentUser]);

//   if (!currentUser) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">🔒</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Non connecté
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Veuillez vous connecter pour accéder à votre profil
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Message de redirection pendant le chargement
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//       <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-2xl">
//             {isAdmin() ? "👨‍💼" : isProducer() ? "👨‍🌾" : "👤"}
//           </span>
//         </div>
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">
//           Redirection en cours...
//         </h2>
//         <p className="text-gray-600 mb-4">
//           {isAdmin() && "Redirection vers le tableau de bord administrateur"}
//           {isProducer() && "Redirection vers le tableau de bord producteur"}
//           {isClient() && "Redirection vers le tableau de bord client"}
//         </p>
//         <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>

//         {/* Bouton de secours si la redirection échoue */}
//         <div className="mt-6">
//           <button
//             onClick={() => {
//               if (isAdmin()) goToAdminDashboard();
//               else if (isProducer()) goToProducerDashboard();
//               else if (isClient()) goToClientDashboard();
//             }}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
//           >
//             Rediriger manuellement
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
