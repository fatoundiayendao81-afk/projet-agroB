// pages/Livraison.tsx
import React, { useState, useEffect } from "react";
import { useCartStore } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface FormData {
  prenom: string;
  nom: string;
  rue: string;
  adresse: string;
  telephone: string;
  alias: string;
  commentaires: string;
  aliasPersonnalise?: string;
}

const Livraison: React.FC = () => {
  const { getCartTotal, cartItems } = useCartStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    rue: "",
    adresse: "",
    telephone: "+221 ",
    alias: "Domicile",
    commentaires: "",
    aliasPersonnalise: "",
  });

  // Pré-remplir avec les données utilisateur si connecté
  useEffect(() => {
    const guestUser = localStorage.getItem("guestUser");
    if (currentUser) {
      const names = currentUser.name.split(" ");
      setFormData((prev) => ({
        ...prev,
        prenom: names[0] || "",
        nom: names.slice(1).join(" ") || "",
        telephone: currentUser.phone || "+221 ",
        adresse: currentUser.address || "",
      }));
    } else if (guestUser) {
      const guest = JSON.parse(guestUser);
      const names = guest.name.split(" ");
      setFormData((prev) => ({
        ...prev,
        prenom: names[0] || "",
        nom: names.slice(1).join(" ") || "",
        telephone: guest.phone,
      }));
    }
  }, [currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAliasChange = (alias: string): void => {
    setFormData({ ...formData, alias, aliasPersonnalise: "" });
  };

  const validateForm = (): boolean => {
    if (!formData.rue.trim()) {
      Swal.fire({
        title: "Champ manquant",
        text: "Veuillez renseigner la rue",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!formData.prenom.trim()) {
      Swal.fire({
        title: "Champ manquant",
        text: "Veuillez renseigner votre prénom",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!formData.nom.trim()) {
      Swal.fire({
        title: "Champ manquant",
        text: "Veuillez renseigner votre nom",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!formData.telephone.trim() || formData.telephone === "+221 ") {
      Swal.fire({
        title: "Champ manquant",
        text: "Veuillez renseigner votre numéro de téléphone",
        icon: "warning",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return false;
    }

    // Validation du numéro de téléphone
    const phoneRegex =
      /^(?:\+221|221)?[-\s]?(77|76|78|70|75)[-\s]?(\d{3})[-\s]?(\d{2})[-\s]?(\d{2})$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ""))) {
      Swal.fire({
        title: "Numéro invalide",
        text: "Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)",
        icon: "error",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Afficher un loader pendant la validation
    Swal.fire({
      title: "Validation en cours...",
      text: "Vérification de votre adresse de livraison",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Simuler un traitement asynchrone
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Sauvegarder l'adresse de livraison
    const shippingData = {
      ...formData,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("shippingAddress", JSON.stringify(shippingData));

    Swal.fire({
      title: "✅ Adresse enregistrée !",
      text: "Votre adresse de livraison a été sauvegardée avec succès",
      icon: "success",
      confirmButtonColor: "#16a34a",
      confirmButtonText: "Continuer vers le paiement",
      showCancelButton: true,
      cancelButtonText: "Modifier l'adresse",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/paiement");
      }
    });
  };

  const handleBackToCart = () => {
    Swal.fire({
      title: "Retour au panier ?",
      text: "Vos informations seront sauvegardées",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, retourner au panier",
      cancelButtonText: "Rester ici",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/cart");
      }
    });
  };

  const total = getCartTotal();
  const deliveryFee = 2000;
  const finalTotal = total + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Indicateur de progression */}
        <div className="flex justify-center items-center py-6 mb-6 border-b bg-white rounded-lg">
          <ul className="flex items-center space-x-4 md:space-x-8 text-gray-600 font-medium text-sm md:text-base">
            <li className="flex items-center">
              <span className="text-green-600 font-semibold">1</span>
              &nbsp;Panier
            </li>
            <li className="text-gray-400">──────</li>
            <li className="flex items-center text-green-700 font-semibold">
              <span className="text-green-600">2</span>&nbsp;Livraison
            </li>
            <li className="text-gray-400">──────</li>
            <li className="flex items-center text-gray-400">
              <span>3</span>&nbsp;Paiement
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Adresse de livraison
            </h1>
            <p className="text-gray-600 mb-6">
              L'adresse sélectionnée sera utilisée pour la facturation et la
              livraison.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Rue *
                </label>
                <input
                  type="text"
                  name="rue"
                  value={formData.rue}
                  onChange={handleChange}
                  placeholder="Ex : Route de l'Aéroport"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Abdoul Salam"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Diallo"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Complément d'adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Ex : près du marché central, immeuble bleu..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Type d'adresse
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {["Domicile", "Travail", "Autres"].map((alias) => (
                    <button
                      type="button"
                      key={alias}
                      onClick={() => handleAliasChange(alias)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                        formData.alias === alias
                          ? "bg-green-600 text-white border-green-600 shadow-md"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
                      }`}
                    >
                      {alias === "Domicile" && "🏠"}
                      {alias === "Travail" && "💼"}
                      {alias === "Autres" && "📍"}
                      {alias}
                    </button>
                  ))}
                </div>
                {formData.alias === "Autres" && (
                  <input
                    type="text"
                    name="aliasPersonnalise"
                    value={formData.aliasPersonnalise}
                    onChange={handleChange}
                    placeholder="Ex : École, Boutique, Résidence..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Téléphone *
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                    🇸🇳 +221
                  </span>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    placeholder="77 123 45 67"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: 77 123 45 67 ou 771234567
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Instructions pour le livreur
                </label>
                <textarea
                  name="commentaires"
                  value={formData.commentaires}
                  onChange={handleChange}
                  placeholder="Ajoutez un message pour le livreur (code d'entrée, étage, repères...)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  ← Retour au panier
                </button>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Continuer vers le paiement
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 h-fit shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Résumé de la commande
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>
                  Sous-total ({cartItems.length} article
                  {cartItems.length > 1 ? "s" : ""})
                </span>
                <span className="font-medium">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span className="font-medium">
                  {deliveryFee.toLocaleString()} FCFA
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-700">
                  {finalTotal.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-md"
            >
              CONTINUER VERS LE PAIEMENT
            </button>

            <p className="text-xs text-center text-gray-500 mt-3">
              🚚 Livraison sous 24-48h dans Dakar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livraison;
