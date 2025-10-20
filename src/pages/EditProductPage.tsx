import React from "react";
import { useParams } from "react-router-dom";
import EditProductModal from "../pages/EditProductModal";
import { useAuth } from "../context/AuthContext";

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, isProducer, isAdmin } = useAuth();

  if (!id) return null;

  return (
    <EditProductModal
      productId={id}
      isOpen={true}
      onClose={() => window.history.back()}
      currentUser={currentUser}
      isProducer={isProducer}
      isAdmin={isAdmin}
    />
  );
};

export default EditProductPage;
