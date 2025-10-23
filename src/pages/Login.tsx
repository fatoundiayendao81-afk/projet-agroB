import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  const { login, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, from]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setMessage({ type: "", text: "" });
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    try {
      const user = await login(email, password);
      if (user) {
        setMessage({
          type: "success",
          text: `Bienvenue ${user.name} !`,
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setError("Erreur de connexion - Aucun utilisateur retourné");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      const errorMessage = (error as Error).message;

      if (errorMessage.includes("bloqué")) {
        setError("Votre compte a été bloqué. Contactez l'administrateur.");
      } else if (errorMessage.includes("mot de passe")) {
        setError("Mot de passe incorrect");
      } else if (errorMessage.includes("email")) {
        setError("Aucun compte trouvé avec cet email");
      } else if (
        errorMessage.includes("réseau") ||
        errorMessage.includes("HTTP")
      ) {
        setError(
          "Erreur de connexion au serveur. Vérifiez votre connexion internet."
        );
      } else {
        setError(
          errorMessage ||
            "Une erreur inattendue est survenue lors de la connexion"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const testAccounts: (User & { farmName?: string })[] = [
    {
      id: "1",
      name: "Admin AgriEcom",
      email: "admin@agriecom.com",
      password: "admin123",
      role: "admin" as User["role"],
      phone: "+33 1 23 45 67 89",
      address: "123 Rue de l'Agriculture, Paris",
      blocked: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      name: "Jean Producteur",
      email: "jean@ferme.com",
      password: "producteur123",
      role: "producer" as User["role"],
      phone: "+33 6 12 34 56 78",
      address: "456 Chemin de la Ferme, Lyon",
      blocked: false,
      createdAt: "2024-02-01T00:00:00.000Z",
      farmName: "Ferme du Soleil",
    },
  ];

  const fillTestAccount = (account: User): void => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    setMessage({
      type: "info",
      text: `Compte ${account.role} pré-rempli - Cliquez sur "Se connecter"`,
    });
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const clearForm = (): void => {
    setEmail("");
    setPassword("");
    setError("");
    setMessage({ type: "", text: "" });
  };

  if (isAuthenticated() && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-3xl text-white">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Vous êtes connecté
          </h2>
          <p className="text-white/80 mb-6">Redirection en cours...</p>
          <Link
            to="/"
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30"
          >
            Aller à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4">
        {/* En-tête ultra-compact */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white text-sm">🌾</span>
            </div>
            <h1 className="text-xl font-bold text-green-500">AgroBusiness</h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Se connecter</h2>
        </div>

        {/* Messages d'alerte compacts */}
        {message.text && (
          <div
            className={`mb-3 p-2 rounded border text-xs ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-1">
                {message.type === "success" ? "✅" : "ℹ️"}
              </span>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">❌</span>
                <span className="text-red-700">{error}</span>
              </div>
              <button onClick={clearForm} className="text-red-500 text-xs">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Comptes de test compacts */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">
              Accès rapide
            </span>
            <span className="text-xs text-gray-500">Cliquez</span>
          </div>
          <div className="flex gap-1">
            {testAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => fillTestAccount(account)}
                disabled={loading}
                className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 text-xs transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                    account.role === "admin" ? "bg-purple-500" : "bg-green-500"
                  }`}
                ></div>
                <div>{account.role === "admin" ? "Admin" : "Prod"}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire compact */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              📧
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              🔒
            </span>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {email && password && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 text-center">
              ✅ Compte pré-rempli
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <span>🔑</span>
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Liens compacts */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            Nouveau ?{" "}
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Créer un compte
            </Link>
          </p>
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-xs">
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Sécurité compacte */}
        <div className="mt-3 p-2 bg-gray-100 rounded text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 text-xs">
            <span>🛡️</span>
            <span>Connexion sécurisée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
