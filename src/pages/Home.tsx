import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Truck,
  Shield,
  Leaf,
  Users,
  Award,
} from "lucide-react";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const { isAuthenticated } = useAuth();

  const carouselImages = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      title: "Produits Frais de la Ferme",
      description:
        "Des produits agricoles frais directement de nos producteurs locaux",
      badge: "🌱 Fraîcheur Garantie",
      gradient: "from-black/40 to-black/60", // Overlay plus léger
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      title: "Circuit Court Garanti",
      description: "Soutenez l'agriculture locale avec des produits de qualité",
      badge: "🔄 Circuit Court",
      gradient: "from-black/30 to-black/50", // Overlay plus léger
    },
  ];

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Livraison Express",
      description: "Recevez en 24-48h maximum",
      color: "text-blue-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Paiement Sécurisé",
      description: "Transactions 100% sécurisées",
      color: "text-green-600",
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Produits Bio",
      description: "Selection de produits naturels",
      color: "text-emerald-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support 7j/7",
      description: "Équipe à votre écoute",
      color: "text-purple-600",
    },
  ];

  const categories = [
    {
      name: "Légumes",
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=250&fit=crop",
      description: "Légumes frais de saison",
      count: "50+ Produits",
      gradient: "from-green-500/20 to-green-600/20",
    },
    {
      name: "Fruits",
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=250&fit=crop",
      description: "Fruits juteux et sucrés",
      count: "35+ Variétés",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      name: "Grains & Céréales",
      image:
        "https://tse1.explicit.bing.net/th/id/OIP.YGaNPA2xYndx0TTXfpEBQQHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Céréales et grains nutritifs",
      count: "25+ Types",
      gradient: "from-amber-500/20 to-yellow-500/20",
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* === HERO CAROUSEL CORRIGÉ === */}
      <section className="relative h-96 overflow-hidden">
        <div className="relative h-full">
          {carouselImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-4"
              }`}
            >
              {/* Image de fond visible */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>

              {/* Overlay noir transparent au lieu de vert */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
              ></div>

              <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
                <div className="max-w-2xl mx-auto">
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-white/30">
                    <Star className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs font-semibold">{slide.badge}</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    {slide.title}
                  </h1>

                  <p className="text-sm md:text-base mb-6 max-w-md mx-auto text-gray-100">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {!isAuthenticated() && (
                      <Link
                        to="/register"
                        className="group bg-white text-green-800 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                      >
                        <span>Commencer</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className="group border border-white text-white px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/20 flex items-center space-x-2"
                    >
                      <span>Voir les produits</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300 group"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125 w-6"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-12 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Pourquoi choisir{" "}
              <span className="text-green-600">AgroBusiness</span> ?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Une expérience d'achat unique alliant technologie et authenticité
              agricole
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 hover:border-green-200"
              >
                <div
                  className={`w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CATEGORIES SECTION === */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3">
              <Award className="w-4 h-4" />
              <span className="font-semibold text-sm">Nos Catégories</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Découvrez nos <span className="text-green-600">produits</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Explorez notre sélection de produits frais soigneusement
              catégorisés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${category.gradient}`}
                  ></div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        {category.name}
                      </h3>
                      <p className="text-green-100 text-sm mb-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                          {category.count}
                        </span>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <ArrowRight className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURED PRODUCTS - 6 PAR LIGNE === */}
      <section className="py-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3">
              <Star className="w-4 h-4" />
              <span className="font-semibold text-sm">Produits Populaires</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Nos <span className="text-green-600">produits frais</span> en
              vedette
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Une sélection exclusive de produits directement issus de nos
              fermes partenaires
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <div key={product.id} className="flex">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/products"
                  className="group inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <span>Voir tous les produits</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Produits en préparation
              </h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Nos producteurs préparent de nouveaux produits frais. Revenez
                bientôt !
              </p>
            </div>
          )}
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="py-12 bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à révolutionner votre{" "}
            <span className="text-green-300">expérience agricole</span> ?
          </h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Rejoignez des milliers de producteurs et d'acheteurs qui ont déjà
            choisi AgroBusiness.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-green-800 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="group border border-green-300 text-green-100 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-green-700"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
