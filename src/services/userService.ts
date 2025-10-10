import { User } from "../types";

const API_URL = "http://localhost:5000/users";

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

export const getAllUsers = async (): Promise<User[]> => {
  return await fetchAPI(API_URL);
};

export const getUserById = async (id: string): Promise<User> => {
  return await fetchAPI(`${API_URL}/${id}`);
};

export const blockUser = async (id: string): Promise<User> => {
  return await fetchAPI(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ blocked: true }),
  });
};

export const unblockUser = async (id: string): Promise<User> => {
  return await fetchAPI(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ blocked: false }),
  });
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await fetchAPI(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return true;
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  return await fetchAPI(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  return await fetchAPI(API_URL, {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      createdAt: new Date().toISOString(),
      blocked: false,
    }),
  });
};
