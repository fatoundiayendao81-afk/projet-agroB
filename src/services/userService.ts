import type { User } from "../types";

const API_URL = "http://localhost:5000/users";

const fetchAPI = async (
  url: string,
  options: RequestInit = {}
): Promise<unknown> => {
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

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    return (await fetchAPI(API_URL)) as User[];
  },

  getUserById: async (id: string): Promise<User> => {
    return (await fetchAPI(`${API_URL}/${id}`)) as User;
  },

  blockUser: async (id: string): Promise<User> => {
    return (await fetchAPI(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ blocked: true }),
    })) as User;
  },

  unblockUser: async (id: string): Promise<User> => {
    return (await fetchAPI(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ blocked: false }),
    })) as User;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await fetchAPI(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return (await fetchAPI(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })) as User;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    return (await fetchAPI(API_URL, {
      method: "POST",
      body: JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString(),
        blocked: false,
      }),
    })) as User;
  },
};

export default userService;
