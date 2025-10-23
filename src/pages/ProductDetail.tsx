import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../services/productService";
import { useCartStore } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  const { addToCart } = useCartStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProduct = async (): Promise<void> => {
      if (!id) return;

      setLoading(true);
      setError("");
      try {
        const data = await productService.getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError("Produit non trouvé");
        }
      } catch (err) {
        console.error("Erreur détaillée:", err);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = (): void => {
    if (product) {
      if (!currentUser || currentUser.role !== "client") {
        setMessage({
          type: "error",
          text: "❌ Vous devez être connecté en tant que client pour ajouter des articles au panier",
        });
        return;
      }

      if (quantity > product.stock) {
        setMessage({
          type: "error",
          text: `❌ Stock insuffisant. Il ne reste que ${product.stock} unité(s) disponible(s)`,
        });
        return;
      }

      // Ajouter la quantité spécifiée au panier
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image:
          product.image ||
          "https://via.placeholder.com/300x200?text=Produit+Agricole",
        quantity: quantity,
        sellerId: product.sellerId, // Assuming you have the sellerId from the product object
        sellerName: product.sellerName, // Assuming you have the sellerName from the product object
      });

      setMessage({
        type: "success",
        text: `✅ ${quantity} ${
          quantity > 1 ? "articles ajoutés" : "article ajouté"
        } au panier !`,
      });
      setQuantity(1);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    }
  };

  const handleQuantityChange = (change: number): void => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= (product?.stock || 1)) {
      setQuantity(newQty);
    }
  };

  const handleQuantityInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Chargement du produit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <div className="text-5xl mb-3">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Le produit n'existe pas</p>
          <Link
            to="/products"
            className="text-green-600 hover:text-green-700 mt-4 inline-block"
          >
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl =
    product.image ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Fil d'Ariane */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-green-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link
            to="/products"
            className="hover:text-green-600 transition-colors"
          >
            Produits
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Message de confirmation */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            } transition-opacity duration-300`}
          >
            {message.text}
          </div>
        )}

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image produit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 relative">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-96 object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80";
              }}
            />
            {product.available ? (
              <div className="absolute top-6 left-6 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                ✓ En stock ({product.stock} unités)
              </div>
            ) : (
              <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                ❌ Rupture de stock
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.title}
            </h1>
            <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {product.category}
            </div>

            <div className="text-4xl font-bold text-green-600 mb-4">
              {product.price}€
              {product.unit && (
                <span className="text-lg text-gray-600">/{product.unit}</span>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Sélecteur de quantité */}
            {product.available && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantité :
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityInput}
                    min="1"
                    max={product.stock}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2 text-lg font-semibold"
                  />

                  <span className="text-gray-600 text-sm">
                    sur {product.stock} disponibles
                  </span>

                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Bouton ajouter au panier */}
            {product.available ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={!currentUser || currentUser.role !== "client"}
              >
                🛒 Ajouter au panier {quantity > 1 && `(x${quantity})`}
              </button>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600 font-medium">
                  ❌ Produit temporairement indisponible
                </p>
              </div>
            )}

            {/* Message pour les non-clients */}
            {(!currentUser || currentUser.role !== "client") &&
              product.available && (
                <p className="text-orange-600 text-sm mt-2 text-center">
                  {!currentUser
                    ? "Connectez-vous en tant que client pour ajouter au panier"
                    : "Seuls les clients peuvent ajouter des produits au panier"}
                </p>
              )}

            {/* Lien retour */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/products"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                ← Retour aux produits
              </Link>
            </div>
          </div>
        </div>

        {/* Informations vendeur */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            👨‍🌾 Informations du vendeur
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="mb-2">
                <strong className="text-gray-800">Nom :</strong>{" "}
                {product.sellerName}
              </p>
              {product.farmName && (
                <p>
                  <strong className="text-gray-800">Exploitation :</strong>{" "}
                  {product.farmName}
                </p>
              )}
            </div>
            <div>
              <p className="mb-2">
                <strong className="text-gray-800">Catégorie :</strong>{" "}
                {product.category}
              </p>
              <p>
                <strong className="text-gray-800">Unité :</strong>{" "}
                {product.unit || "pièce"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
