import type { Product, ProductApproval } from "../types";
import { approvalService } from "./approvalService";

const API_URL = "http://localhost:5000/products";

const fetchAPI = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
};

export const productService = {
  // ✅ Récupérer tous les produits
  getProducts: async (): Promise<Product[]> => {
    return await fetchAPI<Product[]>(API_URL);
  },

  getApprovedProducts: async (): Promise<Product[]> => {
    const products = await fetchAPI<Product[]>(API_URL);
    return products.filter((product) => product.status === "approved");
  },

  getProductById: async (id: string): Promise<Product> => {
    return await fetchAPI<Product>(`${API_URL}/${id}`);
  },

  getUserProducts: async (userId: string): Promise<Product[]> => {
    const products = await fetchAPI<Product[]>(API_URL);
    return products.filter((product) => product.sellerId === userId);
  },

  // ✅ Ajouter un produit (avec approbation)
  addProduct: async (
    productData: Partial<Product>
  ): Promise<ProductApproval> => {
    if (!productData.sellerId) {
      throw new Error("ID du vendeur requis");
    }

    const approval = await approvalService.createProductApproval({
      productId: `temp-${Date.now()}`,
      action: "create",
      productData: {
        ...productData,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "pending",
      },
      producerId: productData.sellerId,
      producerName: productData.sellerName,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    return approval;
  },

  // ✅ Mettre à jour un produit (version corrigée)
  updateProduct: async (
  id: string,
  productData: Partial<Product>,
  isAdmin: boolean = false
): Promise<ProductApproval | Product> => {

    const existingProduct = await productService.getProductById(id);

    if (!existingProduct) {
      throw new Error("Produit introuvable");
    }

   if (isAdmin) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...productData,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok)
    throw new Error("Erreur lors de la mise à jour directe du produit");

  return response.json();
}


    // 🔹 Sinon → création d'une demande d’approbation (pour producteurs)
    const approval = await approvalService.createProductApproval({
      productId: id,
      action: "update",
      productData: {
        ...productData,
        updatedAt: new Date().toISOString(),
      },
      producerId: existingProduct.sellerId,
      producerName: existingProduct.sellerName,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    return approval;
  },

  // ✅ Supprimer un produit (demande d’approbation)
  deleteProduct: async (id: string): Promise<ProductApproval> => {
    const existingProduct = await productService.getProductById(id);

    const approval = await approvalService.createProductApproval({
      productId: id,
      action: "delete",
      producerId: existingProduct.sellerId,
      producerName: existingProduct.sellerName,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    return approval;
  },

  // ✅ Exécuter une action approuvée (admin)
  executeProductAction: async (
    approval: ProductApproval
  ): Promise<Product | boolean> => {
    switch (approval.action) {
      case "create": {
        if (!approval.productData)
          throw new Error("Données du produit manquantes");

        const productToCreate = {
          ...approval.productData,
          id: Date.now().toString(),
          status: "approved" as const,
          createdAt: new Date().toISOString(),
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productToCreate),
        });

        if (!response.ok)
          throw new Error("Erreur lors de la création du produit");

        return response.json();
      }

      case "update": {
        if (!approval.productData)
          throw new Error("Données de mise à jour manquantes");

        const updateResponse = await fetch(
          `${API_URL}/${approval.productId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(approval.productData),
          }
        );

        if (!updateResponse.ok)
          throw new Error("Erreur lors de la mise à jour du produit");

        return updateResponse.json();
      }

      case "delete": {
        const deleteResponse = await fetch(
          `${API_URL}/${approval.productId}`,
          { method: "DELETE" }
        );

        if (!deleteResponse.ok)
          throw new Error("Erreur lors de la suppression du produit");

        return true;
      }

      default:
        throw new Error("Action non supportée");
    }
  },

  // ✅ Méthodes directes pour les admins
  adminAddProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "approved",
      }),
    });

    if (!response.ok) throw new Error("Erreur lors de l'ajout du produit");
    return response.json();
  },

  adminUpdateProduct: async (
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

  adminDeleteProduct: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erreur lors de la suppression");
    return true;
  },

  // ✅ Mise à jour du statut (approbation)
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

  searchProducts: async (
    query: string,
    category: string = ""
  ): Promise<Product[]> => {
    const products = await fetchAPI<Product[]>(API_URL);
    return products.filter((p) => {
      const matchQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      const matchCategory = !category || p.category === category;
      return matchQuery && matchCategory;
    });
  },

  getPendingProducts: async (): Promise<Product[]> => {
    const products = await fetchAPI<Product[]>(API_URL);
    return products.filter((p) => p.status === "pending");
  },
};

export default productService;
