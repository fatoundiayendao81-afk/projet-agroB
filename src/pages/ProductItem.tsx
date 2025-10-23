import { useState } from "react";
import type { Product } from "../types";  // ✅ import du type
import EditProductModal from "./EditProductModal";

interface ProductItemProps {
  product: Product;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEditClick = () => {
    setSelectedProduct(product);
    setOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
      <img
        src={product.image}
        alt={product.title}
        className="rounded-lg h-40 object-cover mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
      <p className="text-gray-500">{product.price} FCFA</p>

      <button
        onClick={handleEditClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
      >
        ✏️ Modifier
      </button>

      {open && selectedProduct && (
        <EditProductModal
          key={selectedProduct.id}
          isOpen={open}
          onClose={() => setOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ProductItem;
