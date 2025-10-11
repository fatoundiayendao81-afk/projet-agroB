import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../context/CartContext";
import CheckoutModal from "../components/CheckoutModal";

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
      alert("✅ Code promo appliqué : -25%");
    } else {
      alert("❌ Code promo invalide !");
      setDiscount(0);
    }
  };

  const total = getCartTotal();
  const totalAfterDiscount = total - total * discount;

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
                    <p className="text-gray-500">{item.price} FCFA</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(item.quantity - 1, 1))
                    }
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    −
                  </button>
                  <span className="font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {(item.price * item.quantity).toFixed(0)} FCFA
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
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
              onClick={clearCart}
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
                  {total.toFixed(0)} FCFA
                </span>
              </p>

              {discount > 0 && (
                <p className="text-sm text-gray-500">
                  Réduction {discount * 100}% : -{(total * discount).toFixed(0)}{" "}
                  FCFA
                </p>
              )}

              <p className="text-xl font-bold text-gray-800">
                Total :{" "}
                <span className="text-green-700">
                  {totalAfterDiscount.toFixed(0)} FCFA
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Continuer mes achats
              </button>

              <button
                onClick={() => setIsCheckoutOpen(true)}
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
        onContinue={() => navigate("/livraison")}
      />
    </div>
  );
};

export default Cart;
