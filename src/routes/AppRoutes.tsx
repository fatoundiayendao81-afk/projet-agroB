import React from "react";
import { Routes, Route } from "react-router-dom";

// --- Pages principales ---
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import About from "../pages/About";
// --- Composants secondaires ---
import Livraison from "../components/Livraison";
import Payment from "../components/Payment";
import Confirmation from "../components/Confirmation";
// --- Modales / formulaires produits ---

 import EditProductPage from "../pages/EditProductPage"; // page wrapper pour modal
 import AdminProductManager from "../pages/AdminProductManager";
 import ProductPage from "../pages/ProductPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes principales */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/livraison" element={<Livraison />} />
      <Route path="/paiement" element={<Payment />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/about" element={<About />} />

      {/* Modales ou formulaires de gestion de produits */}
      * Route pour la page d'édition de produit
      <Route path="/edit-product/:id" element={<EditProductPage />} />
      <Route path="/admin/products" element={<AdminProductManager />} />
      <Route path="/add-product" element={<ProductPage />} />
      
    </Routes>
  );
};

export default AppRoutes;
