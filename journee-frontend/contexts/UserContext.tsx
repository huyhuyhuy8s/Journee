// contexts/UserContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/utils/auth";

type UserContextType = ReturnType<typeof useAuth>;

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  try {
    const authData = useAuth();

    return (
      <UserContext.Provider value={authData}>{children}</UserContext.Provider>
    );
  } catch (error) {
    console.error("❌ UserContextProvider error:", error);
    throw error;
  }
};

export const useUserState = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserState must be used within a UserContextProvider");
  }
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    token: context.token,
  };
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context.user;
};

export const useIsAuthenticated = (): boolean => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useIsAuthenticated must be used within a UserContextProvider"
    );
  }
  return context.isAuthenticated;
};

export const useIsLoading = (): boolean => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useIsLoading must be used within a UserContextProvider");
  }
  return context.isLoading;
};

export const useAuthToken = (): string | null => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuthToken must be used within a UserContextProvider");
  }
  return context.token;
};

export const useUserDispatch = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserDispatch must be used within a UserContextProvider"
    );
  }

  return {
    login: context.login,
    logout: context.logout,
    register: context.register,
    updateProfile: context.updateProfile,
  };
};

export default UserContext;
