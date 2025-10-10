import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CheckoutModal from "../components/CheckoutModal";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
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
        <p className="text-center text-gray-500">Votre panier est vide.</p>
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
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
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
                    className="text-red-500 hover:underline text-sm"
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
                className="border border-gray-300 rounded-lg px-4 py-2 w-48 focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={applyPromo}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Appliquer
              </button>
            </div>

            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              Vider le panier
            </button>
          </div>

          <div className="mt-8 border-t pt-4 text-right">
            <p className="text-lg font-medium text-gray-600">
              Total :{" "}
              <span className="font-bold text-green-700">
                {total.toFixed(0)} FCFA
              </span>
            </p>
            {discount > 0 && (
              <p className="text-sm text-gray-500">
                Réduction : {discount * 100}% → Nouveau total :{" "}
                <span className="text-green-700 font-semibold">
                  {totalAfterDiscount.toFixed(0)} FCFA
                </span>
              </p>
            )}

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Valider mon panier
            </button>
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
