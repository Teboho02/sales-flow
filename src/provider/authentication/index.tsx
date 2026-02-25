"use client";

import { useContext, useReducer } from "react";
import {
  getProfilePending,
  getProfileSuccess,
  loginPending,
  loginSuccess,
  logoutSuccess,
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

const buildMockUser = (email?: string): IAuthenticationUser => ({
  userId: "dev-user",
  email,
  firstName: "Dev",
  lastName: "User",
  token: "dev-token",
  roles: ["user"],
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
});

export const AuthenticationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(AuthenticationReducer, INITIAL_STATE);

  const persistToken = (token?: string) => {
    if (typeof window !== "undefined" && token) {
      window.localStorage.setItem("auth_token", token);
    }
  };

  const getProfile = async () => {
    dispatch(getProfilePending());
    const mockUser = buildMockUser("dev@example.com");
    persistToken(mockUser.token);
    dispatch(getProfileSuccess(mockUser));
  };

  const register = async (payload: IAuthenticationRegisterPayload) => {
    dispatch(registerPending());
    const mockUser = buildMockUser(payload.email);
    persistToken(mockUser.token);
    dispatch(registerSuccess(mockUser));
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth_token");
    }
    dispatch(logoutSuccess());
  };

  const login = async (credentials: IAuthenticationCredentials) => {
    dispatch(loginPending());
    const mockUser = buildMockUser(credentials.email);
    persistToken(mockUser.token);
    dispatch(loginSuccess(mockUser));
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
