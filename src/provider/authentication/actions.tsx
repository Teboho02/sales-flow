import { createAction } from "redux-actions";
import type {
  IAuthenticationStateContext,
  IAuthenticationUser,
} from "./context";

export enum AuthenticationActionEnums {
  getProfilePending = "GET_PROFILE_PENDING",
  getProfileSuccess = "GET_PROFILE_SUCCESS",
  getProfileError = "GET_PROFILE_ERROR",

  registerPending = "REGISTER_PENDING",
  registerSuccess = "REGISTER_SUCCESS",
  registerError = "REGISTER_ERROR",

  logoutSuccess = "LOGOUT_SUCCESS",

  loginPending = "LOGIN_PENDING",
  loginSuccess = "LOGIN_SUCCESS",
  loginError = "LOGIN_ERROR",
}

const pendingState: IAuthenticationStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
};

const errorState: IAuthenticationStateContext = {
  isPending: false,
  isSuccess: false,
  isError: true,
};

export const getProfilePending = createAction<IAuthenticationStateContext>(
  AuthenticationActionEnums.getProfilePending,
  () => pendingState,
);

export const getProfileSuccess = createAction<
  IAuthenticationStateContext,
  IAuthenticationUser
>(AuthenticationActionEnums.getProfileSuccess, (user: IAuthenticationUser) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  user,
}));

export const getProfileError = createAction<
  IAuthenticationStateContext,
  string | undefined
>(
  AuthenticationActionEnums.getProfileError,
  (errorMessage?: string) => ({
    ...errorState,
    errorMessage,
  }),
);

export const registerPending = createAction<IAuthenticationStateContext>(
  AuthenticationActionEnums.registerPending,
  () => pendingState,
);

export const registerSuccess = createAction<
  IAuthenticationStateContext,
  IAuthenticationUser
>(AuthenticationActionEnums.registerSuccess, (user: IAuthenticationUser) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  errorMessage: undefined,
  user,
}));

export const registerError = createAction<
  IAuthenticationStateContext,
  string | undefined
>(
  AuthenticationActionEnums.registerError,
  (errorMessage?: string) => ({
    ...errorState,
    errorMessage,
  }),
);

export const logoutSuccess = createAction<IAuthenticationStateContext>(
  AuthenticationActionEnums.logoutSuccess,
  () => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    errorMessage: undefined,
    user: undefined,
  }),
);

export const loginPending = createAction<IAuthenticationStateContext>(
  AuthenticationActionEnums.loginPending,
  () => pendingState,
);

export const loginSuccess = createAction<
  IAuthenticationStateContext,
  IAuthenticationUser
>(AuthenticationActionEnums.loginSuccess, (user: IAuthenticationUser) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  errorMessage: undefined,
  user,
}));

export const loginError = createAction<
  IAuthenticationStateContext,
  string | undefined
>(
  AuthenticationActionEnums.loginError,
  (errorMessage?: string) => ({
    ...errorState,
    errorMessage,
  }),
);
