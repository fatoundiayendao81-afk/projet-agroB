import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { ProductCardProps } from "../types";

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const imageUrl =
    product.image ||
    "https://via.placeholder.com/300x200?text=Produit+Agricole";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      <img
        src={imageUrl}
        alt={product.title}
        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
      />

      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-gray-600 text-base mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-green-600 font-bold text-2xl">
            {product.price}€
          </span>
          <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Vendeur: <span className="font-semibold">{product.sellerName}</span>
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to={`/product/${product.id}`}
            className="bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Voir détails
          </Link>

          {currentUser && currentUser.role === "client" && (
            <button
              onClick={() => addToCart(product)}
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-3 px-4 rounded-lg font-medium transition-all duration-200"
            >
              Ajouter au panier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
