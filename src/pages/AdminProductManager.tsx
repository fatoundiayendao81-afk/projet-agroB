import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import type { Product } from "../types";

const AdminProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});

  // 🔥 Chargement en temps réel
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (Snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    await addDoc(collection(db, "products"), form);
    setForm({});
  };

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    const ref = doc(db, "products", id);
    await updateDoc(ref, updates);
  };

  const handleDelete = async (id: string) => {
    const ref = doc(db, "products", id);
    await deleteDoc(ref);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gestion des produits</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nom du produit"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Prix"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Catégorie"
          value={form.category || ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="URL de l'image"
          value={form.image || ""}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="border p-2 rounded col-span-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded col-span-2"
        >
          Ajouter le produit
        </button>
      </form>

      {/* Liste des produits */}
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-gray-500">{p.price} F CFA</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate(p.id, { price: p.price + 500 })}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductManager;
