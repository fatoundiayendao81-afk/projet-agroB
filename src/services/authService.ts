// services/authService.ts
import type { User } from "../types";

const API_URL = "http://localhost:5000/users";

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}?email=${email}`);
    const users: User[] = await response.json();

    if (!response.ok || users.length === 0) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = users[0];

    if (user.password !== password) {
      throw new Error("Mot de passe incorrect");
    }

    if (user.blocked) {
      throw new Error("Compte bloqué");
    }

    // Mettre à jour lastLogin
    await fetch(`${API_URL}/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastLogin: new Date().toISOString() }),
    });

    // Stocker l'utilisateur dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }

    return user;
  },

  register: async (userData: Partial<User>): Promise<User> => {
    // Vérifier si l'email existe déjà
    const checkResponse = await fetch(`${API_URL}?email=${userData.email}`);
    const existingUsers: User[] = await checkResponse.json();

    if (existingUsers.length > 0) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || "",
      email: userData.email || "",
      password: userData.password || "",
      role: userData.role || "client",
      phone: userData.phone || "",
      address: userData.address || "",
      farmName: userData.farmName || "",
      description: userData.description || "",
      blocked: false,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'inscription");
    }

    const createdUser = await response.json();

    // Stocker l'utilisateur dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(createdUser));
    }

    return createdUser;
  },

  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (
    userId: string,
    userData: Partial<User>
  ): Promise<User> => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du profil");
    }

    const updatedUser = await response.json();

    // Mettre à jour le localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }

    return updatedUser;
  },

  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "admin";
  },

  isProducer: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "producer";
  },

  isClient: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "client";
  },

  toggleBlockUser: async (userId: string): Promise<User> => {
    const user = await fetch(`${API_URL}/${userId}`).then((res) => res.json());
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !user.blocked }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors du blocage/déblocage");
    }

    return response.json();
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    return true;
  },
};
