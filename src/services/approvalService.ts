import type { ProductApproval, OrderApproval, ApprovalStats } from "../types";

const API_URL = "http://localhost:5000";

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

export const approvalService = {
  // Gestion des approbations de produits
  getPendingProductApprovals: async (): Promise<ProductApproval[]> => {
    return await fetchAPI<ProductApproval[]>(
      `${API_URL}/productApprovals?status=pending`
    );
  },

  getProductApprovals: async (): Promise<ProductApproval[]> => {
    return await fetchAPI<ProductApproval[]>(`${API_URL}/productApprovals`);
  },

  getProducerProductApprovals: async (
    producerId: string
  ): Promise<ProductApproval[]> => {
    const approvals = await fetchAPI<ProductApproval[]>(
      `${API_URL}/productApprovals`
    );
    return approvals.filter((approval) => approval.producerId === producerId);
  },

  createProductApproval: async (
    approvalData: Omit<ProductApproval, "id">
  ): Promise<ProductApproval> => {
    return await fetchAPI<ProductApproval>(`${API_URL}/productApprovals`, {
      method: "POST",
      body: JSON.stringify({
        ...approvalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
      }),
    });
  },

  approveProductAction: async (
    approvalId: string,
    adminId: string,
    comment?: string
  ): Promise<ProductApproval> => {
    return await fetchAPI<ProductApproval>(
      `${API_URL}/productApprovals/${approvalId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminId,
          reviewComment: comment,
        }),
      }
    );
  },

  rejectProductAction: async (
    approvalId: string,
    adminId: string,
    comment?: string
  ): Promise<ProductApproval> => {
    return await fetchAPI<ProductApproval>(
      `${API_URL}/productApprovals/${approvalId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminId,
          reviewComment: comment,
        }),
      }
    );
  },

  // Gestion des approbations de commandes
  getPendingOrderApprovals: async (): Promise<OrderApproval[]> => {
    return await fetchAPI<OrderApproval[]>(
      `${API_URL}/orderApprovals?status=pending`
    );
  },

  getOrderApprovals: async (): Promise<OrderApproval[]> => {
    return await fetchAPI<OrderApproval[]>(`${API_URL}/orderApprovals`);
  },

  getClientOrderApprovals: async (
    clientId: string
  ): Promise<OrderApproval[]> => {
    const approvals = await fetchAPI<OrderApproval[]>(
      `${API_URL}/orderApprovals`
    );
    return approvals.filter((approval) => approval.clientId === clientId);
  },

  createOrderApproval: async (
    approvalData: Omit<OrderApproval, "id">
  ): Promise<OrderApproval> => {
    return await fetchAPI<OrderApproval>(`${API_URL}/orderApprovals`, {
      method: "POST",
      body: JSON.stringify({
        ...approvalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
      }),
    });
  },

  approveOrderAction: async (
    approvalId: string,
    adminId: string,
    comment?: string
  ): Promise<OrderApproval> => {
    return await fetchAPI<OrderApproval>(
      `${API_URL}/orderApprovals/${approvalId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminId,
          reviewComment: comment,
        }),
      }
    );
  },

  rejectOrderAction: async (
    approvalId: string,
    adminId: string,
    comment?: string
  ): Promise<OrderApproval> => {
    return await fetchAPI<OrderApproval>(
      `${API_URL}/orderApprovals/${approvalId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminId,
          reviewComment: comment,
        }),
      }
    );
  },

  // Statistiques des approbations
  getApprovalStats: async (): Promise<ApprovalStats> => {
    const [productApprovals, orderApprovals] = await Promise.all([
      approvalService.getPendingProductApprovals(),
      approvalService.getPendingOrderApprovals(),
    ]);

    return {
      pendingProductApprovals: productApprovals.length,
      pendingOrderApprovals: orderApprovals.length,
      totalApprovals: productApprovals.length + orderApprovals.length,
    };
  },
};

export default approvalService;
