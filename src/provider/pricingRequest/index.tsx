"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { Action } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  assignPricingRequestError,
  assignPricingRequestPending,
  assignPricingRequestSuccess,
  completePricingRequestError,
  completePricingRequestPending,
  completePricingRequestSuccess,
  createPricingRequestError,
  createPricingRequestPending,
  createPricingRequestSuccess,
  deletePricingRequestError,
  deletePricingRequestPending,
  deletePricingRequestSuccess,
  getPricingRequestError,
  getPricingRequestPending,
  getPricingRequestSuccess,
  getPricingRequestsError,
  getPricingRequestsPending,
  getPricingRequestsSuccess,
  updatePricingRequestError,
  updatePricingRequestPending,
  updatePricingRequestSuccess,
} from "./actions";
import type {
  AssignPricingRequestDto,
  CreatePricingRequestDto,
  IPricingRequest,
  IPricingRequestStateContext,
  PricingRequestQuery,
  UpdatePricingRequestDto,
} from "./context";
import {
  INITIAL_STATE,
  PricingRequestActionContext,
  PricingRequestStateContext,
} from "./context";
import { PricingRequestReducer } from "./reducer";

const BASE_URL = "/api/PricingRequests";

const buildQueryString = (query?: PricingRequestQuery) => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.status) params.set("status", String(query.status));
  if (query.priority) params.set("priority", String(query.priority));
  if (query.assignedToId) params.set("assignedToId", query.assignedToId);
  if (query.opportunityId) params.set("opportunityId", query.opportunityId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const mapListPayload = (
  data: unknown,
): {
  items: IPricingRequest[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
} => {
  if (Array.isArray((data as { items?: unknown[] })?.items)) {
    const paged = data as {
      items: IPricingRequest[];
      pageNumber?: number;
      pageSize?: number;
      totalCount?: number;
      totalPages?: number;
    };
    return {
      items: paged.items,
      pageNumber: paged.pageNumber,
      pageSize: paged.pageSize,
      totalCount: paged.totalCount,
      totalPages: paged.totalPages,
    };
  }
  return { items: Array.isArray(data) ? (data as IPricingRequest[]) : [] };
};

export const PricingRequestProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(PricingRequestReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: (message?: string) => Action<IPricingRequestStateContext>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getPricingRequest = async (id: string) => {
    dispatch(getPricingRequestPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getPricingRequestSuccess(data));
    } catch (err) {
      handleError(err, getPricingRequestError);
    }
  };

  const getPricingRequests = async (query?: PricingRequestQuery) => {
    dispatch(getPricingRequestsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      dispatch(getPricingRequestsSuccess(mapListPayload(data)));
    } catch (err) {
      handleError(err, getPricingRequestsError);
    }
  };

  const getMyPricingRequests = async (query?: PricingRequestQuery) => {
    dispatch(getPricingRequestsPending());
    try {
      const { data } = await instance.get(
        `${BASE_URL}/my-requests${buildQueryString(query)}`,
      );
      dispatch(getPricingRequestsSuccess(mapListPayload(data)));
    } catch (err) {
      handleError(err, getPricingRequestsError);
    }
  };

  const createPricingRequest = async (
    payload: CreatePricingRequestDto,
  ): Promise<boolean> => {
    dispatch(createPricingRequestPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createPricingRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createPricingRequestError);
      return false;
    }
  };

  const updatePricingRequest = async (
    id: string,
    payload: UpdatePricingRequestDto,
  ): Promise<boolean> => {
    dispatch(updatePricingRequestPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updatePricingRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updatePricingRequestError);
      return false;
    }
  };

  const deletePricingRequest = async (id: string): Promise<boolean> => {
    dispatch(deletePricingRequestPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deletePricingRequestSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deletePricingRequestError);
      return false;
    }
  };

  const assignPricingRequest = async (
    id: string,
    payload: AssignPricingRequestDto,
  ): Promise<boolean> => {
    dispatch(assignPricingRequestPending());
    try {
      const { data } = await instance.post(`${BASE_URL}/${id}/assign`, payload);
      dispatch(assignPricingRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, assignPricingRequestError);
      return false;
    }
  };

  const completePricingRequest = async (id: string): Promise<boolean> => {
    dispatch(completePricingRequestPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/complete`);
      dispatch(completePricingRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, completePricingRequestError);
      return false;
    }
  };

  return (
    <PricingRequestStateContext.Provider value={state}>
      <PricingRequestActionContext.Provider
        value={{
          getPricingRequest,
          getPricingRequests,
          getMyPricingRequests,
          createPricingRequest,
          updatePricingRequest,
          deletePricingRequest,
          assignPricingRequest,
          completePricingRequest,
        }}
      >
        {children}
      </PricingRequestActionContext.Provider>
    </PricingRequestStateContext.Provider>
  );
};

export const usePricingRequestState = () => {
  const context = useContext(PricingRequestStateContext);
  if (!context) {
    throw new Error(
      "usePricingRequestState must be used within a PricingRequestProvider",
    );
  }
  return context;
};

export const usePricingRequestActions = () => {
  const context = useContext(PricingRequestActionContext);
  if (!context) {
    throw new Error(
      "usePricingRequestActions must be used within a PricingRequestProvider",
    );
  }
  return context;
};
