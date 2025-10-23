import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditProductModal from "../pages/EditProductModal";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import type { Product } from "../types";

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!product) return <p>Produit introuvable</p>;

  return (
    <EditProductModal
      key={product.id} // ✅ force le re-mount pour formulaire propre
      product={product} // ✅ on passe le produit complet
      isOpen={true}
      onClose={() => window.history.back()}
      isAdmin={isAdmin()}
    />
  );
};

export default EditProductPage;
