// components/CheckoutModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { ModalProps } from "../types";

interface CheckoutModalProps extends ModalProps {
  onGuestCheckout: (userData: { name: string; email: string; phone: string }) => void;
  onUserCheckout: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onGuestCheckout,
  onUserCheckout,
}) => {
  const { currentUser, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"guest" | "login" | "register">(
    currentUser ? "login" : "guest"
  );

  // États pour les formulaires
  const [guestData, setGuestData] = useState({
    name: "",
    email: "",
    phone: "+221 "
  });
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGuestContinue = () => {
    if (!guestData.name.trim() || !guestData.email.trim() || !guestData.phone.trim()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (!guestData.email.includes('@')) {
      alert("Veuillez entrer une adresse email valide");
      return;
    }

    onGuestCheckout(guestData);
    onClose();
  };

  const handleLogin = async () => {
    if (!loginData.email.trim() || !loginData.password.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      onUserCheckout();
      onClose();
    } catch  {
      alert("Erreur de connexion : email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name.trim() || !registerData.email.trim() || 
        !registerData.password.trim() || !registerData.confirmPassword.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (registerData.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: "client"
      });
      onUserCheckout();
      onClose();
    } catch  {
      alert("Erreur lors de l'inscription : cet email est peut-être déjà utilisé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {currentUser ? "Confirmer la commande" : "Choisissez votre mode de commande"}
        </h2>

        {!currentUser && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "guest"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("guest")}
            >
              Invité
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Connexion
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "register"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Créer un compte
            </button>
          </div>
        )}

        {/* Contenu pour invité */}
        {activeTab === "guest" && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Nom complet *</label>
              <input
                type="text"
                value={guestData.name}
                onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                placeholder="Ex : Fatou Ndiaye"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Téléphone *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
                <img
                  src="https://flagcdn.com/w20/sn.png"
                  alt="SN"
                  className="w-5 h-5"
                />
                <span className="text-gray-600">+221</span>
                <input
                  type="tel"
                  value={guestData.phone}
                  onChange={(e) => setGuestData({...guestData, phone: e.target.value})}
                  placeholder="77 123 45 67"
                  className="flex-1 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Adresse e-mail *</label>
              <input
                type="email"
                value={guestData.email}
                onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                placeholder="exemple@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="subscribe" 
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="subscribe" className="text-sm text-gray-600">
                Je souhaite recevoir des offres spéciales et promotions.
              </label>
            </div>
            <button
              onClick={handleGuestContinue}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors mt-4"
            >
              {loading ? "Chargement..." : "Continuer en tant qu'invité"}
            </button>
          </div>
        )}

        {/* Contenu pour connexion */}
        {activeTab === "login" && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Email *</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="Votre email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Mot de passe *</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button className="text-blue-600 text-sm text-right hover:underline w-full text-center">
              Mot de passe oublié ?
            </button>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        )}

        {/* Contenu pour inscription */}
        {activeTab === "register" && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Nom complet *</label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                placeholder="Ex : Abdou Diallo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Adresse e-mail *</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                placeholder="exemple@mail.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Mot de passe *</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                placeholder="•••••••• (min. 6 caractères)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Confirmer le mot de passe *</label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Inscription..." : "Créer un compte"}
            </button>
          </div>
        )}

        {/* Si l'utilisateur est déjà connecté */}
        {currentUser && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Connecté en tant que <strong>{currentUser.name}</strong>
              </p>
              <p className="text-green-600 text-sm mt-1">{currentUser.email}</p>
            </div>
            <button
              onClick={onUserCheckout}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Continuer vers la livraison
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;