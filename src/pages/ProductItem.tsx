import { useState } from "react";
import EditProductModal from "./EditProductModal"; // le vrai modal

import type { Product } from "../types";

type ProductItemProps = {
  product: Product;
  currentUser: any;
  isProducer: () => boolean;
  isAdmin: () => boolean;
};

const ProductItem = ({ product, currentUser, isProducer, isAdmin }: ProductItemProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="border p-3 rounded mb-2 flex justify-between items-center">
      <div>
        <p>{product.title}</p>
        <p>{product.price} FCFA</p>
      </div>
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded"
        onClick={() => setModalOpen(true)}
      >
        Modifier
      </button>

      <EditProductModal
        productId={product.id}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={currentUser}
        isProducer={isProducer}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default ProductItem;
