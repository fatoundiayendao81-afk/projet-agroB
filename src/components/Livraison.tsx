import React, { useState } from "react";
import { useCartStore } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

interface FormData {
  prenom: string;
  nom: string;
  rue: string;
  adresse: string;
  telephone: string;
  alias: string;
  commentaires: string;
}

const Livraison: React.FC = () => {
  const { getCartTotal } = useCartStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    rue: "",
    adresse: "",
    telephone: "+221",
    alias: "Domicile",
    commentaires: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAliasChange = (alias: string): void => {
    setFormData({ ...formData, alias });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    alert("✅ Adresse enregistrée avec succès !");
    navigate("/paiement");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            L'adresse sélectionnée sera utilisée pour la facturation et la
            livraison.
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rue *
              </label>
              <input
                type="text"
                name="rue"
                value={formData.rue}
                onChange={handleChange}
                placeholder="Ex : route d'Esch"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Ex : près du marché central"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Informations relatives à cette adresse
              </label>
              <div className="flex gap-3 mb-2">
                {["Domicile", "Travail", "Autres"].map((alias) => (
                  <button
                    type="button"
                    key={alias}
                    onClick={() => handleAliasChange(alias)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      formData.alias === alias
                        ? "bg-green-600 text-white border-green-600"
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
                  placeholder="Ex : École, Boutique..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Téléphone *
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  🇸🇳 +221
                </span>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Commentaires
              </label>
              <textarea
                name="commentaires"
                value={formData.commentaires}
                onChange={handleChange}
                placeholder="Ajoutez un message pour le livreur..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Continuer
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Résumé</h3>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Sous-total</span>
            <span>{getCartTotal().toFixed(0)} FCFA</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-4">
            <span>Livraison</span>
            <span>sera calculée</span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
            CONTINUER
          </button>
        </div>
      </div>
    </div>
  );
};

export default Livraison;