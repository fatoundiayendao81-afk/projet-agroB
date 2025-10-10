import type { Order, OrderItem } from "../types";

const API_URL = "http://localhost:5000/orders";

const fetchAPI = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
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
  try {
    return await fetchAPI(API_URL);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commandes:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const orders = await fetchAPI(API_URL);
    return orders.filter((order: Order) => order.userId === userId);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des commandes utilisateur:",
      error
    );
    throw error;
  }
};

export const getProducerOrders = async (
  producerId: string
): Promise<Order[]> => {
  try {
    const orders = await fetchAPI(API_URL);
    return orders.filter((order: Order) =>
      order.items.some((item: OrderItem) => item.sellerId === producerId)
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des commandes producteur:",
      error
    );
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    return await fetchAPI(`${API_URL}/${orderId}`);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commande:", error);
    throw error;
  }
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  try {
    const newOrder: Order = {
      ...(orderData as Order),
      id: Date.now().toString(),
      orderNumber: `CMD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
    };

    return await fetchAPI(API_URL, {
      method: "POST",
      body: JSON.stringify(newOrder),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création de la commande:", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  trackingNumber: string | null = null
): Promise<Order> => {
  try {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      ...(trackingNumber && { trackingNumber }),
    };

    return await fetchAPI(`${API_URL}/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
};

export const cancelOrder = async (
  orderId: string,
  reason: string = ""
): Promise<Order> => {
  try {
    const updateData = {
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await fetchAPI(`${API_URL}/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'annulation de la commande:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    await fetchAPI(`${API_URL}/${orderId}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la commande:", error);
    throw error;
  }
};

interface ProducerStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export const getProducerStats = async (
  producerId: string
): Promise<ProducerStats> => {
  try {
    const orders = await getProducerOrders(producerId);

    const stats: ProducerStats = {
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
  } catch (error) {
    console.error("❌ Erreur lors du calcul des statistiques:", error);
    throw error;
  }
};

interface GlobalStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const orders = await getAllOrders();

    const stats: GlobalStats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce(
        (sum: number, order: Order) => sum + (order.total || 0),
        0
      ),
      pendingOrders: orders.filter((order: Order) => order.status === "pending")
        .length,
      confirmedOrders: orders.filter(
        (order: Order) => order.status === "confirmed"
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
  } catch (error) {
    console.error("❌ Erreur lors du calcul des statistiques globales:", error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error("❌ Erreur lors de la recherche des commandes:", error);
    throw error;
  }
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
  try {
    const stockErrors: string[] = [];

    for (const item of items) {
      if (item.quantity > 10) {
        stockErrors.push(
          `Stock insuffisant pour le produit: ${item.productName}`
        );
      }
    }

    return stockErrors;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du stock:", error);
    throw error;
  }
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
  getProducerStats,
  getGlobalStats,
  searchOrders,
  validateOrderData,
  checkStock,
};

export default orderService;
