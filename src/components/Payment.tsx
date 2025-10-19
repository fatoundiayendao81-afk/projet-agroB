// pages/Payment.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";
import Swal from "sweetalert2";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { getCartTotal, cartItems, clearCart } = useCartStore();
  const { currentUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const deliveryFee = 2000;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee - discount;

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case "livraison":
        return "Paiement à la livraison";
      case "wave":
        return "Paiement via Wave";
      case "carte":
        return "Paiement par carte bancaire";
      default:
        return method;
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!paymentMethod) {
      Swal.fire({
        title: "Mode de paiement requis",
        text: "Veuillez sélectionner un mode de paiement pour continuer.",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return;
    }

    // Récupérer les données de livraison
    const shippingAddress = localStorage.getItem("shippingAddress");
    const guestUser = localStorage.getItem("guestUser");

    if (!shippingAddress) {
      Swal.fire({
        title: "Adresse manquante",
        text: "Veuillez compléter l'adresse de livraison",
        icon: "error",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      navigate("/livraison");
      return;
    }

    const shippingData = JSON.parse(shippingAddress);
    const guestData = guestUser ? JSON.parse(guestUser) : null;

    // Afficher la confirmation de commande
    const result = await Swal.fire({
      title: "Confirmer la commande ?",
      html: `
        <div class="text-left">
          <p><strong>Mode de paiement :</strong> ${getPaymentMethodLabel(
            paymentMethod
          )}</p>
          <p><strong>Adresse :</strong> ${shippingData.rue}, ${
        shippingData.adresse || ""
      }</p>
          <p><strong>Total :</strong> ${total.toLocaleString()} CFA</p>
          <p class="text-sm text-gray-600 mt-2">Vous recevrez un email de confirmation.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, confirmer la commande",
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setIsProcessing(true);

      // Simuler le traitement du paiement
      Swal.fire({
        title: "Traitement en cours...",
        text: "Création de votre commande",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Créer la commande dans la base de données
        const order = await orderService.createOrderFromCheckout({
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            sellerId: item.sellerId,
          })),
          total: total,
          shippingAddress: `${shippingData.rue}, ${
            shippingData.adresse || ""
          }, ${shippingData.prenom} ${shippingData.nom}`,
          paymentMethod: paymentMethod,
          userId: guestData ? "guest" : currentUser?.id,
          userName: guestData ? guestData.name : currentUser?.name,
          userEmail: guestData ? guestData.email : currentUser?.email,
        });

        // Vider le panier après commande réussie
        clearCart();

        // Supprimer les données temporaires
        localStorage.removeItem("guestUser");
        localStorage.removeItem("shippingAddress");

        Swal.fire({
          title: "✅ Commande créée !",
          html: `
            <div class="text-left">
              <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
              <p><strong>Total :</strong> ${order.total.toLocaleString()} CFA</p>
              <p class="text-sm text-gray-600 mt-2">Votre commande a été enregistrée avec succès.</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#16a34a",
          confirmButtonText: "Voir la confirmation",
        }).then(() => {
          navigate("/confirmation", {
            state: {
              paymentMethod,
              total,
              orderNumber: order.orderNumber,
              orderId: order.id,
            },
          });
        });
      } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        Swal.fire({
          title: "❌ Erreur",
          text: "Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.",
          icon: "error",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const applyPromo = (): void => {
    const code = promoCode.trim().toLowerCase();

    if (code === "promo10") {
      setDiscount(1000);
      Swal.fire({
        title: "🎉 Code promo appliqué !",
        text: "Une réduction de 1 000 CFA a été appliquée à votre commande",
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Super !",
      });
    } else if (code === "sen25") {
      const discountAmount = Math.floor(subtotal * 0.25);
      setDiscount(discountAmount);
      Swal.fire({
        title: "🎉 Code promo appliqué !",
        text: `Une réduction de 25% (${discountAmount.toLocaleString()} CFA) a été appliquée`,
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Super !",
      });
    } else if (code === "livraison") {
      setDiscount(deliveryFee);
      Swal.fire({
        title: "🎉 Code promo appliqué !",
        text: "La livraison vous est offerte !",
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Super !",
      });
    } else {
      Swal.fire({
        title: "❌ Code invalide",
        text: "Le code promo que vous avez saisi n'est pas valide",
        icon: "error",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Réessayer",
      });
      setDiscount(0);
    }
  };

  const handleBackToDelivery = () => {
    Swal.fire({
      title: "Retour à la livraison ?",
      text: "Vous pourrez modifier votre adresse de livraison",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, modifier",
      cancelButtonText: "Rester ici",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/livraison");
      }
    });
  };

  const handlePromoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPromo();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="flex justify-center items-center py-6 border-b bg-white shadow-sm">
        <ul className="flex items-center space-x-4 md:space-x-8 text-gray-600 font-medium text-sm md:text-base">
          <li className="flex items-center">
            <span className="text-green-600 font-semibold">1</span>&nbsp;Panier
          </li>
          <li className="text-gray-400">──────</li>
          <li className="flex items-center">
            <span className="text-green-600 font-semibold">2</span>
            &nbsp;Livraison
          </li>
          <li className="text-gray-400">──────</li>
          <li className="flex items-center text-green-700 font-semibold">
            <span className="text-green-600">3</span>&nbsp;Paiement
          </li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            💳 Choix du mode de paiement
          </h2>

          <p className="text-gray-600 mb-6">
            PAYER COMPTANT À LA LIVRAISON ou via{" "}
            <b className="text-green-600">WAVE</b> /{" "}
            <b className="text-orange-500">ORANGE MONEY</b>.
          </p>

          <div className="space-y-4">
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === "livraison"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="livraison"
                checked={paymentMethod === "livraison"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <span className="font-semibold text-gray-800">
                    Payer à la livraison
                  </span>
                  <p className="text-sm text-gray-600">
                    Espèces ou carte à la réception
                  </p>
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === "wave"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="wave"
                checked={paymentMethod === "wave"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌊</span>
                <div>
                  <span className="font-semibold text-gray-800">
                    Payer avec Wave
                  </span>
                  <p className="text-sm text-gray-600">
                    Paiement mobile sécurisé
                  </p>
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === "carte"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="carte"
                checked={paymentMethod === "carte"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <span className="font-semibold text-gray-800">
                    Payer par carte bancaire
                  </span>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, etc.
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleBackToDelivery}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              ← Retour à la livraison
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Résumé de la commande
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code promo
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="Entrez votre code promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                onKeyPress={handlePromoKeyPress}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              <button
                onClick={applyPromo}
                disabled={!promoCode.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-r-lg font-medium transition-colors"
              >
                Appliquer
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Codes disponibles: PROMO10, SEN25, LIVRAISON
            </p>
          </div>

          <div className="space-y-3 text-gray-700 mb-6">
            <div className="flex justify-between">
              <span>
                Sous-total ({cartItems.length} article
                {cartItems.length > 1 ? "s" : ""})
              </span>
              <span className="font-medium">
                {subtotal.toLocaleString()} CFA
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span className="font-medium">
                {deliveryFee.toLocaleString()} CFA
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Réduction</span>
                <span>-{discount.toLocaleString()} CFA</span>
              </div>
            )}
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-700">
                {total.toLocaleString()} CFA
              </span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethod}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
          >
            {isProcessing ? "Traitement en cours..." : "VALIDER MON PAIEMENT"}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <span>🔒</span>
              Paiement 100% sécurisé - SSL encrypté
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
