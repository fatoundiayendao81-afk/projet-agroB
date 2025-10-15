// services/adminService.ts
import type { Stats } from "../types";

const API_URL = "http://localhost:5000";

export const adminService = {
  getAdminStats: async (): Promise<Stats> => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur fetch stats:", error);
      throw error;
    }
  },
};