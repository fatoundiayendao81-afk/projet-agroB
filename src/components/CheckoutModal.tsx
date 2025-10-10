import React, { useState } from "react";
import { X } from "lucide-react";
import type { ModalProps } from "../types";

const CheckoutModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const [activeTab, setActiveTab] = useState<"guest" | "login" | "register">(
    "guest"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-5xl relative animate-fadeIn">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Choisissez votre mode de commande
        </h2>

        {/* Onglets */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "guest"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("guest")}
          >
            Invité
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "login"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Connexion
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "register"
                ? "bg-orange-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Créer un compte
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "guest" && (
          <form className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-medium">Nom complet</label>
              <input
                type="text"
                placeholder="Ex : Fatou Ndiaye"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Téléphone</label>
              <div className="flex items-center border rounded-lg px-3 py-2 gap-2">
                <img
                  src="https://flagcdn.com/w20/sn.png"
                  alt="SN"
                  className="w-5 h-5"
                />
                <span>+221</span>
                <input
                  type="tel"
                  placeholder="77 123 45 67"
                  className="flex-1 outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Adresse e-mail</label>
              <input
                type="email"
                placeholder="exemple@email.com"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="subscribe" />
              <label htmlFor="subscribe">
                Je souhaite recevoir des offres spéciales et promotions.
              </label>
            </div>
          </form>
        )}

        {activeTab === "login" && (
          <form className="grid gap-4">
            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                placeholder="Votre email"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <button className="text-blue-600 text-sm text-right hover:underline">
              Mot de passe oublié ?
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-medium">Nom complet</label>
              <input
                type="text"
                placeholder="Ex : Abdou Diallo"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Adresse e-mail</label>
              <input
                type="email"
                placeholder="exemple@mail.com"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </form>
        )}

        {/* Bouton continuer */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
