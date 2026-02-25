"use client";

import { useContext, useReducer } from "react";
import { getAxiosInstace } from "../../utils/axiosInstance";
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

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ??
  "https://sales-automation-bmdqg9b6a0d3ffem.southafricanorth-01.azurewebsites.net/api/Auth";

const mapError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

export const AuthenticationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(AuthenticationReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const persistToken = (token?: string) => {
    if (typeof window !== "undefined" && token) {
      window.localStorage.setItem("auth_token", token);
    }
  };

  const getProfile = async () => {
    dispatch(getProfilePending());
    try {
      const response = await instance.get<IAuthenticationUser>(`${AUTH_BASE_URL}/me`);
      dispatch(getProfileSuccess(response.data));
    } catch (error) {
      const message = mapError(error);
      dispatch(getProfileError(message));
      throw new Error(message);
    }
  };

  const register = async (payload: IAuthenticationRegisterPayload) => {
    dispatch(registerPending());
    try {
      const response = await instance.post<IAuthenticationUser>(
        `${AUTH_BASE_URL}/register`,
        payload,
      );
      persistToken(response.data.token);
      dispatch(registerSuccess(response.data));
    } catch (error) {
      const message = mapError(error);
      dispatch(registerError(message));
      throw new Error(message);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
    }
    dispatch(logoutSuccess());
  };

  const login = async (credentials: IAuthenticationCredentials) => {
    dispatch(loginPending());
    try {
      const response = await instance.post<IAuthenticationUser>(
        `${AUTH_BASE_URL}/login`,
        credentials,
      );
      persistToken(response.data.token);
      dispatch(loginSuccess(response.data));
    } catch (error) {
      const message = mapError(error);
      dispatch(loginError(message));
      throw new Error(message);
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
