import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const { isAuthenticated } = useAuth();

  const carouselImages = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
      title: "Produits Frais de la Ferme",
      description:
        "Découvrez des produits agricoles frais directement de nos producteurs locaux.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80",
      title: "Circuit Court Garanti",
      description:
        "Soutenez l'agriculture locale avec des produits de saison et de qualité.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80",
      title: "Livraison Rapide",
      description:
        "Recevez vos produits en 24h-48h, cueillis à maturité pour préserver leurs saveurs.",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=2000&q=80",
      title: "Agriculture Durable",
      description:
        "Des pratiques respectueuses de l'environnement pour une alimentation saine.",
    },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await productService.getProducts();
        const validProducts = (allProducts || [])
          .filter((p: Product) => p && p.id)
          .slice(0, 6);
        setProducts(validProducts);
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const goToSlide = (index: number): void => setCurrentSlide(index);
  const nextSlide = (): void =>
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = (): void =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement des produits...</p>
      </div>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <div className="min-h-screen bg-white">
      {/* === SECTION HERO / CAROUSEL === */}
      <section className="relative h-screen overflow-hidden">
        <div className="relative h-full">
          {carouselImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>

              <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isAuthenticated() && (
                    <Link
                      to="/register"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transition-transform hover:scale-105"
                    >
                      Rejoindre AgriEcom
                    </Link>
                  )}
                  <Link
                    to="/products"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-lg text-lg font-semibold backdrop-blur-sm border border-white border-opacity-40 transition-transform hover:scale-105"
                  >
                    Découvrir les produits
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Flèches navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>

          {/* Points indicateurs */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white bg-opacity-50"
                } transition-all duration-300`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* === CATÉGORIES === */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Nos Catégories de Produits
          </h2>
          <p className="text-gray-600 mb-12">
            Explorez nos différentes catégories de produits frais et locaux.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Légumes",
                image:
                  "https://tse2.mm.bing.net/th/id/OIP.FFxXKjWfDMH9ewFmyGFfkwHaE8?pid=ImgDet&rs=1",
              },
              {
                name: "Fruits",
                image:
                  "https://www.gastronomiac.com/wp/wp-content/uploads/2021/08/Fruits.jpg",
              },
              {
                name: "Grains",
                image:
                  "https://tse1.mm.bing.net/th/id/OIP.8Gz88cqqE-xdQrSvtn6yTgHaDa?pid=ImgDet&rs=1",
              },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name.toLowerCase()}`}
                className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-semibold">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === PRODUITS EN VEDETTE === */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nos Produits Frais
          </h2>
          <p className="text-gray-600 mb-12">
            Découvrez une sélection de produits directement issus des fermes.
          </p>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Link
                to="/products"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 inline-block"
              >
                Voir tous les produits →
              </Link>
            </>
          ) : (
            <p className="text-gray-500 text-lg">
              Aucun produit disponible pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
