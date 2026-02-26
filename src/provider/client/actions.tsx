import { createAction } from "redux-actions";
import type { IClient, IClientStateContext, IClientStats } from "./context";

export enum ClientActionEnums {
  getClientPending = "GET_CLIENT_PENDING",
  getClientSuccess = "GET_CLIENT_SUCCESS",
  getClientError = "GET_CLIENT_ERROR",

  getClientsPending = "GET_CLIENTS_PENDING",
  getClientsSuccess = "GET_CLIENTS_SUCCESS",
  getClientsError = "GET_CLIENTS_ERROR",

  createClientPending = "CREATE_CLIENT_PENDING",
  createClientSuccess = "CREATE_CLIENT_SUCCESS",
  createClientError = "CREATE_CLIENT_ERROR",

  updateClientPending = "UPDATE_CLIENT_PENDING",
  updateClientSuccess = "UPDATE_CLIENT_SUCCESS",
  updateClientError = "UPDATE_CLIENT_ERROR",

  deleteClientPending = "DELETE_CLIENT_PENDING",
  deleteClientSuccess = "DELETE_CLIENT_SUCCESS",
  deleteClientError = "DELETE_CLIENT_ERROR",

  getClientStatsPending = "GET_CLIENT_STATS_PENDING",
  getClientStatsSuccess = "GET_CLIENT_STATS_SUCCESS",
  getClientStatsError = "GET_CLIENT_STATS_ERROR",
}

const pendingState: IClientStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IClientStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getClientPending = createAction<IClientStateContext>(
  ClientActionEnums.getClientPending,
  () => pendingState,
);

export const getClientSuccess = createAction<IClientStateContext, IClient>(
  ClientActionEnums.getClientSuccess,
  (client) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    client,
  }),
);

export const getClientError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.getClientError,
  (message?: string) => errorState(message),
);

export const getClientsPending = createAction<IClientStateContext>(
  ClientActionEnums.getClientsPending,
  () => pendingState,
);

export const getClientsSuccess = createAction<
  IClientStateContext,
  {
    items: IClient[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(ClientActionEnums.getClientsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  clients: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getClientsError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.getClientsError,
  (message?: string) => errorState(message),
);

export const createClientPending = createAction<IClientStateContext>(
  ClientActionEnums.createClientPending,
  () => pendingState,
);

export const createClientSuccess = createAction<IClientStateContext, IClient>(
  ClientActionEnums.createClientSuccess,
  (client) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    client,
  }),
);

export const createClientError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.createClientError,
  (message?: string) => errorState(message),
);

export const updateClientPending = createAction<IClientStateContext>(
  ClientActionEnums.updateClientPending,
  () => pendingState,
);

export const updateClientSuccess = createAction<IClientStateContext, IClient>(
  ClientActionEnums.updateClientSuccess,
  (client) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    client,
  }),
);

export const updateClientError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.updateClientError,
  (message?: string) => errorState(message),
);

export const deleteClientPending = createAction<IClientStateContext>(
  ClientActionEnums.deleteClientPending,
  () => pendingState,
);

export const deleteClientSuccess = createAction<
  IClientStateContext & { id: string },
  string
>(ClientActionEnums.deleteClientSuccess, (id: string) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  client: undefined,
  id,
}));

export const deleteClientError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.deleteClientError,
  (message?: string) => errorState(message),
);

export const getClientStatsPending = createAction<IClientStateContext>(
  ClientActionEnums.getClientStatsPending,
  () => pendingState,
);

export const getClientStatsSuccess = createAction<IClientStateContext, IClientStats>(
  ClientActionEnums.getClientStatsSuccess,
  (clientStats) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    clientStats,
  }),
);

export const getClientStatsError = createAction<IClientStateContext, string | undefined>(
  ClientActionEnums.getClientStatsError,
  (message?: string) => errorState(message),
);
