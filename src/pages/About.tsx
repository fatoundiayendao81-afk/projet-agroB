import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  Shield,
  Leaf,
  TrendingUp,
  Globe,
  Heart,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";

const About: React.FC = () => {
  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparence Totale",
      description:
        "Mise en relation directe entre producteurs et acheteurs, sans intermédiaires cachés. Chaque transaction est traçable et transparente.",
      features: [
        "Prix équitables",
        "Traçabilité complète",
        "Aucun intermédiaire",
      ],
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Confiance Mutuelle",
      description:
        "Ecosystem vérifié et sécurisé où chaque acteur est authentifié. Votre sécurité est notre priorité absolue.",
      features: ["Vendeurs certifiés", "Paiements sécurisés", "Support dédié"],
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Durabilité Écologique",
      description:
        "Engagement pour une agriculture responsable qui respecte l'environnement et soutient les communautés locales.",
      features: ["Produits locaux", "Agriculture durable", "Circuit court"],
    },
  ];

  const stats = [
    { number: "500+", label: "Producteurs Actifs" },
    { number: "10K+", label: "Transactions" },
    { number: "95%", label: "Satisfaction Clients" },
    { number: "50+", label: "Communautés" },
  ];

  const teamMembers = [
    {
      name: "Abdoul Salam Diallo",
      role: "Co-fondateur & CTO",
      description:
        "Ingénieur passionné par le développement technologique et l’innovation numérique, engagé dans la transformation digitale du secteur agricole. Technologies émergentes : Intelligence Artificielle, Big Data, innovation appliquée. Programmation & développement : Conception et déploiement de solutions logicielles. Mathématiques appliquées : Algèbre linéaire, statistiques et modélisation pour l’IA. Veille technologique : Suivi actif des tendances en Data Science et Intelligence Artificielle.",
      image: "./src/assets/image/co-fondateur.png",
      specialties: ["Développement web", "Data Engineering", "Data Science"],
    },
    {
      name: "Fatou Ndiaye",
      role: "Co-fondatrice & CEO",
      description:
        "Visionnaire de l'agriculture digitale, elle combine expertise business et passion pour l'innovation agricole.",
      image: "./src/assets/image/fatou.jpg",
      specialties: ["Développement", "Stratégie", "Marketing", "Relations"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-600 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full translate-x-1/3 translate-y-1/3 opacity-20 blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-700/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-green-600/50">
            <Star className="w-4 h-4 text-green-300" />
            <span className="text-green-200 text-sm font-medium">
              Plateforme Agricole N°1 au Sénégal
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Révolutionner l'
            <span className="bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
              Agriculture
            </span>{" "}
            Digitale
          </h1>

          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed mb-8">
            La plateforme qui connecte intelligemment producteurs, éleveurs et
            acheteurs pour une agriculture{" "}
            <span className="text-green-300 font-semibold">
              moderne, équitable et durable
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-green-800 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Rejoindre la Révolution</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products"
              className="group border-2 border-green-300 text-green-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-green-700/50 hover:border-green-400"
            >
              Découvrir nos Produits
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-green-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Notre Mission</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Digitaliser l'Agriculture{" "}
              <span className="text-green-600">Africaine</span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Chez <strong className="text-green-700">AgroBusiness</strong>,
              nous croyons fermement que l'avenir de l'agriculture passe par une{" "}
              <span className="text-green-600 font-semibold">
                digitalisation intelligente
              </span>{" "}
              et une{" "}
              <span className="text-green-600 font-semibold">
                collaboration renforcée
              </span>
              . Notre mission est d'offrir aux acteurs du monde agricole les
              outils nécessaires pour échanger efficacement leurs produits,
              accéder à de nouveaux marchés et
              <span className="text-green-600 font-semibold">
                {" "}
                optimiser leurs revenus
              </span>{" "}
              grâce à une plateforme innovante, intuitive et sécurisée.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Croissance
              </h3>
              <p className="text-gray-600">
                Augmentation moyenne de 40% des revenus des producteurs
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Accessibilité
              </h3>
              <p className="text-gray-600">
                Marchés accessibles depuis n'importe quel appareil connecté
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Communauté
              </h3>
              <p className="text-gray-600">
                Réseau de confiance entre producteurs et acheteurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Nos Valeurs Fondamentales</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce qui nous <span className="text-green-600">distingue</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des principes solides qui guident chacune de nos actions et
              innovations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-200 hover:-translate-y-2"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {value.description}
                </p>

                <div className="space-y-3">
                  {value.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Notre Équipe</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Rencontrez les{" "}
              <span className="text-green-600">Visionnaires</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une équipe passionnée qui combine expertise technologique et amour
              pour l'agriculture
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 hover:border-green-200"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start space-x-6">
                  <div className="relative mb-6 md:mb-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <div className="text-green-600 font-semibold mb-3">
                      {member.role}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {member.description}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {member.specialties.map((specialty, specIndex) => (
                        <span
                          key={specIndex}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à rejoindre la{" "}
            <span className="text-green-300">révolution</span> agricole ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Que vous soyez producteur cherchant à élargir votre marché ou
            acheteur à la recherche de produits frais et locaux, AgroBusiness
            est la plateforme qu'il vous faut.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-green-800 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Commencer Maintenant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group border-2 border-green-300 text-green-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-green-700 hover:border-green-400"
            >
              Nous Contacter
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-green-500/30">
            <p className="text-green-200 text-lg">
              <span className="text-green-300 font-semibold">Ensemble</span>,
              cultivons l'avenir de l'agriculture africaine 🌱
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
