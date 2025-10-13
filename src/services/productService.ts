// services/productService.ts
import type { Product } from "../types";

const API_URL = "http://localhost:5000/products";

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erreur lors du chargement des produits");
    return response.json();
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Produit non trouvé");
    return response.json();
  },

  getUserProducts: async (userId: string): Promise<Product[]> => {
    const response = await fetch(`${API_URL}?sellerId=${userId}`);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des produits utilisateur");
    return response.json();
  },

  addProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productData,
        createdAt: new Date().toISOString(),
        status: "pending",
      }),
    });
    if (!response.ok) throw new Error("Erreur lors de l'ajout du produit");
    return response.json();
  },

  updateProduct: async (
    id: string,
    productData: Partial<Product>
  ): Promise<Product> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Erreur lors de la mise à jour");
    return response.json();
  },

  updateProductStatus: async (
    productId: string,
    status: string
  ): Promise<Product> => {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok)
      throw new Error("Erreur lors de la mise à jour du statut");
    return response.json();
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression");
    return true;
  },

  searchProducts: async (
    query: string,
    category: string = ""
  ): Promise<Product[]> => {
    const res = await fetch(API_URL);
    const products: Product[] = await res.json();
    return products.filter((p) => {
      const matchQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      const matchCategory = !category || p.category === category;
      return matchQuery && matchCategory;
    });
  },

  getPendingProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}?status=pending`);
    if (!response.ok)
      throw new Error("Erreur lors du chargement des produits en attente");
    return response.json();
  },
};
