import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../context/CartContext";
import { ShoppingCart, Eye, Star, Shield, Image, Heart } from "lucide-react";
import type { Product } from "../types";

export interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCartStore();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- Favori toggle ---
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // --- Gestion image fallback ---
  const generateFallbackSvg = (productName: string) => {
    const initials = productName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#10b981"/>
        <text x="50%" y="55%" text-anchor="middle" fill="white" font-family="Arial" font-size="28" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  };

  const getImageUrl = () =>
    imageError || !product.image
      ? generateFallbackSvg(product.title || "Produit")
      : product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    });
  };

  // --- Calcul du prix après promo ---
  const discountedPrice =
    product.promo && product.promo > 0
      ? Math.round(product.price - (product.price * product.promo) / 100)
      : product.price;

  const rating = Math.random() * 2 + 3; // pour affichage esthétique

  const getSellerInitials = () =>
    product.sellerName
      ?.split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  return (
   <div className="group bg-white rounded-md shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.03] flex flex-col h-full w-[160px] min-h-[260px] text-[11px]">
  {/* Image + Favori + Promo */}
  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 h-[100px]">
    {imageLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
        <Image size={10} className="text-gray-300" />
      </div>
    )}
    <img
      src={getImageUrl()}
      alt={product.title || "Image du produit"}
      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
        imageLoading ? "opacity-0" : "opacity-100"
      }`}
      onError={() => setImageError(true)}
      onLoad={() => setImageLoading(false)}
    />
    {product.promo && (
      <div className="absolute top-1 left-1 z-20">
        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold shadow">
          🔥 -{product.promo}%
        </span>
      </div>
    )}
    <button
      onClick={toggleFavorite}
      className={`absolute top-1 right-1 p-1 rounded-full shadow-sm z-20 transition-all ${
        isFavorite
          ? "bg-red-100 text-red-600"
          : "bg-white text-gray-400 hover:text-red-500"
      }`}
    >
      <Heart size={10} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  </div>

  {/* Contenu */}
  <div className="p-2 flex flex-col flex-grow">
    <h3 className="font-semibold text-gray-900 text-[10px] mb-1 line-clamp-2 leading-tight group-hover:text-green-700">
      {product.title || "Produit sans nom"}
    </h3>

    <div className="flex items-center gap-1 mb-1">
      <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
        {getSellerInitials()}
      </div>
      <span className="text-[10px] text-gray-700 line-clamp-1">
        {product.sellerName || "Producteur"}
      </span>
    </div>

    <div className="flex items-center gap-0.5 mb-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={8}
          className={
            star <= Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
      <span className="text-[10px] text-gray-600 ml-1">
        ({rating.toFixed(1)})
      </span>
    </div>

    <div className="flex justify-between items-center mb-2">
      <div>
        {product.promo && product.promo > 0 ? (
          <>
            <div className="text-[10px] text-gray-500 line-through">
              {typeof product.price === "number"
                ? product.price.toLocaleString()
                : "—"}{" "}
              FCFA
            </div>
            <div className="text-[11px] font-bold text-red-600">
              {typeof discountedPrice === "number"
                ? discountedPrice.toLocaleString()
                : "—"}{" "}
              FCFA
            </div>
          </>
        ) : (
          <div className="text-[11px] font-bold text-green-600">
            {typeof product.price === "number"
              ? product.price.toLocaleString()
              : "—"}{" "}
            FCFA
          </div>
        )}
        <div className="text-[10px] text-gray-500">{product.unit || "kg"}</div>
      </div>

      <div
        className={`text-[10px] font-semibold px-1 py-0.5 rounded-full ${
          (product.stock || 0) > 20
            ? "bg-green-100 text-green-800"
            : (product.stock || 0) > 5
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {product.stock ?? 0}
      </div>
    </div>

    <div className="flex gap-1 mt-auto">
      <Link
        to={`/product/${product.id}`}
        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-1.5 rounded font-semibold text-[10px] flex items-center justify-center gap-1"
      >
        <Eye size={10} />
        <span>Détails</span>
      </Link>

      {currentUser?.role === "client" && (
        <button
          onClick={handleAddToCart}
          disabled={!product.available || (product.stock || 0) === 0}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-1 px-1.5 rounded font-semibold text-[10px] flex items-center justify-center gap-1"
        >
          <ShoppingCart size={10} />
          <span>Panier</span>
        </button>
      )}
    </div>

    <div className="mt-2 pt-1 border-t border-gray-100">
      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
        <Shield size={8} className="text-green-600" />
        <span>Qualité garantie</span>
      </div>
    </div>
  </div>
</div>

  );
};

export default ProductCard;
