import { createContext } from "react";

export interface IAuthenticationUser {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  token?: string;
  roles?: string[];
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
  phoneNumber: string;
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
  register: (payload: IAuthenticationRegisterPayload) => Promise<void>;
  logout: () => void;
  login: (credentials: IAuthenticationCredentials) => Promise<void>;
}

export const INITIAL_STATE: IAuthenticationStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IAuthenticationActionContext = {
  getProfile: async () => {},
  register: async () => {},
  logout: () => {},
  login: async () => {},
};

export const AuthenticationStateContext =
  createContext<IAuthenticationStateContext>(INITIAL_STATE);

export const AuthenticationActionContext =
  createContext<IAuthenticationActionContext | undefined>(undefined);
