import type { User } from "../types";

const API_URL = "http://localhost:5000/users";
const CURRENT_USER_KEY = "agriecom_current_user";

const validateUserData = (
  userData: Partial<User>,
  isUpdate: boolean = false
): string[] => {
  const errors: string[] = [];

  if (!isUpdate || userData.email !== undefined) {
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.push("Email invalide");
    }
  }

  if (
    !isUpdate &&
    (!userData.password || (userData.password as string).length < 6)
  ) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères");
  }

  if (!isUpdate || userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    }
  }

  return errors;
};

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

export const authService = {
  getUsers: async (): Promise<User[]> => {
    try {
      return await fetchAPI(API_URL);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs:",
        error
      );
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      if (!email || !password) {
        throw new Error("Email et mot de passe requis");
      }

      const cleanEmail = email.toLowerCase().trim();
      const cleanPassword = password.trim();

      console.log("🔄 LOGIN - Recherche utilisateur:", cleanEmail);

      const users = await authService.getUsers();

      console.log(
        "📋 Utilisateurs en base:",
        users.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          blocked: u.blocked,
        }))
      );

      let userFound: User | null = null;
      let rejectionReason: string | null = null;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userEmail = user.email ? user.email.toLowerCase().trim() : "";

        console.log(`🔍 Vérification: ${userEmail} vs ${cleanEmail}`);

        if (userEmail === cleanEmail) {
          if (user.password === cleanPassword) {
            if (!user.blocked) {
              userFound = user;
              break;
            } else {
              rejectionReason =
                "Votre compte a été bloqué. Contactez l'administrateur.";
              break;
            }
          } else {
            rejectionReason = "Mot de passe incorrect";
            break;
          }
        }
      }

      if (userFound) {
        console.log("✅ CONNEXION RÉUSSIE:", userFound.name);

        const updatedUser: User = {
          ...userFound,
          lastLogin: new Date().toISOString(),
        };

        await fetchAPI(`${API_URL}/${userFound.id}`, {
          method: "PATCH",
          body: JSON.stringify({ lastLogin: updatedUser.lastLogin }),
        });

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

        return updatedUser;
      } else {
        if (rejectionReason) {
          throw new Error(rejectionReason);
        } else {
          throw new Error(`Aucun compte trouvé avec l'email: ${email}`);
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      throw error;
    }
  },

  register: async (userData: Partial<User>): Promise<User> => {
    try {
      const validationErrors = validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      const cleanEmail = (userData.email as string).toLowerCase().trim();

      const users = await authService.getUsers();
      const existingUser = users.find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );

      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: cleanEmail,
        password: (userData.password as string).trim(),
        name: (userData.name as string).trim(),
        role: userData.role || "client",
        phone: userData.phone || "",
        address: userData.address || "",
        farmName: userData.farmName || "",
        description: userData.description || "",
        blocked: false,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      const createdUser = await fetchAPI(API_URL, {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(createdUser));
      console.log("✅ Nouvel utilisateur créé:", createdUser.name);

      return createdUser;
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  logout: (): boolean => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      console.log("👋 Utilisateur déconnecté");
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      return false;
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      const parsedUser = user ? JSON.parse(user) : null;
      return parsedUser;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur:",
        error
      );
      return null;
    }
  },

  updateProfile: async (
    userId: string,
    userData: Partial<User>
  ): Promise<User> => {
    try {
      const validationErrors = validateUserData(userData, true);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      if (userData.email) {
        const cleanEmail = userData.email.toLowerCase().trim();
        const users = await authService.getUsers();
        const emailExists = users.some(
          (user) =>
            user.id !== userId && user.email.toLowerCase().trim() === cleanEmail
        );

        if (emailExists) {
          throw new Error(
            "Cet email est déjà utilisé par un autre utilisateur"
          );
        }
      }

      const updatedUser = await fetchAPI(`${API_URL}/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      });

      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  toggleBlockUser: async (userId: string): Promise<User> => {
    try {
      const user = await fetchAPI(`${API_URL}/${userId}`);
      const updatedUser = await fetchAPI(`${API_URL}/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: !user.blocked }),
      });

      if (updatedUser.blocked) {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          authService.logout();
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("❌ Erreur lors de la modification du statut:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await fetchAPI(`${API_URL}/${userId}`, {
        method: "DELETE",
      });

      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        authService.logout();
      }

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      throw error;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  hasRole: (role: User["role"]): boolean => {
    const user = authService.getCurrentUser();
    return user ? user.role === role : false;
  },

  isAdmin: (): boolean => {
    return authService.hasRole("admin");
  },

  isProducer: (): boolean => {
    return authService.hasRole("producer");
  },

  isClient: (): boolean => {
    return authService.hasRole("client");
  },
};
