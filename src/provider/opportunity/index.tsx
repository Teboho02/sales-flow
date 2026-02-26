"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { ActionFunction1, Action } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  assignOpportunityError,
  assignOpportunityPending,
  assignOpportunitySuccess,
  createOpportunityError,
  createOpportunityPending,
  createOpportunitySuccess,
  deleteOpportunityError,
  deleteOpportunityPending,
  deleteOpportunitySuccess,
  getOpportunitiesError,
  getOpportunitiesPending,
  getOpportunitiesSuccess,
  getOpportunityError,
  getOpportunityPending,
  getOpportunitySuccess,
  getPipelineMetricsError,
  getPipelineMetricsPending,
  getPipelineMetricsSuccess,
  getStageHistoryError,
  getStageHistoryPending,
  getStageHistorySuccess,
  updateOpportunityError,
  updateOpportunityPending,
  updateOpportunitySuccess,
  updateStageError,
  updateStagePending,
  updateStageSuccess,
} from "./actions";
import type {
  AssignOpportunityDto,
  CreateOpportunityDto,
  IOpportunityStateContext,
  OpportunityQuery,
  UpdateOpportunityDto,
  UpdateStageDto,
} from "./context";
import {
  INITIAL_STATE,
  OpportunityActionContext,
  OpportunityStateContext,
} from "./context";
import { OpportunityReducer } from "./reducer";

const BASE_URL = "/api/Opportunities";

const buildQueryString = (query?: OpportunityQuery): string => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.stage) params.set("stage", String(query.stage));
  if (query.clientId) params.set("clientId", query.clientId);
  if (query.ownerId) params.set("ownerId", query.ownerId);
  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  if (typeof query.isActive === "boolean") params.set("isActive", String(query.isActive));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const OpportunityProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(OpportunityReducer, INITIAL_STATE);

  // Cast dispatch to accept redux-actions Action objects
  const typedDispatch = dispatch as React.Dispatch<Action<IOpportunityStateContext>>;

  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: ActionFunction1<string | undefined, Action<IOpportunityStateContext>>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ??
        err.response?.data?.title ??
        err.message
      : "Request failed.";
    typedDispatch(fallback(message));
    return message;
  };

  const getOpportunity = async (id: string) => {
    typedDispatch(getOpportunityPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      typedDispatch(getOpportunitySuccess(data));
    } catch (err) {
      handleError(err, getOpportunityError);
    }
  };

  const getOpportunities = async (query?: OpportunityQuery) => {
    typedDispatch(getOpportunitiesPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        typedDispatch(
          getOpportunitiesSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        typedDispatch(
          getOpportunitiesSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getOpportunitiesError);
    }
  };

  const createOpportunity = async (payload: CreateOpportunityDto): Promise<boolean> => {
    typedDispatch(createOpportunityPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      typedDispatch(createOpportunitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, createOpportunityError);
      return false;
    }
  };

  const updateOpportunity = async (
    id: string,
    payload: UpdateOpportunityDto,
  ): Promise<boolean> => {
    typedDispatch(updateOpportunityPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      typedDispatch(updateOpportunitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateOpportunityError);
      return false;
    }
  };

  const deleteOpportunity = async (id: string): Promise<boolean> => {
    typedDispatch(deleteOpportunityPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      typedDispatch(deleteOpportunitySuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteOpportunityError);
      return false;
    }
  };

  const updateStage = async (id: string, payload: UpdateStageDto): Promise<boolean> => {
    typedDispatch(updateStagePending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/stage`, payload);
      typedDispatch(updateStageSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateStageError);
      return false;
    }
  };

  const assignOpportunity = async (
    id: string,
    payload: AssignOpportunityDto,
  ): Promise<boolean> => {
    typedDispatch(assignOpportunityPending());
    try {
      const { data } = await instance.post(`${BASE_URL}/${id}/assign`, payload);
      typedDispatch(assignOpportunitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, assignOpportunityError);
      return false;
    }
  };

  const getStageHistory = async (id: string) => {
    typedDispatch(getStageHistoryPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}/stage-history`);
      typedDispatch(getStageHistorySuccess(data));
    } catch (err) {
      handleError(err, getStageHistoryError);
    }
  };

  const getPipelineMetrics = async (ownerId?: string) => {
    typedDispatch(getPipelineMetricsPending());
    try {
      const qs = ownerId ? `?ownerId=${ownerId}` : "";
      const { data } = await instance.get(`${BASE_URL}/pipeline${qs}`);
      typedDispatch(getPipelineMetricsSuccess(data));
    } catch (err) {
      handleError(err, getPipelineMetricsError);
    }
  };

  return (
    <OpportunityStateContext.Provider value={state}>
      <OpportunityActionContext.Provider
        value={{
          getOpportunity,
          getOpportunities,
          createOpportunity,
          updateOpportunity,
          deleteOpportunity,
          updateStage,
          assignOpportunity,
          getStageHistory,
          getPipelineMetrics,
        }}
      >
        {children}
      </OpportunityActionContext.Provider>
    </OpportunityStateContext.Provider>
  );
};

export const useOpportunityState = () => {
  const context = useContext(OpportunityStateContext);
  if (!context) {
    throw new Error("useOpportunityState must be used within an OpportunityProvider");
  }
  return context;
};

export const useOpportunityActions = () => {
  const context = useContext(OpportunityActionContext);
  if (!context) {
    throw new Error("useOpportunityActions must be used within an OpportunityProvider");
  }
  return context;
};
