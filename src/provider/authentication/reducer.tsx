import { handleActions } from "redux-actions";
import { AuthenticationActionEnums } from "./actions";
import { INITIAL_STATE } from "./context";
import type { IAuthenticationStateContext } from "./context";

export const AuthenticationReducer = handleActions<
  IAuthenticationStateContext,
  IAuthenticationStateContext
>(
  {
    [AuthenticationActionEnums.getProfilePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.getProfileSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.getProfileError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [AuthenticationActionEnums.registerPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.registerSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.registerError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [AuthenticationActionEnums.logoutSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      user: undefined,
    }),

    [AuthenticationActionEnums.loginPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.loginSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [AuthenticationActionEnums.loginError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
