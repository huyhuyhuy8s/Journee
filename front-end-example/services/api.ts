import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:3001/api"; // Replace with your backend URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    // if (error.response?.status === 401) {
    // return
    // }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post("/register", { name, email, password }),

  logout: () => apiClient.post("/logout"),

  validateToken: () => apiClient.get("/validate-token"),

  getProfile: () => apiClient.get("/profile"),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiClient.put("/profile", data),

  getUsers: () => apiClient.get("/users"),
};
