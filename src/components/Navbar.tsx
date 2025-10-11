import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../context/CartContext";
import {
  ShoppingCart,
  HelpCircle,
  Mail,
  User,
  LogOut,
  Leaf,
  Phone,
  MapPin,
} from "lucide-react";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCartStore();
  const location = useLocation();

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Accueil", icon: "🏠" },
    { path: "/products", label: "Produits", icon: "🛒" },
    { path: "/about", label: "À Propos", icon: "🌱" },
  ];

  return (
    <>
      {/* Barre supérieure d'information */}
      <div className="bg-green-800 border-b border-green-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm text-green-100">
            {/* Informations de contact */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 transition-colors hover:text-white">
                <Mail size={14} className="text-green-300" />
                <span className="font-medium">info@agrobusiness.com</span>
              </div>
              <div className="flex items-center space-x-2 transition-colors hover:text-white">
                <Phone size={14} className="text-green-300" />
                <span className="font-medium">+221 33 123 45 67</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 transition-colors hover:text-white">
                <MapPin size={14} className="text-green-300" />
                <span className="font-medium">Dakar, Sénégal</span>
              </div>
            </div>

            {/* Liens rapides */}
            <div className="flex items-center space-x-4">
              <Link
                to="/help"
                className="flex items-center space-x-1 transition-colors hover:text-white"
              >
                <HelpCircle size={14} className="text-green-300" />
                <span className="font-medium">Aide & Support</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="bg-green-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo et nom */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Leaf size={24} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-green-900"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">
                  AgroBusiness
                </span>
                <span className="text-xs text-green-300 font-medium tracking-wide">
                  Excellence Agricole
                </span>
              </div>
            </Link>

            {/* Navigation centrale */}
            <div className="hidden md:flex items-center space-x-1 bg-green-800/50 rounded-2xl p-1 backdrop-blur-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActiveRoute(link.path)
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                      : "text-green-100 hover:bg-green-700/50 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Panier avec badge */}
              <Link
                to="/cart"
                className="relative p-3 bg-green-800 hover:bg-green-700 rounded-2xl transition-all duration-300 group"
              >
                <ShoppingCart
                  size={20}
                  className="text-green-100 group-hover:text-white transition-colors"
                />
                {getCartItemsCount() > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {getCartItemsCount()}
                    </span>
                    <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-ping"></span>
                  </>
                )}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>

              {/* Section utilisateur */}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* Avatar utilisateur */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 bg-green-800 hover:bg-green-700 rounded-2xl px-4 py-3 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">
                        {currentUser.name || "Mon Compte"}
                      </span>
                      <span className="text-xs text-green-300 capitalize">
                        {currentUser.role}
                      </span>
                    </div>
                  </Link>

                  {/* Bouton déconnexion */}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25 group"
                  >
                    <LogOut
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="hidden sm:block">Déconnexion</span>
                  </button>
                </div>
              ) : (
                /* Boutons connexion/inscription */
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-600/25 transform hover:-translate-y-0.5"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white hover:bg-gray-100 text-green-700 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-transparent hover:border-green-200"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden bg-green-800 border-t border-green-700">
          <div className="flex justify-around py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveRoute(link.path)
                    ? "text-green-300 bg-green-700/50"
                    : "text-green-200 hover:text-white"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Indicateur de progression (optionnel) */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-300 w-full"></div>
    </>
  );
};

export default Navbar;
