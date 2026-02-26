"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  activateContractError,
  activateContractPending,
  activateContractSuccess,
  cancelContractError,
  cancelContractPending,
  cancelContractSuccess,
  createContractError,
  createContractPending,
  createContractSuccess,
  deleteContractError,
  deleteContractPending,
  deleteContractSuccess,
  getContractError,
  getContractPending,
  getContractSuccess,
  getContractsError,
  getContractsPending,
  getContractsSuccess,
  updateContractError,
  updateContractPending,
  updateContractSuccess,
} from "./actions";
import type {
  ContractQuery,
  CreateContractDto,
  ExpiringQuery,
  IContractActionContext,
  IContractStateContext,
  UpdateContractDto,
} from "./context";
import { INITIAL_STATE, ContractActionContext, ContractStateContext } from "./context";
import { ContractReducer } from "./reducer";

const BASE_URL = "/api/Contracts";

const buildQueryString = (query?: ContractQuery) => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.clientId) params.set("clientId", query.clientId);
  if (query.ownerId) params.set("ownerId", query.ownerId);
  if (query.status) params.set("status", String(query.status));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const ContractProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ContractReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (err: unknown, fallback: (msg?: string) => any) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getContract = async (id: string) => {
    dispatch(getContractPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getContractSuccess(data));
    } catch (err) {
      handleError(err, getContractError);
    }
  };

  const getContracts = async (query?: ContractQuery) => {
    dispatch(getContractsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        dispatch(
          getContractsSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        dispatch(
          getContractsSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getContractsError);
    }
  };

  const getExpiringContracts = async (query?: ExpiringQuery) => {
    dispatch(getContractsPending());
    try {
      const days = query?.daysUntilExpiry ?? 90;
      const { data } = await instance.get(`${BASE_URL}/expiring?daysUntilExpiry=${days}`);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      dispatch(
        getContractsSuccess({
          items,
          pageNumber: 1,
          pageSize: items.length,
          totalCount: items.length,
          totalPages: 1,
        }),
      );
    } catch (err) {
      handleError(err, getContractsError);
    }
  };

  const createContract = async (payload: CreateContractDto): Promise<boolean> => {
    dispatch(createContractPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createContractSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createContractError);
      return false;
    }
  };

  const updateContract = async (id: string, payload: UpdateContractDto): Promise<boolean> => {
    dispatch(updateContractPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateContractSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateContractError);
      return false;
    }
  };

  const deleteContract = async (id: string): Promise<boolean> => {
    dispatch(deleteContractPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteContractSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteContractError);
      return false;
    }
  };

  const activateContract = async (id: string): Promise<boolean> => {
    dispatch(activateContractPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/activate`);
      dispatch(activateContractSuccess(data));
      return true;
    } catch (err) {
      handleError(err, activateContractError);
      return false;
    }
  };

  const cancelContract = async (id: string): Promise<boolean> => {
    dispatch(cancelContractPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/cancel`);
      dispatch(cancelContractSuccess(data));
      return true;
    } catch (err) {
      handleError(err, cancelContractError);
      return false;
    }
  };

  return (
    <ContractStateContext.Provider value={state}>
      <ContractActionContext.Provider
        value={{
          getContract,
          getContracts,
          getExpiringContracts,
          createContract,
          updateContract,
          deleteContract,
          activateContract,
          cancelContract,
        }}
      >
        {children}
      </ContractActionContext.Provider>
    </ContractStateContext.Provider>
  );
};

export const useContractState = () => {
  const context = useContext(ContractStateContext);
  if (!context) {
    throw new Error("useContractState must be used within a ContractProvider");
  }
  return context;
};

export const useContractActions = () => {
  const context = useContext(ContractActionContext);
  if (!context) {
    throw new Error("useContractActions must be used within a ContractProvider");
  }
  return context;
};
