"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { ActionFunctionAny } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  createClientError,
  createClientPending,
  createClientSuccess,
  deleteClientError,
  deleteClientPending,
  deleteClientSuccess,
  getClientError,
  getClientPending,
  getClientStatsError,
  getClientStatsPending,
  getClientStatsSuccess,
  getClientSuccess,
  getClientsError,
  getClientsPending,
  getClientsSuccess,
  updateClientError,
  updateClientPending,
  updateClientSuccess,
} from "./actions";
import type {
  CreateClientDto,
  ClientQuery,
  IClientStateContext,
  UpdateClientDto,
} from "./context";
import { INITIAL_STATE, ClientActionContext, ClientStateContext } from "./context";
import { ClientReducer } from "./reducer";

const BASE_URL = "/api/Clients";

const buildQueryString = (query?: ClientQuery) => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  if (query.industry) params.set("industry", query.industry);
  if (query.clientType) params.set("clientType", String(query.clientType));
  if (typeof query.isActive === "boolean") params.set("isActive", String(query.isActive));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ClientReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: ActionFunctionAny<IClientStateContext>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getClient = async (id: string) => {
    dispatch(getClientPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getClientSuccess(data));
    } catch (err) {
      handleError(err, getClientError);
    }
  };

  const getClients = async (query?: ClientQuery) => {
    dispatch(getClientsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        dispatch(
          getClientsSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        dispatch(
          getClientsSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getClientsError);
    }
  };

  const createClient = async (payload: CreateClientDto): Promise<boolean> => {
    dispatch(createClientPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createClientSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createClientError);
      return false;
    }
  };

  const updateClient = async (id: string, payload: UpdateClientDto): Promise<boolean> => {
    dispatch(updateClientPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateClientSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateClientError);
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    dispatch(deleteClientPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteClientSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteClientError);
      return false;
    }
  };

  const getClientStats = async (id: string) => {
    dispatch(getClientStatsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}/stats`);
      dispatch(getClientStatsSuccess(data));
    } catch (err) {
      handleError(err, getClientStatsError);
    }
  };

  return (
    <ClientStateContext.Provider value={state}>
      <ClientActionContext.Provider
        value={{
          getClient,
          getClients,
          createClient,
          updateClient,
          deleteClient,
          getClientStats,
        }}
      >
        {children}
      </ClientActionContext.Provider>
    </ClientStateContext.Provider>
  );
};

export const useClientState = () => {
  const context = useContext(ClientStateContext);
  if (!context) {
    throw new Error("useClientState must be used within a ClientProvider");
  }
  return context;
};

export const useClientActions = () => {
  const context = useContext(ClientActionContext);
  if (!context) {
    throw new Error("useClientActions must be used within a ClientProvider");
  }
  return context;
};
