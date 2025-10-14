import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import MyProducts from "../pages/MyProducts";
import Livraison from "../components/Livraison";
import Payment from "../components/Payment";
import Confirmation from "../components/Confirmation";
import About from "../pages/About";
import AddProductForm from "../pages/AddProductForm";
import EditProductForm from "../pages/EditProductForm";


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/my-products" element={<MyProducts />} />
      <Route path="/livraison" element={<Livraison />} />
      <Route path="/paiement" element={<Payment />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/about" element={<About />} />
      <Route path="/add-product" element={<AddProductForm />} />
      <Route path="/edit-product/:id" element={<EditProductForm />} />
    </Routes>
  );
};

export default AppRoutes;
