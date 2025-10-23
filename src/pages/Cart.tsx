// pages/Cart.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../context/CartContext";
import CheckoutModal from "../components/CheckoutModal";
import Swal from "sweetalert2";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCartStore();
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const applyPromo = (): void => {
    if (promoCode === "SEN25") {
      setDiscount(0.25);
      Swal.fire({
        title: "🎉 Promotion appliquée !",
        text: "Félicitations ! Vous bénéficiez de -25% sur votre commande",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Super !",
        background: "#f0fdf4",
        color: "#065f46",
      });
    } else {
      Swal.fire({
        title: "Code invalide",
        text: "Le code promo que vous avez saisi n'est pas valide",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Réessayer",
        background: "#fef2f2",
        color: "#7f1d1d",
      });
      setDiscount(0);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Swal.fire({
      title: "Supprimer cet article ?",
      text: `"${itemName}" sera retiré de votre panier`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Conserver",
      background: "#f8fafc",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(itemId);
        Swal.fire({
          title: "Article supprimé",
          text: "L'article a été retiré de votre panier",
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          timer: 1500,
        });
      }
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    Swal.fire({
      title: "Vider tout le panier ?",
      text: "Cette action est irréversible et supprimera tous vos articles",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, tout vider",
      cancelButtonText: "Annuler",
      background: "#fef2f2",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          title: "Panier vidé",
          text: "Tous les articles ont été supprimés",
          icon: "info",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          timer: 1500,
        });
      }
    });
  };

  const handleUpdateQuantity = (
    itemId: string,
    newQuantity: number,
    itemName: string
  ) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId, itemName);
      return;
    }

    updateQuantity(itemId, newQuantity);
  };

  const total = getCartTotal();
  const totalAfterDiscount = total - total * discount;
  const discountAmount = total * discount;

  const handleGuestCheckout = (userData: {
    name: string;
    email: string;
    phone: string;
  }) => {
    localStorage.setItem("guestUser", JSON.stringify(userData));

    Swal.fire({
      title: "🎊 Commande confirmée !",
      text: "Préparation de votre commande en cours...",
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Continuer vers la livraison",
      background: "#f0fdf4",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then(() => {
      navigate("/livraison");
    });
  };

  const handleUserCheckout = () => {
    Swal.fire({
      title: "🎊 Commande confirmée !",
      text: "Redirection vers la livraison...",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      background: "#f0fdf4",
      customClass: {
        popup: "rounded-2xl",
      },
    }).then(() => {
      navigate("/livraison");
    });
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: "Votre panier est vide",
        text: "Découvrez nos produits populaires pour commencer vos achats",
        icon: "info",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Explorer la boutique",
        background: "#f0f9ff",
        customClass: {
          popup: "rounded-2xl",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/products");
        }
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête élégant */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg mb-4 transform rotate-3">
            <span className="text-3xl text-white">🛒</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-3">
            Mon Panier
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Votre sélection de produits - {cartItems.length} article
            {cartItems.length > 1 ? "s" : ""}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-16 text-center transform hover:scale-[1.02] transition-all duration-300">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-6xl">📭</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Panier vide
            </h2>
            <p className="text-slate-600 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
              Votre panier attend d'être rempli de merveilles. Explorez notre
              collection et trouvez l'inspiration !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/products")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <span className="text-xl">✨</span>
                <span>Découvrir la boutique</span>
              </button>
              <button
                onClick={() => navigate("/")}
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/50 flex items-center justify-center space-x-2"
              >
                <span>🏠</span>
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section articles - 2/3 de largeur */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                {/* En-tête du panier */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Vos Articles</h2>
                        <p className="text-green-100 opacity-90">
                          {cartItems.length} produit
                          {cartItems.length > 1 ? "s" : ""} sélectionné
                          {cartItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearCart}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 border border-white/30"
                    >
                      <span>🗑️</span>
                      <span>Vider</span>
                    </button>
                  </div>
                </div>

                {/* Liste des articles */}
                <div className="divide-y divide-slate-100/50">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-8 hover:bg-slate-50/50 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-emerald-700 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-2xl font-bold text-emerald-600 mb-1">
                              {item.price.toLocaleString()} FCFA
                            </p>
                            <p className="text-slate-500 text-sm">Unité</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          {/* Contrôle de quantité */}
                          <div className="flex flex-col items-center space-y-3">
                            <div className="flex items-center space-x-1 bg-slate-100 rounded-2xl p-2 border border-slate-200">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                    item.name
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 text-slate-600 hover:text-slate-800 hover:shadow-md"
                              >
                                <span className="text-lg font-bold">−</span>
                              </button>
                              <span className="font-bold text-slate-900 text-lg w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                    item.name
                                  )
                                }
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 text-slate-600 hover:text-slate-800 hover:shadow-md"
                              >
                                <span className="text-lg font-bold">+</span>
                              </button>
                            </div>
                          </div>

                          {/* Prix total et actions */}
                          <div className="text-right min-w-[140px]">
                            <p className="font-bold text-slate-900 text-2xl mb-2">
                              {(item.price * item.quantity).toLocaleString()}{" "}
                              FCFA
                            </p>
                            <button
                              onClick={() =>
                                handleRemoveItem(item.id, item.name)
                              }
                              className="text-red-500 hover:text-red-600 font-medium transition-all duration-200 flex items-center justify-end space-x-2 group/remove"
                            >
                              <span className="w-8 h-8 flex items-center justify-center bg-red-50 group-hover/remove:bg-red-100 rounded-lg transition-colors">
                                ✕
                              </span>
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section résumé - 1/3 de largeur */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Code promo */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-3 flex items-center space-x-2">
                    <span>🎁</span>
                    <span>Code Promo</span>
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Saisir votre code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full border border-white/30 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      onClick={applyPromo}
                      className="w-full bg-white text-blue-600 hover:bg-slate-100 font-bold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Appliquer la réduction
                    </button>
                  </div>
                  {discount > 0 && (
                    <div className="mt-3 p-3 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                      <p className="text-sm font-semibold text-center">
                        🎉 Promotion de {discount * 100}% appliquée !
                      </p>
                    </div>
                  )}
                </div>

                {/* Résumé de commande */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                  <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center space-x-2">
                    <span>🧾</span>
                    <span>Résumé de commande</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        Sous-total ({cartItems.length} article
                        {cartItems.length > 1 ? "s" : ""})
                      </span>
                      <span className="font-semibold">
                        {total.toLocaleString()} FCFA
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600 bg-green-50 rounded-xl p-3 border border-green-200">
                        <span className="font-semibold">Économies</span>
                        <span className="font-bold">
                          -{discountAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-slate-800">
                          Total TTC
                        </span>
                        <span className="font-bold text-emerald-600 text-2xl">
                          {totalAfterDiscount.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Économies */}
                    {discount > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex items-center justify-between text-amber-800">
                          <span className="font-semibold">Vous économisez</span>
                          <span className="font-bold text-lg">
                            {discountAmount.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 mt-8">
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                    >
                      <span className="text-xl">🚀</span>
                      <span className="text-lg">Finaliser la commande</span>
                    </button>

                    <button
                      onClick={handleContinueShopping}
                      className="w-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold py-4 rounded-2xl transition-all duration-300 hover:bg-white/50 flex items-center justify-center space-x-2"
                    >
                      <span>←</span>
                      <span>Continuer mes achats</span>
                    </button>
                  </div>

                  {/* Garanties */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="text-slate-600">
                        <div className="text-2xl mb-1">🚚</div>
                        <div className="text-xs font-medium">
                          Livraison Rapide
                        </div>
                      </div>
                      <div className="text-slate-600">
                        <div className="text-2xl mb-1">🔒</div>
                        <div className="text-xs font-medium">
                          Paiement Sécurisé
                        </div>
                      </div>
                      <div className="text-slate-600">
                        <div className="text-2xl mb-1">↩️</div>
                        <div className="text-xs font-medium">Retour Facile</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onGuestCheckout={handleGuestCheckout}
          onUserCheckout={handleUserCheckout}
        />
      </div>
    </div>
  );
};

export default Cart;
