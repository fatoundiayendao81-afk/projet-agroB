// import React from "react";
import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext";
import { ShoppingCart, HelpCircle, Mail } from "lucide-react"; // Icônes modernes

const Navbar = () => {
//   const { currentUser, logout } = useAuth();
//   const { getCartItemsCount } = useCart();

  return (
    <nav className="bg-green-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-2 space-y-2 sm:space-y-0">
        {/* --- Partie gauche : logo + email + aide + panier --- */}
        <div className="flex items-center space-x-6">
          {/* Logo et nom */}
          <Link
            to="/"
            className="flex items-center text-lg font-semibold hover:text-gray-300 transition-colors"
          >
            <img
              src="/logo_agro.png" // remplace par ton logo
              alt="AgroBusiness Logo"
              className="w-8 h-8 rounded-full mr-2"
            />
            AgroBusiness
          </Link>

          {/* Email de contact */}
          <div className="flex items-center space-x-2 text-sm">
            <Mail size={16} />
            <a
              href="mailto:info@agrobusiness.com"
              className="hover:text-gray-300 transition-colors"
            >
              info@agrobusiness.com
            </a>
          </div>

          {/* Aide */}
          <div className="flex items-center space-x-1 text-sm hover:text-gray-300 cursor-pointer">
            <HelpCircle size={16} />
            <span>Aide</span>
          </div>

          {/* Panier */}
          <Link to="/cart" className="flex items-center space-x-1 relative">
            <ShoppingCart size={18} />
            <span>Panier</span>
            {/* {getCartItemsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-green-900 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )} */}
          </Link>
        </div>

        {/* --- Partie droite : menu + recherche + bouton connexion --- */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300 text-sm">
            Accueil
          </Link>
          <Link to="/products" className="hover:text-gray-300 text-sm">
            Produit
          </Link>
          <Link to="/about" className="hover:text-gray-300 text-sm">
            À propos
          </Link>

          {/* Barre de recherche */}
          {/* <input
            type="text"
            placeholder="Recherche"
            className="px-3 py-1 text-black rounded-full text-sm focus:outline-none"
          /> */}

          {/* Connexion / Profil */}
          {/* {currentUser ? ( */}
            <>
              <Link
                to="/profile"
                className="hover:text-gray-300 text-sm font-medium"
              >
                {/* {currentUser.name || "Profil"} */}
              </Link>
              <button
                // onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm transition-colors"
              >
                Déconnexion
              </button>
            </>
          {/* ) : ( */}
            <Link
              to="/login"
              className="bg-white text-green-900 hover:bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
            >
              Connexion
            </Link>
          {/* )} */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// function useCart(): { getCartItemsCount: any; } {
//     throw new Error("Function not implemented.");
// }

// function useAuth(): { currentUser: any; logout: any; } {
//     throw new Error("Function not implemented.");
// }

