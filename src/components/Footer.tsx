import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase">À PROPOS</h3>
            <p className="text-sm text-gray-100 leading-relaxed">
              <strong>AgroBusiness</strong>
              <br />
              Agro Sénégal LP est une plateforme agroalimentaire, portée vers
              l'échange ainsi que la vente des produits agroalimentaires.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Infos légales</h3>
            <ul className="space-y-2 text-sm text-gray-100">
              <li>
                <Link to="/mentions-legales" className="hover:text-green-300">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="hover:text-green-300">
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link to="/paiement" className="hover:text-green-300">
                  Moyens de paiement
                </Link>
              </li>
              <li>
                <Link to="/bons-achat" className="hover:text-green-300">
                  Utilisation de bons d'achat
                </Link>
              </li>
              <li>
                <Link to="/plan-vigilance" className="hover:text-green-300">
                  Plan de vigilance
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-green-300">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/alerte-anonyme" className="hover:text-green-300">
                  Alerte anonyme
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Nos services</h3>
            <ul className="space-y-2 text-sm text-gray-100">
              <li>Sama Kalpé Auchan</li>
              <li>Service après-vente</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Nous suivre</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-green-900 p-2 rounded-full hover:scale-110 transition-transform"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-green-900 p-2 rounded-full hover:scale-110 transition-transform"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-3">Besoin d'aide ?</h3>
            <Link
              to="/contact"
              className="bg-white text-green-900 font-bold text-sm px-5 py-3 rounded-lg shadow hover:bg-gray-100 transition-all w-max"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="border-t border-green-700 mt-10 pt-4 text-center text-sm text-green-200">
          © {new Date().getFullYear()} AgroBusiness – Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
