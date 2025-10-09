import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, setAuthToken } from "@/services/api";

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
};

type UserAction =
  | { type: "LOGIN"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "RESTORE_SESSION"; payload: { user: User; token: string } };

type UserContextType = [UserState, React.Dispatch<UserAction>] | undefined;

// Storage keys
const STORAGE_KEYS = {
  USER: "@user_data",
  TOKEN: "@auth_token",
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "LOGIN":
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: undefined,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

const UserContext = createContext<UserContextType>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

// Move validateToken function before the component
const validateToken = async (token: string): Promise<boolean> => {
  try {
    setAuthToken(token);
    const response = await authAPI.validateToken();
    return response.status === 200; // Fixed: was 2000
  } catch (error) {
    console.error("Token validation failed:", error);
    setAuthToken(null);
    return false;
  }
};

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [userState, userDispatch] = useReducer(userReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: undefined,
  });

  // Load user session on app start
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Save user data when user state changes
  useEffect(() => {
    if (userState.isAuthenticated && userState.user && userState.token) {
      saveUserSession(userState.user, userState.token);
    } else if (!userState.isAuthenticated) {
      clearUserSession();
    }
  }, [userState.isAuthenticated, userState.user, userState.token]);

  const checkExistingSession = async () => {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);

      if (userData && token) {
        const user = JSON.parse(userData);
        const isValidToken = await validateToken(token);

        if (isValidToken) {
          userDispatch({
            type: "RESTORE_SESSION",
            payload: { user, token },
          });
        } else {
          await clearUserSession();
          userDispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        userDispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Error checking existing session:", error);
      userDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const saveUserSession = async (user: User, token: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      ]);
    } catch (error) {
      console.error("Error saving user session:", error);
    }
  };

  const clearUserSession = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      ]);
    } catch (error) {
      console.error("Error clearing user session:", error);
    }
  };

  return (
    <UserContext.Provider value={[userState, userDispatch]}>
      {children}
    </UserContext.Provider>
  );
};

// Hooks
export const useUserState = (): UserState => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserState must be used within a UserContextProvider");
  }
  return context[0];
};

export const useUserDispatch = (): React.Dispatch<UserAction> => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserDispatch must be used within a UserContextProvider"
    );
  }
  return context[1];
};

export const useUser = (): User | null => {
  const userState = useUserState();
  return userState.user;
};

export const useIsAuthenticated = (): boolean => {
  const userState = useUserState();
  return userState.isAuthenticated;
};

export const useIsLoading = (): boolean => {
  const userState = useUserState();
  return userState.isLoading;
};

export const useAuthToken = (): string | undefined => {
  const userState = useUserState();
  return userState.token;
};

export default UserContext;
