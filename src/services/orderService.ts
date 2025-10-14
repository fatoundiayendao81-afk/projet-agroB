import type { Order, OrderItem, OrderApproval } from "../types";
import { approvalService } from "./approvalService";

const API_URL = "http://localhost:5000/orders";

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

export const getAllOrders = async (): Promise<Order[]> => {
  return await fetchAPI<Order[]>(API_URL);
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const orders = await fetchAPI<Order[]>(API_URL);
  return orders.filter((order: Order) => order.userId === userId);
};

export const getProducerOrders = async (
  producerId: string
): Promise<Order[]> => {
  const orders = await fetchAPI<Order[]>(API_URL);
  return orders.filter((order: Order) =>
    order.items.some((item: OrderItem) => item.sellerId === producerId)
  );
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  return await fetchAPI<Order>(`${API_URL}/${orderId}`);
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<OrderApproval> => {
  if (!orderData.userId) {
    throw new Error("ID utilisateur requis");
  }

  // Pour les clients, créer une demande d'approbation
  const approval = await approvalService.createOrderApproval({
    orderId: `temp-${Date.now()}`,
    action: "create",
    orderData: {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `CMD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
    },
    clientId: orderData.userId,
    clientName: orderData.userName,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return approval;
};

export const cancelOrder = async (
  orderId: string,
  reason: string = "",
  userId: string
): Promise<OrderApproval> => {
  // Récupérer la commande existante
  const existingOrder = await getOrderById(orderId);

  // Vérifier que l'utilisateur est bien le propriétaire de la commande
  if (existingOrder.userId !== userId) {
    throw new Error("Vous n'êtes pas autorisé à annuler cette commande");
  }

  // Pour les clients, créer une demande d'approbation
  const approval = await approvalService.createOrderApproval({
    orderId: orderId,
    action: "cancel",
    orderData: {
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    },
    clientId: existingOrder.userId,
    clientName: existingOrder.userName,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return approval;
};

// Méthode pour les admins pour exécuter les actions approuvées
export const executeOrderAction = async (
  approval: OrderApproval
): Promise<Order | boolean> => {
  switch (approval.action) {
    case "create": {
      if (!approval.orderData) {
        throw new Error("Données de commande manquantes");
      }

      const orderToCreate = {
        ...approval.orderData,
        id: Date.now().toString(),
        status: "processing" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderToCreate),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de la commande");
      return response.json();
    }

    case "cancel": {
      const cancelResponse = await fetch(`${API_URL}/${approval.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancellationReason: approval.orderData?.cancellationReason,
          cancelledAt: approval.orderData?.cancelledAt,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!cancelResponse.ok)
        throw new Error("Erreur lors de l'annulation de la commande");
      return cancelResponse.json();
    }

    default:
      throw new Error("Action non supportée");
  }
};

// Méthodes directes pour les admins (sans approbation)
export const adminCreateOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  const newOrder: Order = {
    ...(orderData as Order),
    id: Date.now().toString(),
    orderNumber: `CMD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "processing",
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOrder),
  });

  if (!response.ok)
    throw new Error("Erreur lors de la création de la commande");
  return response.json();
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  trackingNumber: string | null = null
): Promise<Order> => {
  const updateData = {
    status,
    updatedAt: new Date().toISOString(),
    ...(trackingNumber && { trackingNumber }),
  };

  const response = await fetch(`${API_URL}/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");
  return response.json();
};

export const adminCancelOrder = async (
  orderId: string,
  reason: string = ""
): Promise<Order> => {
  const updateData = {
    status: "cancelled",
    cancellationReason: reason,
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_URL}/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });

  if (!response.ok)
    throw new Error("Erreur lors de l'annulation de la commande");
  return response.json();
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok)
    throw new Error("Erreur lors de la suppression de la commande");
  return true;
};

// Autres méthodes existantes...
export const getProducerStats = async (producerId: string) => {
  const orders = await getProducerOrders(producerId);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum: number, order: Order) => {
      const producerItems = order.items.filter(
        (item: OrderItem) => item.sellerId === producerId
      );
      return (
        sum +
        producerItems.reduce(
          (itemSum: number, item: OrderItem) =>
            itemSum + item.price * item.quantity,
          0
        )
      );
    }, 0),
    pendingOrders: orders.filter((order: Order) => order.status === "pending")
      .length,
    deliveredOrders: orders.filter(
      (order: Order) => order.status === "delivered"
    ).length,
    cancelledOrders: orders.filter(
      (order: Order) => order.status === "cancelled"
    ).length,
  };

  return stats;
};

export const getGlobalStats = async () => {
  const orders = await getAllOrders();

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce(
      (sum: number, order: Order) => sum + (order.total || 0),
      0
    ),
    pendingOrders: orders.filter((order: Order) => order.status === "pending")
      .length,
    confirmedOrders: orders.filter(
      (order: Order) => order.status === "processing"
    ).length,
    shippedOrders: orders.filter((order: Order) => order.status === "shipped")
      .length,
    deliveredOrders: orders.filter(
      (order: Order) => order.status === "delivered"
    ).length,
    cancelledOrders: orders.filter(
      (order: Order) => order.status === "cancelled"
    ).length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce(
            (sum: number, order: Order) => sum + (order.total || 0),
            0
          ) / orders.length
        : 0,
  };

  return stats;
};

interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
  userId?: string;
}

export const searchOrders = async (
  filters: OrderFilters = {}
): Promise<Order[]> => {
  const orders = await getAllOrders();

  return orders.filter((order: Order) => {
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (
      filters.startDate &&
      new Date(order.createdAt) < new Date(filters.startDate)
    ) {
      return false;
    }

    if (
      filters.endDate &&
      new Date(order.createdAt) > new Date(filters.endDate)
    ) {
      return false;
    }

    if (
      filters.orderNumber &&
      !order.orderNumber.includes(filters.orderNumber)
    ) {
      return false;
    }

    if (filters.userId && order.userId !== filters.userId) {
      return false;
    }

    return true;
  });
};

export const validateOrderData = (orderData: Partial<Order>): string[] => {
  const errors: string[] = [];

  if (!orderData.userId) {
    errors.push("ID utilisateur requis");
  }

  if (
    !orderData.items ||
    !Array.isArray(orderData.items) ||
    orderData.items.length === 0
  ) {
    errors.push("La commande doit contenir au moins un article");
  }

  if (orderData.items) {
    orderData.items.forEach((item: OrderItem, index: number) => {
      if (!item.productId) {
        errors.push(`Article ${index + 1}: ID produit requis`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Article ${index + 1}: Quantité invalide`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Article ${index + 1}: Prix invalide`);
      }
    });
  }

  if (!orderData.shippingAddress) {
    errors.push("Adresse de livraison requise");
  }

  return errors;
};

export const checkStock = async (items: OrderItem[]): Promise<string[]> => {
  const stockErrors: string[] = [];

  for (const item of items) {
    if (item.quantity > 10) {
      stockErrors.push(
        `Stock insuffisant pour le produit: ${item.productName}`
      );
    }
  }

  return stockErrors;
};

const orderService = {
  getAllOrders,
  getUserOrders,
  getProducerOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  executeOrderAction,
  adminCreateOrder,
  adminCancelOrder,
  getProducerStats,
  getGlobalStats,
  searchOrders,
  validateOrderData,
  checkStock,
};

export default orderService;
