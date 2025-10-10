import React from "react";

const About: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <section className="bg-green-800 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">À propos d'AgriEcom 🌱</h1>
        <p className="text-lg max-w-2xl mx-auto text-green-100">
          La plateforme qui connecte les producteurs, éleveurs et acheteurs pour
          une agriculture plus moderne, équitable et durable.
        </p>
      </section>

      <section className="py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-green-700 mb-6">
            Notre Mission
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            Chez <strong>AgriEcom</strong>, nous croyons que l'avenir de
            l'agriculture passe par la digitalisation et la collaboration. Notre
            mission est de permettre aux acteurs du monde agricole d'échanger
            facilement leurs produits, d'accéder à de nouveaux marchés et
            d'améliorer leurs revenus grâce à une plateforme simple, rapide et
            sécurisée.
          </p>
        </div>
      </section>

      <section className="bg-green-50 py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-green-700 text-center mb-10">
            Nos Valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white shadow-md rounded-2xl p-8 border-t-4 border-green-600 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-green-800">
                🌾 Transparence
              </h3>
              <p className="text-gray-700">
                Nous facilitons la mise en relation directe entre producteurs et
                acheteurs, sans intermédiaires cachés.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-8 border-t-4 border-green-600 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-green-800">
                🤝 Confiance
              </h3>
              <p className="text-gray-700">
                Chaque transaction est sécurisée et chaque vendeur est vérifié
                pour garantir une expérience fiable.
              </p>
            </div>
            <div className="bg-white shadow-md rounded-2xl p-8 border-t-4 border-green-600 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-green-800">
                🌍 Durabilité
              </h3>
              <p className="text-gray-700">
                Nous soutenons une agriculture respectueuse de l'environnement
                et des communautés locales.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-green-700 mb-10">
            Une Équipe Passionnée
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            L'équipe d'AgriEcom est composée de jeunes passionnés d'agriculture,
            de technologie et d'innovation. Nous travaillons main dans la main
            avec les agriculteurs pour bâtir un avenir plus connecté et plus
            durable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 shadow-md rounded-xl bg-white hover:shadow-lg transition">
              <img
                src="https://via.placeholder.com/150"
                alt="Fondateur"
                className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
              />
              <h4 className="text-lg font-semibold text-green-800">
                Abdoul Salam Diallo
              </h4>
              <p className="text-gray-600 text-sm">Fondateur & Développeur</p>
            </div>

            <div className="p-6 shadow-md rounded-xl bg-white hover:shadow-lg transition">
              <img
                src="https://via.placeholder.com/150"
                alt="Membre équipe"
                className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
              />
              <h4 className="text-lg font-semibold text-green-800">
                Fatou Ndiaye
              </h4>
              <p className="text-gray-600 text-sm">Responsable communication</p>
            </div>

            <div className="p-6 shadow-md rounded-xl bg-white hover:shadow-lg transition">
              <img
                src="https://via.placeholder.com/150"
                alt="Membre équipe"
                className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
              />
              <h4 className="text-lg font-semibold text-green-800">
                Mamadou Ba
              </h4>
              <p className="text-gray-600 text-sm">Expert agricole</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-800 text-green-100 text-center py-10">
        <h3 className="text-xl font-semibold mb-3">
          Ensemble, faisons grandir l'agriculture de demain 🌾
        </h3>
        <p className="text-green-200">
          Rejoignez la communauté AgriEcom et contribuez à une économie agricole
          plus équitable et connectée.
        </p>
      </section>
    </div>
  );
};

export default About;
