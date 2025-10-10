import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, HelpCircle, Mail } from "lucide-react";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  return (
    <nav className="bg-green-900 shadow-md border-b">
      <div className="max-w-7xl mx-auto">
        <div className="bg-green-900 px-4 py-2 flex justify-between items-center text-sm text-white">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Mail size={14} />
              <span>info@agrobusiness.com</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:text-white">
              <HelpCircle size={14} />
              <span>Aide</span>
            </div>
          </div>

          <Link
            to="/cart"
            className="flex items-center space-x-1 hover:text-green-700"
          >
            <ShoppingCart size={16} />
            <span>Panier</span>
            {getCartItemsCount() > 0 && (
              <span className="bg-green-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                {getCartItemsCount()}
              </span>
            )}
          </Link>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo_agro.png"
              alt="AgroBusiness Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-xl-w font-bold text-white">AgroBusiness</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-green-700 font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/products"
              className="text-white hover:text-green-700 font-medium transition-colors"
            >
              Produit
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-green-700 font-medium transition-colors"
            >
              A Propos
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-green-700 font-medium"
                >
                  {currentUser.name || "Profil"}
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
