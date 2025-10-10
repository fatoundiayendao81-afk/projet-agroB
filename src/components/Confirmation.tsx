import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

interface LocationState {
  paymentMethod?: string;
  total?: number;
}

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentMethod, total } = (location.state as LocationState) || {};

  const getPaymentLabel = (method: string | undefined): string => {
    switch (method) {
      case "livraison":
        return "Paiement à la livraison";
      case "wave":
        return "Paiement via Wave";
      case "carte":
        return "Paiement par carte bancaire";
      default:
        return "Paiement inconnu";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-600 w-16 h-16" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🎉 Commande confirmée !
        </h1>

        <p className="text-gray-600 mb-6">
          Merci pour votre achat ! Votre commande a été enregistrée avec succès.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg text-left space-y-2 mb-6">
          <p className="flex justify-between">
            <span className="font-medium text-gray-700">
              Méthode de paiement :
            </span>
            <span className="text-gray-800">
              {getPaymentLabel(paymentMethod)}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium text-gray-700">Montant total :</span>
            <span className="text-green-600 font-semibold">
              {total ? `${total.toLocaleString()} CFA` : "-"}
            </span>
          </p>
          <p className="text-sm text-gray-500 italic">
            Vous recevrez un message de confirmation dès que votre commande sera
            expédiée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02]"
          >
            🛍️ Retourner à la boutique
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all transform hover:scale-[1.02]"
          >
            Voir mes commandes
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-6">
        © {new Date().getFullYear()} SmartFarm — Tous droits réservés.
      </p>
    </div>
  );
};

export default Confirmation;
