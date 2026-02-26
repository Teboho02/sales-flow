"use client";

import { useCallback, useContext, useEffect, useReducer } from "react";
import {
  getProfileError,
  getProfilePending,
  getProfileSuccess,
  loginError,
  loginPending,
  loginSuccess,
  logoutSuccess,
  registerError,
  registerPending,
  registerSuccess,
} from "./actions";
import type {
  IAuthenticationCredentials,
  IAuthenticationRegisterPayload,
  IAuthenticationUser,
} from "./context";
import {
  AuthenticationActionContext,
  AuthenticationStateContext,
  INITIAL_STATE,
} from "./context";
import { AuthenticationReducer } from "./reducer";
import { getAxiosInstace } from "@/utils/axiosInstance";
import axios from "axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const persistToken = (token?: string) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const persistUser = (user: IAuthenticationUser) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearPersistedSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): IAuthenticationUser | undefined => {
  if (typeof window === "undefined") return undefined;
  const stored = window.localStorage.getItem(USER_KEY);
  if (!stored) return undefined;
  try {
    return JSON.parse(stored) as IAuthenticationUser;
  } catch {
    return undefined;
  }
};

/** Map any auth response (/login or /me) to our internal user shape */
const mapApiUser = (
  data: {
    token?: string;
    userId?: string;
    id?: string;
    sub?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    role?: string;
    tenantId?: string;
    expiresAt?: string;
    exp?: string;
  },
  tokenOverride?: string,
): IAuthenticationUser => {
  const userId = data.userId ?? data.id ?? data.sub;
  if (!userId) {
    throw new Error("User id missing from auth response.");
  }

  const roles =
    Array.isArray(data.roles) && data.roles.length > 0
      ? data.roles
      : data.role
        ? [data.role]
        : undefined;

  return {
    token: tokenOverride ?? data.token,
    userId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    roles,
    tenantId: data.tenantId,
    expiresAt: data.expiresAt ?? data.exp,
  };
};

export const AuthenticationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(AuthenticationReducer, INITIAL_STATE);

  /**
   * On mount: if a token exists, validate it via /api/Auth/me and hydrate the user.
   */
  const getProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    const cachedUser = getStoredUser();
    if (cachedUser) {
      dispatch(getProfileSuccess(cachedUser));
    }

    dispatch(getProfilePending());
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.get("/api/Auth/me");
      const user = mapApiUser(data, token);
      persistToken(user.token);
      persistUser(user);
      dispatch(getProfileSuccess(user));
    } catch (err) {
      clearPersistedSession();
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail ??
          err.response?.data?.title ??
          "Session expired. Please sign in again."
        : "Session expired. Please sign in again.";
      dispatch(getProfileError(message));
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  const register = async (payload: IAuthenticationRegisterPayload): Promise<boolean> => {
    dispatch(registerPending());
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.post("/api/Auth/register", payload);
      const user = mapApiUser(data);
      persistToken(user.token);
      persistUser(user);
      dispatch(registerSuccess(user));
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.title ??
          err.response?.data?.detail ??
          err.message)
        : "Registration failed.";
      dispatch(registerError(message));
      return false;
    }
  };

  const logout = () => {
    clearPersistedSession();
    dispatch(logoutSuccess());
  };

  const login = async (credentials: IAuthenticationCredentials): Promise<boolean> => {
    dispatch(loginPending());
    try {
      const instance = getAxiosInstace();
      const { data } = await instance.post("/api/Auth/login", credentials);
      const user = mapApiUser(data);
      persistToken(user.token);
      persistUser(user);
      dispatch(loginSuccess(user));
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.title ??
          err.response?.data?.detail ??
          err.message)
        : "Login failed.";
      dispatch(loginError(message));
      return false;
    }
  };

  return (
    <AuthenticationStateContext.Provider value={state}>
      <AuthenticationActionContext.Provider
        value={{
          getProfile,
          register,
          logout,
          login,
        }}
      >
        {children}
      </AuthenticationActionContext.Provider>
    </AuthenticationStateContext.Provider>
  );
};

export const useAuthenticationState = () => {
  const context = useContext(AuthenticationStateContext);
  if (!context) {
    throw new Error(
      "useAuthenticationState must be used within an AuthenticationProvider",
    );
  }
  return context;
};

export const useAuthenticationActions = () => {
  const context = useContext(AuthenticationActionContext);
  if (!context) {
    throw new Error(
      "useAuthenticationActions must be used within an AuthenticationProvider",
    );
  }
  return context;
};
