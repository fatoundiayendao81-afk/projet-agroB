import type { User } from "../types";

const API_URL = "http://localhost:5000/users";

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

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    return await fetchAPI<User[]>(API_URL);
  },

  getUserById: async (id: string): Promise<User> => {
    return await fetchAPI<User>(`${API_URL}/${id}`);
  },

  blockUser: async (id: string): Promise<User> => {
    return await fetchAPI<User>(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ blocked: true }),
    });
  },

  unblockUser: async (id: string): Promise<User> => {
    return await fetchAPI<User>(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ blocked: false }),
    });
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await fetchAPI(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return await fetchAPI<User>(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    return await fetchAPI<User>(API_URL, {
      method: "POST",
      body: JSON.stringify({
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        blocked: false,
      }),
    });
  },
};

export default userService;
