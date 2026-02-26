import { createContext } from "react";

export interface IAuthenticationUser {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  roles?: string[];
  tenantId?: string;
  expiresAt?: string;
}

export interface IAuthenticationCredentials {
  email: string;
  password: string;
}

export interface IAuthenticationRegisterPayload
  extends IAuthenticationCredentials {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  tenantName?: string;  // creates new org; caller becomes Admin
  tenantId?: string;   // uuid; joins existing org (mutually exclusive with tenantName)
  role?: string;       // "SalesRep" | "SalesManager" | "BusinessDevelopmentManager"
}

export interface IAuthenticationStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  user?: IAuthenticationUser;
}

export interface IAuthenticationActionContext {
  getProfile: () => Promise<void>;
  register: (payload: IAuthenticationRegisterPayload) => Promise<boolean>;
  logout: () => void;
  login: (credentials: IAuthenticationCredentials) => Promise<boolean>;
}

export const INITIAL_STATE: IAuthenticationStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IAuthenticationActionContext = {
  getProfile: async () => { },
  register: async () => false,
  logout: () => { },
  login: async () => false,
};

export const AuthenticationStateContext =
  createContext<IAuthenticationStateContext>(INITIAL_STATE);

export const AuthenticationActionContext =
  createContext<IAuthenticationActionContext | undefined>(undefined);
