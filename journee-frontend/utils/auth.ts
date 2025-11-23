// utils/auth.ts
import { authAPI, setAuthToken } from "@/services/user";
import { useUserDispatch } from "@/contexts/UserContext";
import { AxiosError } from "axios";

export const useAuth = () => {
  const userDispatch = useUserDispatch();

  const login = async (email: string, password: string) => {
    try {
      userDispatch({ type: "SET_LOADING", payload: true });

      const response = await authAPI.login(email, password);
      const data = response.data;

      setAuthToken(data.token);

      userDispatch({
        type: "LOGIN",
        payload: {
          user: data.user,
          token: data.token,
        },
      });

      return { success: true, message: data.message };
    } catch (error: any) {
      userDispatch({ type: "SET_LOADING", payload: false });

      let errorMessage = "Login failed";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error || error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      userDispatch({ type: "SET_LOADING", payload: true });

      const response = await authAPI.register(name, email, password);
      const data = response.data;

      setAuthToken(data.token);

      userDispatch({
        type: "LOGIN",
        payload: {
          user: data.user,
          token: data.token,
        },
      });

      return { success: true, message: data.message };
    } catch (error: any) {
      userDispatch({ type: "SET_LOADING", payload: false });

      let errorMessage = "Registration failed";

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error || error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    setAuthToken(null);
    userDispatch({ type: "LOGOUT" });
  };

  return { login, register, logout };
};
