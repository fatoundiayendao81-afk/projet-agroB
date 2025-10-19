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
        title: "✅ Succès !",
        text: "Code promo appliqué : -25%",
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK"
      });
    } else {
      Swal.fire({
        title: "❌ Erreur",
        text: "Code promo invalide !",
        icon: "error",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK"
      });
      setDiscount(0);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: `Voulez-vous supprimer "${itemName}" de votre panier ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(itemId);
        Swal.fire({
          title: "✅ Supprimé !",
          text: "Le produit a été retiré de votre panier",
          icon: "success",
          confirmButtonColor: "#16a34a",
          confirmButtonText: "OK"
        });
      }
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    Swal.fire({
      title: "Vider le panier ?",
      text: "Cette action supprimera tous les articles de votre panier",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, vider le panier",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          title: "✅ Panier vidé",
          text: "Tous les articles ont été supprimés",
          icon: "success",
          confirmButtonColor: "#16a34a",
          confirmButtonText: "OK"
        });
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number, itemName: string) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId, itemName);
      return;
    }
    
    updateQuantity(itemId, newQuantity);
    
    // Afficher une notification pour les augmentations de quantité
    if (newQuantity > 1) {
      Swal.fire({
        title: "Quantité mise à jour",
        text: `Quantité de "${itemName}" : ${newQuantity}`,
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
        position: "top-end"
      });
    }
  };

  const total = getCartTotal();
  const totalAfterDiscount = total - total * discount;

  const handleGuestCheckout = (userData: { name: string; email: string; phone: string }) => {
    // Sauvegarder les données de l'invité
    localStorage.setItem('guestUser', JSON.stringify(userData));
    
    Swal.fire({
      title: "🛒 Passage en caisse",
      text: "Redirection vers la livraison...",
      icon: "success",
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Continuer",
      timer: 2000,
      showConfirmButton: true
    }).then(() => {
      navigate("/livraison");
    });
  };

  const handleUserCheckout = () => {
    Swal.fire({
      title: "🛒 Passage en caisse",
      text: "Redirection vers la livraison...",
      icon: "success",
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Continuer",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigate("/livraison");
    });
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: "🛒 Panier vide",
        text: "Votre panier est vide, ajoutez des produits avant de continuer",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Parcourir les produits"
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
    Swal.fire({
      title: "Continuer vos achats ?",
      text: "Vos articles resteront dans le panier",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, continuer",
      cancelButtonText: "Rester ici"
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/products");
      }
    });
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        🛒 Mon Panier
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl text-gray-500 mb-4">Votre panier est vide</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <p className="text-gray-500">{item.price.toLocaleString()} FCFA</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    −
                  </button>
                  <span className="font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {(item.price * item.quantity).toLocaleString()} FCFA
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="text-red-500 hover:text-red-600 text-sm transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Code promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={applyPromo}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Appliquer
              </button>
            </div>

            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              Vider le panier
            </button>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="space-y-2 text-right">
              <p className="text-lg font-medium text-gray-600">
                Sous-total :{" "}
                <span className="font-bold text-green-700">
                  {total.toLocaleString()} FCFA
                </span>
              </p>

              {discount > 0 && (
                <p className="text-sm text-gray-500">
                  Réduction {discount * 100}% : -{(total * discount).toLocaleString()}{" "}
                  FCFA
                </p>
              )}

              <p className="text-xl font-bold text-gray-800">
                Total :{" "}
                <span className="text-green-700">
                  {totalAfterDiscount.toLocaleString()} FCFA
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleContinueShopping}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Continuer mes achats
              </button>

              <button
                onClick={handleCheckoutClick}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Valider la commande
              </button>
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
  );
};

export default Cart;