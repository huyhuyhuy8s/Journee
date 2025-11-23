import axios, { AxiosError } from "axios";
import {
  API_FETCH_ALL_USERS,
  API_FETCH_USER,
  API_LOGIN,
  API_REGISTER,
} from "@/api/apiRoutes";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      // You can add navigation logic here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post(API_LOGIN, { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post(API_REGISTER, { name, email, password }),

  logout: () => apiClient.post("/api/users/logout"),

  validateToken: () => apiClient.get("/api/users/validate-token"),

  getProfile: () => apiClient.get("/api/users/profile"),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiClient.put("/api/users/profile", data),

  getAllUsers: () => apiClient.get(API_FETCH_ALL_USERS),

  getUserById: (id: string) => apiClient.get(API_FETCH_USER.replace(":id", id)),
};
