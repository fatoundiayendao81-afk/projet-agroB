// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import type { User, AuthContextType } from "../types";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const user = authService.getCurrentUser();
        console.log("🔄 AuthContext - Utilisateur chargé:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error(
          "❌ AuthContext - Erreur lors du chargement de l'utilisateur:",
          error
        );
        setCurrentUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
        console.log("✅ AuthContext - Initialisation terminée");
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      console.log("✅ AuthContext - Connexion réussie:", user.name);
      return user;
    } catch (error) {
      console.error("❌ AuthContext - Erreur de connexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
      console.log("✅ AuthContext - Inscription réussie:", user.name);
      return user;
    } catch (error) {
      console.error("❌ AuthContext - Erreur d'inscription:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    try {
      console.log("👋 AuthContext - Déconnexion de:", currentUser?.name);
      setCurrentUser(null);
      authService.logout();
      console.log("✅ AuthContext - Déconnexion réussie");
    } catch (error) {
      console.error("❌ AuthContext - Erreur lors de la déconnexion:", error);
      setCurrentUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    if (!currentUser) {
      throw new Error("Aucun utilisateur connecté");
    }

    try {
      const updatedUser = await authService.updateProfile(
        currentUser.id,
        userData
      );
      setCurrentUser(updatedUser);
      console.log("✅ AuthContext - Profil mis à jour:", updatedUser.name);
      return updatedUser;
    } catch (error) {
      console.error(
        "❌ AuthContext - Erreur lors de la mise à jour du profil:",
        error
      );
      throw error;
    }
  };

  const hasRole = (role: User["role"]): boolean => {
    return currentUser?.role === role;
  };

  const hasAnyRole = (roles: User["role"][]): boolean => {
    return roles.includes(currentUser?.role as User["role"]);
  };

  const isAuthenticated = (): boolean => {
    return !!currentUser && !currentUser.blocked;
  };

  const isBlocked = (): boolean => {
    return currentUser?.blocked === true;
  };

  const getUserRole = (): string => {
    return currentUser?.role || "guest";
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isProducer = (): boolean => {
    return authService.isProducer();
  };

  const isClient = (): boolean => {
    return authService.isClient();
  };

  const blockUser = async (userId: string): Promise<boolean> => {
    try {
      await authService.toggleBlockUser(userId);
      if (currentUser && currentUser.id === userId) {
        logout();
      }
      return true;
    } catch (error) {
      console.error("❌ AuthContext - Erreur lors du blocage:", error);
      throw error;
    }
  };

  const unblockUser = async (userId: string): Promise<boolean> => {
    try {
      await authService.toggleBlockUser(userId);
      return true;
    } catch (error) {
      console.error("❌ AuthContext - Erreur lors du déblocage:", error);
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await authService.deleteUser(userId);
      if (currentUser && currentUser.id === userId) {
        logout();
      }
      return true;
    } catch (error) {
      console.error("❌ AuthContext - Erreur lors de la suppression:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    authChecked,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isBlocked,
    getUserRole,
    isAdmin,
    isProducer,
    isClient,
    blockUser,
    unblockUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
