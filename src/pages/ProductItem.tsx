import { useState } from "react";
import EditProductModal from "./EditProductModal";

const ProductItem = ({ product }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
      <img src={product.image} alt={product.title} className="rounded-lg h-40 object-cover mb-4" />
      <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
      <p className="text-gray-500">{product.price} FCFA</p>

      <button
        onClick={() => setOpen(true)}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
      >
        ✏️ Modifier
      </button>

      <EditProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        product={product}
      />
    </div>
  );
};
