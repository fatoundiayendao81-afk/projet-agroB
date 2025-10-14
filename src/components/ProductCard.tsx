import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../context/CartContext";
import { ShoppingCart, Eye, Star, Shield, Image } from "lucide-react";
import type { Product } from "../types";

export interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCartStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Génération d'un SVG de fallback basé sur le nom du produit
  const generateFallbackSvg = (productName: string) => {
    const initials = productName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="200" fill="url(#gradient)"/>
        <circle cx="150" cy="80" r="40" fill="white" fill-opacity="0.9"/>
        <text x="150" y="90" text-anchor="middle" fill="#059669" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
          ${initials}
        </text>
        <text x="150" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="500">
          ${
            productName.length > 20
              ? productName.substring(0, 20) + "..."
              : productName
          }
        </text>
      </svg>
    `)}`;
  };

  const getImageUrl = () => {
    if (imageError || !product.image) {
      return generateFallbackSvg(product.title || "Produit");
    }
    return product.image;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  // Calculer une note aléatoire pour le design (simulation)
  const rating = Math.random() * 2 + 3; // Entre 3 et 5 étoiles

  // Obtenir les initiales du vendeur
  const getSellerInitials = () => {
    return (
      product.sellerName
        ?.split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "P"
    );
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-105 hover:border-green-300 flex flex-col h-full">
      {/* Header avec image et badges */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50">
        {/* État de chargement */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
            <div className="flex flex-col items-center gap-1">
              <Image size={16} className="text-gray-400 animate-pulse" />
              <span className="text-xs text-gray-500">Chargement...</span>
            </div>
          </div>
        )}

        {/* Image principale */}
        <img
          src={getImageUrl()}
          alt={product.title || "Image du produit"}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            imageLoading ? "opacity-0" : "opacity-100"
          } ${imageError ? "scale-105" : ""}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />

        {/* Badge de statut */}
        {product.status === "pending" && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-yellow-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold shadow-lg">
              ⏳
            </span>
          </div>
        )}

        {/* Badge de catégorie */}
        <div className="absolute top-2 right-2 z-20">
          <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold shadow-lg">
            {product.category?.slice(0, 3) || "AGR"}
          </span>
        </div>

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 z-10" />
      </div>

      {/* Contenu de la carte */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Titre et description */}
        <div className="mb-2 flex-grow">
          <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
            {product.title || "Produit sans nom"}
          </h3>
          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
            {product.description || "Produit agricole de qualité."}
          </p>
        </div>

        {/* Informations producteur */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getSellerInitials()}
            </div>
            <span className="text-xs font-medium text-gray-700 line-clamp-1">
              {product.sellerName || "Producteur"}
            </span>
          </div>
          {product.farmName && (
            <p className="text-xs text-gray-500 line-clamp-1">
              🏠 {product.farmName}
            </p>
          )}
        </div>

        {/* Rating et reviews (simulés) */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                className={
                  star <= Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({rating.toFixed(1)})</span>
        </div>

        {/* Prix et stock */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-sm font-bold text-green-600">
              {product.price?.toLocaleString() || "0"} FCFA
            </div>
            <div className="text-xs text-gray-500">{product.unit || "kg"}</div>
          </div>
          <div className="text-right">
            <div
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                (product.stock || 0) > 20
                  ? "bg-green-100 text-green-800"
                  : (product.stock || 0) > 5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock || 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 px-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 group/details"
          >
            <Eye size={12} />
            <span>Détails</span>
          </Link>

          {currentUser && currentUser.role === "client" && (
            <button
              onClick={handleAddToCart}
              disabled={!product.available || (product.stock || 0) === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-1.5 px-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1 group/cart"
            >
              <ShoppingCart size={12} />
              <span>Panier</span>
            </button>
          )}
        </div>

        {/* Garantie de qualité */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Shield size={10} className="text-green-600" />
            <span>Qualité garantie</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
