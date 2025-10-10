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
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
      title: "Produits Frais de la Ferme",
      description:
        "Découvrez des produits agricoles frais directement de nos producteurs locaux.",
      badge: "🌱 Fraîcheur Garantie",
      gradient: "from-green-600/90 to-green-800/90",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80",
      title: "Circuit Court Garanti",
      description:
        "Soutenez l'agriculture locale avec des produits de saison et de qualité.",
      badge: "🔄 Circuit Court",
      gradient: "from-green-700/90 to-green-900/90",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80",
      title: "Livraison Rapide",
      description:
        "Recevez vos produits en 24h-48h, cueillis à maturité pour préserver leurs saveurs.",
      badge: "🚀 Livraison Express",
      gradient: "from-green-600/90 to-blue-600/90",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=2000&q=80",
      title: "Agriculture Durable",
      description:
        "Des pratiques respectueuses de l'environnement pour une alimentation saine.",
      badge: "🌍 Éco-responsable",
      gradient: "from-green-700/90 to-emerald-600/90",
    },
  ];

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Express",
      description: "Recevez vos produits frais en 24-48h maximum",
      color: "text-blue-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Paiement Sécurisé",
      description: "Transactions 100% sécurisées et garanties",
      color: "text-green-600",
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Produits Bio",
      description: "Selection rigoureuse de produits naturels",
      color: "text-emerald-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Support 7j/7",
      description: "Une équipe à votre écoute tous les jours",
      color: "text-purple-600",
    },
  ];

  const categories = [
    {
      name: "Légumes",
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=300&fit=crop",
      description: "Légumes frais de saison",
      count: "50+ Produits",
      gradient: "from-green-500/20 to-green-600/20",
    },
    {
      name: "Fruits",
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&h=300&fit=crop",
      description: "Fruits juteux et sucrés",
      count: "35+ Variétés",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      name: "Grains & Céréales",
      image:
        "https://images.unsplash.com/photo-1598974357801-37f2c1d74c84?w=500&h=300&fit=crop",
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
        <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-600 text-lg font-semibold">
          Chargement des produits...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Préparation de votre expérience AgroBusiness
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* === HERO CAROUSEL === */}
      <section className="relative h-screen overflow-hidden">
        <div className="relative h-full">
          {carouselImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-4"
              }`}
            >
              {/* Image de fond avec overlay gradient */}
              <div
                className="absolute inset-0 bg-cover bg-center transform scale-105"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
              ></div>

              {/* Contenu */}
              <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
                <div className="max-w-4xl mx-auto">
                  {/* Badge */}
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/30">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-semibold">{slide.badge}</span>
                  </div>

                  {/* Titre principal */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {slide.title.split(" ").map((word, i) => (
                      <span
                        key={i}
                        className="block bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent"
                      >
                        {word}
                      </span>
                    ))}
                  </h1>

                  {/* Description */}
                  <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed text-green-100 font-light">
                    {slide.description}
                  </p>

                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {!isAuthenticated() && (
                      <Link
                        to="/register"
                        className="group bg-white text-green-800 px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 flex items-center space-x-2"
                      >
                        <span>Commencer Maintenant</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className="group border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105 flex items-center space-x-2"
                    >
                      <span>Explorer les Produits</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Contrôles de navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-2xl w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-2xl w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Indicateurs de slide */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125 w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir{" "}
              <span className="text-green-600">AgroBusiness</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une expérience d'achat unique alliant technologie et authenticité
              agricole
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-200 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CATEGORIES SECTION === */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Nos Catégories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Découvrez nos <span className="text-green-600">produits</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorez notre sélection de produits frais soigneusement
              catégorisés pour votre commodité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${category.gradient}`}
                  ></div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>

                  {/* Contenu overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <div className="transform group-hover:translate-y-0 translate-y-4 transition-transform duration-300">
                      <h3 className="text-2xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-green-100 mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                          {category.count}
                        </span>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <ArrowRight className="w-5 h-5 text-green-600" />
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

      {/* === FEATURED PRODUCTS === */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Produits Populaires</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos <span className="text-green-600">produits frais</span> en
              vedette
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une sélection exclusive de produits directement issus de nos
              fermes partenaires
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/products"
                  className="group inline-flex items-center space-x-3 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-green-600/25 hover:scale-105"
                >
                  <span>Découvrir tous nos produits</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Produits en préparation
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Nos producteurs préparent actuellement de nouveaux produits
                frais. Revenez bientôt pour découvrir notre sélection !
              </p>
            </div>
          )}
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à révolutionner votre{" "}
            <span className="text-green-300">expérience agricole</span> ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de producteurs et d'acheteurs qui ont déjà
            choisi AgroBusiness pour une agriculture connectée et durable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-green-800 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Créer mon compte</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="group border-2 border-green-300 text-green-100 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:bg-green-700 hover:border-green-400"
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
