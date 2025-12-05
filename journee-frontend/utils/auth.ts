import axios, { AxiosError } from "axios";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppState } from "@/contexts/AppStateContext";
import { BackendApiServices } from "@/services/backendApiServices";
import {
  API_FETCH_ALL_USERS,
  API_FETCH_USER,
  API_LOGIN,
  API_REGISTER,
} from "@/api/apiRoutes";
import { BackgroundTaskService } from "@/components/Map/services/backgroundTaskService";

let globalAuthState: AuthState | null = null;
let globalAuthInitialized = false;
let globalTokenValidationInProgress = false;

const authListeners: Array<(state: AuthState) => void> = [];

const notifyAuthListeners = (newState: AuthState) => {
  globalAuthState = newState;
  authListeners.forEach((listener) => listener(newState));
};

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const isDevelopment = process.env.NODE_ENV === "development" || __DEV__;

const devLog = {
  log: (...args: any[]) => isDevelopment && console.log(...args),
  error: (...args: any[]) => isDevelopment && console.error(...args),
  warn: (...args: any[]) => isDevelopment && console.warn(...args),
};

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
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const method = config.method?.toUpperCase();
      const url = `${config.baseURL}${config.url}`;

      // Log request details
      devLog.log(`📤 [REQUEST] ${timestamp}`);
      devLog.log(`   Method: ${method}`);
      devLog.log(`   URL: ${url}`);
      devLog.log(`   Headers:`, config.headers);

      if (config.data) {
        const logData = { ...config.data };
        if (logData.password) logData.password = "***HIDDEN***";
        devLog.log(`   Body:`, logData);
      }
    }

    config.metadata = {
      startTime: Date.now(),
      timestamp: new Date().toISOString(),
    };

    return config;
  },
  (error) => {
    devLog.error("❌ [REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      const endTime = Date.now();
      const startTime = response.config.metadata?.startTime || endTime;
      const duration = endTime - startTime;
      const timestamp = new Date().toISOString();

      devLog.log(`📥 [RESPONSE] ${timestamp}`);
      devLog.log(`   Status: ${response.status} ${response.statusText}`);
      devLog.log(`   URL: ${response.config.url}`);
      devLog.log(`   Duration: ${duration}ms`);
      devLog.log(
        `   Response Size: ${JSON.stringify(response.data).length} bytes`
      );

      const responseDataString = JSON.stringify(response.data);
      if (responseDataString.length > 1000) {
        devLog.log(
          `   Response: ${responseDataString.substring(0, 1000)}... (truncated)`
        );
      } else {
        devLog.log(`   Response:`, response.data);
      }
    }

    return response;
  },
  (error: AxiosError) => {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const duration = error.config?.metadata
        ? Date.now() - error.config.metadata.startTime
        : 0;

      devLog.error(`❌ [RESPONSE ERROR] ${timestamp}`);
      devLog.error(`   Status: ${error.response?.status || "Network Error"}`);
      devLog.error(`   URL: ${error.config?.url || "Unknown"}`);
      devLog.error(`   Duration: ${duration}ms`);
      devLog.error(`   Error:`, error.response?.data || error.message);
    }

    // Handle unauthorized access (always run this logic)
    if (error.response?.status === 401) {
      devLog.warn("🔐 [AUTH] Unauthorized access - clearing token");
      setAuthToken(null);
      // Clear token from storage
      AsyncStorage.removeItem("authToken");
    }

    return Promise.reject(error);
  }
);

const activeRequests = new Map<string, Promise<any>>();
// ✅ Enhanced API functions with conditional logging
export const authAPI = {
  login: async (email: string, password: string) => {
    const requestKey = `login-${email}`;

    if (activeRequests.has(requestKey)) {
      console.log("🔄 [AUTH] Login already in progress for:", email);
      return activeRequests.get(requestKey)!;
    }

    devLog.log("🔐 [AUTH] Attempting login for:", email);

    const requestPromise = apiClient
      .post(API_LOGIN, { email, password })
      .then((response) => {
        devLog.log("✅ [AUTH] Login successful for:", email);
        return response;
      })
      .catch((error) => {
        devLog.error("❌ [AUTH] Login failed for:", email);
        throw error;
      })
      .finally(() => {
        activeRequests.delete(requestKey);
      });

    activeRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  register: async (name: string, email: string, password: string) => {
    devLog.log("👤 [AUTH] Attempting registration for:", email);
    try {
      const response = await apiClient.post(API_REGISTER, {
        name,
        email,
        password,
      });
      devLog.log("✅ [AUTH] Registration successful for:", email);
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Registration failed for:", email);
      throw error;
    }
  },

  logout: async () => {
    devLog.log("🚪 [AUTH] Logging out user");
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        devLog.warn("⚠️ [AUTH] No token found during logout");
        return;
      }
      const response = await apiClient.post("/api/users/logout");
      devLog.log("✅ [AUTH] Logout successful");
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Logout failed");
      throw error;
    }
  },

  validateToken: async () => {
    const requestKey = "validate-token";

    // 🆕 If same request is already in progress, return existing promise
    if (activeRequests.has(requestKey)) {
      console.log(
        "🔄 [AUTH] Token validation already in progress, using existing request"
      );
      return activeRequests.get(requestKey)!;
    }

    devLog.log("🔍 [AUTH] Validating token");

    const requestPromise = apiClient
      .get("/api/users/validate-token")
      .then((response) => {
        devLog.log("✅ [AUTH] Token validation successful");
        return response;
      })
      .catch((error) => {
        devLog.error("❌ [AUTH] Token validation failed");
        throw error;
      })
      .finally(() => {
        // 🆕 Clean up request tracking
        activeRequests.delete(requestKey);
      });

    // 🆕 Track the request
    activeRequests.set(requestKey, requestPromise);

    return requestPromise;
  },

  getProfile: async () => {
    devLog.log("👤 [USER] Fetching user profile");
    try {
      const response = await apiClient.get("/api/users/profile");
      devLog.log("✅ [USER] Profile fetched successfully");
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch profile");
      throw error;
    }
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    devLog.log("✏️ [USER] Updating profile:", Object.keys(data));
    try {
      const response = await apiClient.put("/api/users/profile", data);
      devLog.log("✅ [USER] Profile updated successfully");
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to update profile");
      throw error;
    }
  },

  getAllUsers: async () => {
    devLog.log("👥 [USER] Fetching all users");
    try {
      const response = await apiClient.get(API_FETCH_ALL_USERS);
      devLog.log(`✅ [USER] Fetched ${response.data?.length || 0} users`);
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch users");
      throw error;
    }
  },

  getUserById: async (id: string) => {
    devLog.log("👤 [USER] Fetching user by ID:", id);
    try {
      const response = await apiClient.get(API_FETCH_USER.replace(":id", id));
      devLog.log(
        "✅ [USER] User fetched successfully:",
        response.data?.name || "Unknown"
      );
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch user:", id);
      throw error;
    }
  },
};

interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    return (
      globalAuthState || {
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
      }
    );
  });

  const { setLoading, setError, clearError } = useAppState();

  const tokenValidationInProgress = useRef(false);
  const initializationCompleted = useRef(false);

  useEffect(() => {
    const listener = (newState: AuthState) => {
      setAuthState(newState);
    };

    authListeners.push(listener);

    return () => {
      const index = authListeners.indexOf(listener);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    };
  }, []);

  const initializeAuth = async () => {
    // 🆕 Global check to prevent multiple initializations
    if (globalAuthInitialized || globalTokenValidationInProgress) {
      console.log("🔄 [AUTH] Already initialized or in progress globally");
      return;
    }

    console.log("🚀 [AUTH] Starting global auth initialization");

    try {
      setLoading(true, "Initializing authentication...");
      clearError();
      globalTokenValidationInProgress = true;

      const token = await AsyncStorage.getItem("authToken");

      if (token) {
        setAuthToken(token);
        console.log("🔍 [AUTH] Validating existing token...");

        try {
          const response = await authAPI.validateToken();
          const newState = {
            isAuthenticated: true,
            isLoading: false,
            user: response.data,
            token,
          };

          // 🆕 Notify all listeners
          notifyAuthListeners(newState);
          clearError();
          console.log("✅ [AUTH] Token validation successful");
        } catch (error) {
          console.warn("⚠️ [AUTH] Token validation failed, clearing token");
          await AsyncStorage.removeItem("authToken");
          setAuthToken(null);
          const newState = {
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          };
          notifyAuthListeners(newState);
        }
      } else {
        console.log("ℹ️ [AUTH] No token found, user needs to login");
        const newState = {
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        };
        notifyAuthListeners(newState);
      }
    } catch (error) {
      console.error("❌ [AUTH] Failed to initialize auth:", error);
      setError("Failed to initialize authentication");
      const newState = {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };
      notifyAuthListeners(newState);
    } finally {
      setLoading(false);
      globalTokenValidationInProgress = false;
      globalAuthInitialized = true;
    }
  };

  useEffect(() => {
    if (!globalAuthInitialized && !globalTokenValidationInProgress) {
      initializeAuth();
    }
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      // Initialize background token cache
      BackgroundTaskService.initializeTokenCache(authState.token).catch(
        (error) => {
          console.error(
            "❌ [AUTH] Failed to sync token to background service:",
            error
          );
        }
      );
    }
  }, [authState.isAuthenticated, authState.token]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true, "Signing in...");
      clearError();

      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // 🆕 Store token in multiple locations for cross-service access
      await Promise.all([
        AsyncStorage.setItem("authToken", token),
        AsyncStorage.setItem("backgroundAuthToken", token),
        AsyncStorage.setItem("userToken", token),
      ]);

      setAuthToken(token);

      // 🆕 Initialize background token cache
      await BackgroundTaskService.initializeTokenCache(token);

      const newState = {
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      };

      notifyAuthListeners(newState);
      globalAuthInitialized = true;

      console.log("✅ [AUTH] Login successful, tokens synced");

      return {
        success: true,
        user: user,
        token: token,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Login failed";
      setError(errorMessage);

      const newState = {
        ...globalAuthState!,
        isLoading: false,
      };
      notifyAuthListeners(newState);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setLoading(true, "Creating account...");
      clearError();

      const response = await authAPI.register(name, email, password);
      const { token, user } = response.data;

      // Store token
      await AsyncStorage.setItem("authToken", token);
      setAuthToken(token);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });

      initializationCompleted.current = true;

      return { success: true, user };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
      setError(errorMessage);

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      setLoading(true, "Signing out...");

      try {
        await authAPI.logout();
      } catch (error) {
        devLog.warn(
          "⚠️ [AUTH] Server logout failed, continuing with local logout"
        );
      }

      // 🆕 Clear all token locations
      await AsyncStorage.multiRemove([
        "authToken",
        "backgroundAuthToken",
        "userToken",
        "@journee/authToken",
      ]);

      setAuthToken(null);

      // Clear background token cache
      await BackgroundTaskService.clearTokenCache();

      const newState = {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      };

      globalAuthInitialized = false;
      globalTokenValidationInProgress = false;
      notifyAuthListeners(newState);

      clearError();
      console.log("✅ [AUTH] Logout successful, all tokens cleared");

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Logout failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    avatar?: string;
  }): Promise<AuthResult> => {
    try {
      setLoading(true, "Updating profile...");
      clearError();

      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true, user: updatedUser };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    token: authState.token,
    login,
    register,
    logout,
    updateProfile,
    initializeAuth,
  };
};

// ✅ Type declaration for axios config metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
      timestamp: string;
    };
  }
}
