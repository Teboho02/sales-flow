"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  approveProposalError,
  approveProposalPending,
  approveProposalSuccess,
  createProposalError,
  createProposalPending,
  createProposalSuccess,
  deleteProposalError,
  deleteProposalPending,
  deleteProposalSuccess,
  getProposalError,
  getProposalPending,
  getProposalSuccess,
  getProposalsError,
  getProposalsPending,
  getProposalsSuccess,
  rejectProposalError,
  rejectProposalPending,
  rejectProposalSuccess,
  submitProposalError,
  submitProposalPending,
  submitProposalSuccess,
  updateProposalError,
  updateProposalPending,
  updateProposalSuccess,
} from "./actions";
import type {
  CreateProposalDto,
  IProposalActionContext,
  IProposalStateContext,
  ProposalQuery,
  UpdateProposalDto,
} from "./context";
import { INITIAL_STATE, ProposalActionContext, ProposalStateContext } from "./context";
import { ProposalReducer } from "./reducer";

const BASE_URL = "/api/Proposals";

const buildQueryString = (query?: ProposalQuery) => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.opportunityId) params.set("opportunityId", query.opportunityId);
  if (query.clientId) params.set("clientId", query.clientId);
  if (query.status) params.set("status", String(query.status));
  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const ProposalProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ProposalReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (err: unknown, fallback: (msg?: string) => any) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getProposal = async (id: string) => {
    dispatch(getProposalPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getProposalSuccess(data));
    } catch (err) {
      handleError(err, getProposalError);
    }
  };

  const getProposals = async (query?: ProposalQuery) => {
    dispatch(getProposalsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        dispatch(
          getProposalsSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        dispatch(
          getProposalsSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getProposalsError);
    }
  };

  const createProposal = async (payload: CreateProposalDto): Promise<boolean> => {
    dispatch(createProposalPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createProposalSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createProposalError);
      return false;
    }
  };

  const updateProposal = async (id: string, payload: UpdateProposalDto): Promise<boolean> => {
    dispatch(updateProposalPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateProposalSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateProposalError);
      return false;
    }
  };

  const deleteProposal = async (id: string): Promise<boolean> => {
    dispatch(deleteProposalPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteProposalSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteProposalError);
      return false;
    }
  };

  const submitProposal = async (id: string): Promise<boolean> => {
    dispatch(submitProposalPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/submit`);
      dispatch(submitProposalSuccess(data));
      return true;
    } catch (err) {
      handleError(err, submitProposalError);
      return false;
    }
  };

  const approveProposal = async (id: string): Promise<boolean> => {
    dispatch(approveProposalPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/approve`);
      dispatch(approveProposalSuccess(data));
      return true;
    } catch (err) {
      handleError(err, approveProposalError);
      return false;
    }
  };

  const rejectProposal = async (id: string): Promise<boolean> => {
    dispatch(rejectProposalPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/reject`);
      dispatch(rejectProposalSuccess(data));
      return true;
    } catch (err) {
      handleError(err, rejectProposalError);
      return false;
    }
  };

  return (
    <ProposalStateContext.Provider value={state}>
      <ProposalActionContext.Provider
        value={{
          getProposal,
          getProposals,
          createProposal,
          updateProposal,
          deleteProposal,
          submitProposal,
          approveProposal,
          rejectProposal,
        }}
      >
        {children}
      </ProposalActionContext.Provider>
    </ProposalStateContext.Provider>
  );
};

export const useProposalState = () => {
  const context = useContext(ProposalStateContext);
  if (!context) {
    throw new Error("useProposalState must be used within a ProposalProvider");
  }
  return context;
};

export const useProposalActions = () => {
  const context = useContext(ProposalActionContext);
  if (!context) {
    throw new Error("useProposalActions must be used within a ProposalProvider");
  }
  return context;
};
