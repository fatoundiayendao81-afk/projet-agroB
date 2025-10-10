import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  role: "client" | "producer";
  farmName: string;
  description: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  farmName?: string;
  submit?: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "client",
    farmName: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  const { register, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!form.email) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!form.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (form.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      newErrors.phone = "Format de téléphone invalide";
    }

    if (form.role === "producer") {
      if (!form.farmName.trim()) {
        newErrors.farmName =
          "Le nom de l'exploitation est obligatoire pour les producteurs";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage({ type: "", text: "" });

    try {
      const userData: Partial<User> = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        role: form.role,
        ...(form.role === "producer" && {
          farmName: form.farmName.trim(),
          description: form.description.trim(),
        }),
      };

      const user = await register(userData);

      setMessage({
        type: "success",
        text: `Bienvenue ${user.name} ! Votre compte a été créé avec succès.`,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      const errorMessage = (error as Error).message;

      let displayMessage = "Une erreur est survenue lors de l'inscription";
      if (errorMessage.includes("email existe déjà")) {
        displayMessage = "Un compte avec cet email existe déjà";
      } else if (errorMessage.includes("validation")) {
        displayMessage = "Veuillez vérifier les informations du formulaire";
      } else if (
        errorMessage.includes("réseau") ||
        errorMessage.includes("HTTP")
      ) {
        displayMessage =
          "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else {
        displayMessage = errorMessage || displayMessage;
      }

      setErrors({ submit: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (
    field: "password" | "confirmPassword"
  ): void => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const getRoleDescription = (role: "client" | "producer"): string => {
    switch (role) {
      case "client":
        return "Achetez des produits frais directement auprès des producteurs locaux";
      case "producer":
        return "Vendez vos produits agricoles et gérez votre exploitation";
      default:
        return "";
    }
  };

  if (isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vous êtes déjà connecté
          </h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">🌱</span>
              <h1 className="text-3xl font-bold text-green-600">AgriEcom</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Créer votre compte
            </h2>
            <p className="text-gray-600">Rejoignez notre communauté agricole</p>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">
                  {message.type === "success" ? "✅" : "ℹ️"}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-xl text-red-600 mr-3 mt-1">❌</span>
                <div>
                  <p className="font-semibold text-red-800">
                    Erreur d'inscription
                  </p>
                  <p className="text-red-700 mt-1">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Informations personnelles
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>👤</span>
                      Nom complet *
                    </span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Votre nom complet"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>📧</span>
                      Adresse email *
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>📞</span>
                      Téléphone
                    </span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+221 XX XXX XX XX"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.phone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>🏠</span>
                      Adresse
                    </span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="Votre adresse complète"
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Type de compte *
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["client", "producer"] as const).map((role) => (
                  <label key={role} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={handleChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <div
                      className={`p-4 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        form.role === role
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {role === "client" ? "🛒" : "👨‍🌾"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {role === "client" ? "Acheteur" : "Producteur"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getRoleDescription(role)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {form.role === "producer" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Informations de l'exploitation
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="farmName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <span>🏡</span>
                        Nom de l'exploitation *
                      </span>
                    </label>
                    <input
                      id="farmName"
                      type="text"
                      name="farmName"
                      placeholder="Nom de votre ferme ou exploitation"
                      value={form.farmName}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.farmName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.farmName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.farmName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <span>📄</span>
                        Description
                      </span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Décrivez votre exploitation, vos spécialités, vos pratiques agricoles..."
                      value={form.description}
                      onChange={handleChange}
                      disabled={loading}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Sécurité
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>🔒</span>
                      Mot de passe *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Votre mot de passe"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("password")}
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>✅</span>
                      Confirmer le mot de passe *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmez votre mot de passe"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
            <Link
              to="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              <span className="mr-1">←</span>
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              En créant un compte, vous acceptez nos{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
