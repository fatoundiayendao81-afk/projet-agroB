import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../context/CartContext";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { getCartTotal, cartItems } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);

  const deliveryFee = 2000;
  const total = getCartTotal() + deliveryFee - discount;

  const handlePayment = (): void => {
    if (!paymentMethod) {
      alert("Veuillez sélectionner un mode de paiement.");
      return;
    }

    navigate("/confirmation", {
      state: {
        paymentMethod,
        total,
      },
    });
  };

  const applyPromo = (): void => {
    if (promoCode.trim().toLowerCase() === "promo10") {
      setDiscount(1000);
      alert("Code promo appliqué avec succès !");
    } else {
      alert("Code promo invalide !");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="flex justify-center items-center py-6 border-b bg-white">
        <ul className="flex items-center space-x-8 text-gray-600 font-medium">
          <li className="flex items-center">
            <span className="text-green-600 font-semibold">1</span>&nbsp;Panier
          </li>
          <li>──────</li>
          <li className="flex items-center">
            <span className="text-green-600 font-semibold">2</span>&nbsp;Mode de
            livraison
          </li>
          <li>──────</li>
          <li className="flex items-center text-green-700 font-semibold">
            <span className="text-green-600">3</span>&nbsp;Paiement
          </li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💳 Choix du mode de paiement
          </h2>

          <p className="text-gray-600 mb-4">
            PAYER COMPTANT À LA LIVRAISON ou via <b>WAVE</b> /{" "}
            <b>ORANGE MONEY</b>.
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="livraison"
                checked={paymentMethod === "livraison"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💵 Payer à la livraison</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="wave"
                checked={paymentMethod === "wave"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>🌊 Payer avec Wave</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="carte"
                checked={paymentMethod === "carte"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Payer par carte bancaire</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Résumé</h3>

          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Entrez votre code promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={applyPromo}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg font-medium transition"
            >
              Ajouter
            </button>
          </div>

          <div className="space-y-2 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>
                Sous-total ({cartItems.length} article
                {cartItems.length > 1 ? "s" : ""})
              </span>
              <span>{getCartTotal().toLocaleString()} CFA</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{deliveryFee.toLocaleString()} CFA</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Réduction</span>
                <span>-{discount.toLocaleString()} CFA</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{total.toLocaleString()} CFA</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02]"
          >
            VALIDER MON PAIEMENT
          </button>

          <p className="text-xs text-center text-gray-500 mt-2">
            🔒 Paiement 100% sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
