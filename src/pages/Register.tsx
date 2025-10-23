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

  const { register, isAuthenticated } = useAuth();
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

  // const getRoleDescription = (role: "client" | "producer"): string => {
  //   switch (role) {
  //     case "client":
  //       return "Achetez des produits frais directement auprès des producteurs locaux";
  //     case "producer":
  //       return "Vendez vos produits agricoles et gérez votre exploitation";
  //     default:
  //       return "";
  //   }
  // };

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
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-3">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-4 mt-0 border border-gray-200">
          {/* En-tête ultra-compacte */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                <span className="text-lg text-green-600">🌱</span>
              </div>
              <h1 className="text-xl font-bold text-green-600">AgroBusiness</h1>
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Créer votre compte
            </h2>
          </div>

          {/* Messages d'alerte ultra-compacts */}
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

          {errors.submit && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">❌</span>
                <span className="text-red-700">{errors.submit}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase">
                Informations personnelles
              </h3>
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nom complet *"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Téléphone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Adresse"
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Type de compte */}
            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase">
                Type de compte *
              </h3>
              <div className="flex gap-2">
                {(["client", "producer"] as const).map((role) => (
                  <label key={role} className="flex-1 cursor-pointer">
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
                      className={`p-2 border rounded-lg text-center text-xs ${
                        form.role === role
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {role === "client" ? "🛒 Client" : "👨‍🌾 Vendeur"}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Exploitation agricole */}
            {form.role === "producer" && (
              <div>
                <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase">
                  Exploitation
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="farmName"
                    placeholder="Nom exploitation *"
                    value={form.farmName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      errors.farmName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.farmName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.farmName}
                    </p>
                  )}
                  <textarea
                    name="description"
                    placeholder="Description..."
                    value={form.description}
                    onChange={handleChange}
                    disabled={loading}
                    rows={1}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Sécurité */}
            <div>
              <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase">
                Sécurité
              </h3>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mot de passe *"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 pr-8 ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmer mot de passe *"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 pr-8 ${
                      errors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </form>

          {/* Liens supplémentaires */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-xs">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
