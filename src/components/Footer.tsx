import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Leaf,
  ArrowRight,
  Shield,
  Heart,
  Globe,
  Download,
} from "lucide-react";

const Footer: React.FC = () => {
  const legalLinks = [
    { path: "/mentions-legales", label: "Mentions légales" },
    { path: "/conditions", label: "Conditions générales" },
    { path: "/paiement", label: "Moyens de paiement" },
    { path: "/bons-achat", label: "Bons d'achat" },
    { path: "/plan-vigilance", label: "Plan de vigilance" },
    { path: "/confidentialite", label: "Confidentialité" },
    { path: "/alerte-anonyme", label: "Alerte anonyme" },
  ];

  const services = [
    { name: "Sama Kalpé Auchan", description: "Partenariat exclusif" },
    { name: "Service Après-Vente", description: "Support 7j/7" },
    { name: "Livraison Express", description: "24-48h" },
    { name: "Paiement Sécurisé", description: "Multiples options" },
  ];

  const contactInfo = [
    {
      icon: <Mail size={16} />,
      text: "contact@agrobusiness.sn",
      link: "mailto:contact@agrobusiness.sn",
    },
    {
      icon: <Phone size={16} />,
      text: "+221 33 123 45 67",
      link: "tel:+221331234567",
    },
    { icon: <MapPin size={16} />, text: "Dakar, Sénégal", link: "#" },
  ];

  const socialLinks = [
    {
      icon: <Facebook size={20} />,
      href: "https://facebook.com/agrobusiness",
      label: "Facebook",
      color: "hover:bg-blue-600",
    },
    {
      icon: <Instagram size={20} />,
      href: "https://instagram.com/agrobusiness",
      label: "Instagram",
      color: "hover:bg-pink-600",
    },
    {
      icon: <Twitter size={20} />,
      href: "https://twitter.com/agrobusiness",
      label: "Twitter",
      color: "hover:bg-blue-400",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-green-900 to-green-800 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-green-700/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-5 h-5 text-green-300" />
                <span className="text-green-300 font-semibold">Newsletter</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Restez <span className="text-green-300">informé</span>
              </h3>
              <p className="text-green-100">
                Recevez nos actualités et offres exclusives directement dans
                votre boîte mail.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre email professionnel"
                className="flex-1 px-4 py-3 rounded-2xl border border-green-600 bg-green-800/50 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-600/25 flex items-center space-x-2 group">
                <span>S'abonner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf size={24} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors">
                  AgroBusiness
                </div>
                <div className="text-green-300 text-sm font-medium">
                  Excellence Agricole Digitale
                </div>
              </div>
            </Link>

            <p className="text-green-100 leading-relaxed mb-6 max-w-md">
              Plateforme leader de l'agroalimentaire au Sénégal, connectant
              producteurs et acheteurs pour une agriculture moderne, équitable
              et durable.
            </p>

            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-green-700 text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color} group`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-green-300" />
              <span>Nos Services</span>
            </h3>
            <ul className="space-y-4">
              {services.map((service, index) => (
                <li key={index} className="group">
                  <div className="text-green-100 font-semibold group-hover:text-green-300 transition-colors">
                    {service.name}
                  </div>
                  <div className="text-green-300 text-sm">
                    {service.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-300" />
              <span>Informations Légales</span>
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-green-100 hover:text-green-300 transition-colors text-sm flex items-center space-x-2 group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-300" />
              <span>Contact</span>
            </h3>

            <div className="space-y-4 mb-6">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.link}
                  className="flex items-center space-x-3 text-green-100 hover:text-green-300 transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    {contact.icon}
                  </div>
                  <span className="text-sm">{contact.text}</span>
                </a>
              ))}
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-600/25 group"
            >
              <span>Nous Contacter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-700/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-green-300">
              <span>© {new Date().getFullYear()} AgroBusiness SAS</span>
              <span className="hidden md:block">•</span>
              <span>Tous droits réservés</span>
              <span className="hidden md:block">•</span>
              <span>Capital social: 10.000.000 FCFA</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-300 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Service en ligne 24h/24</span>
              </div>

              <button className="flex items-center space-x-2 text-green-300 hover:text-green-200 transition-colors text-sm group">
                <Download className="w-4 h-4" />
                <span>App Mobile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-600 rounded-full -translate-x-1/2 translate-y-1/2 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-500 rounded-full translate-x-1/3 translate-y-1/2 opacity-20 blur-3xl"></div>
      </div>
    </footer>
  );
};

export default Footer;
