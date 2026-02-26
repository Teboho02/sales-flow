"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { ActionFunctionAny } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  assignRequestError,
  assignRequestPending,
  assignRequestSuccess,
  completeRequestError,
  completeRequestPending,
  completeRequestSuccess,
  createRequestError,
  createRequestPending,
  createRequestSuccess,
  deleteRequestError,
  deleteRequestPending,
  deleteRequestSuccess,
  getRequestError,
  getRequestPending,
  getRequestSuccess,
  getRequestsError,
  getRequestsPending,
  getRequestsSuccess,
  updateRequestError,
  updateRequestPending,
  updateRequestSuccess,
} from "./actions";
import type {
  AssignPricingRequestDto,
  CreatePricingRequestDto,
  IPricingRequestStateContext,
  PricingRequestQuery,
  UpdatePricingRequestDto,
} from "./context";
import {
  PricingRequestActionContext,
  PricingRequestStateContext,
  INITIAL_STATE,
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

export const PricingRequestProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(PricingRequestReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: ActionFunctionAny<IPricingRequestStateContext>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getRequest = async (id: string) => {
    dispatch(getRequestPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getRequestSuccess(data));
    } catch (err) {
      handleError(err, getRequestError);
    }
  };

  const getRequests = async (query?: PricingRequestQuery) => {
    dispatch(getRequestsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        dispatch(
          getRequestsSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        dispatch(
          getRequestsSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getRequestsError);
    }
  };

  const getMyRequests = async () => {
    dispatch(getRequestsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/my-requests`);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      dispatch(
        getRequestsSuccess({
          items,
          pageNumber: 1,
          pageSize: items.length,
          totalCount: items.length,
          totalPages: 1,
        }),
      );
    } catch (err) {
      handleError(err, getRequestsError);
    }
  };

  const getPendingRequests = async () => {
    dispatch(getRequestsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/pending`);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      dispatch(
        getRequestsSuccess({
          items,
          pageNumber: 1,
          pageSize: items.length,
          totalCount: items.length,
          totalPages: 1,
        }),
      );
    } catch (err) {
      handleError(err, getRequestsError);
    }
  };

  const createRequest = async (payload: CreatePricingRequestDto): Promise<boolean> => {
    dispatch(createRequestPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createRequestError);
      return false;
    }
  };

  const updateRequest = async (
    id: string,
    payload: UpdatePricingRequestDto,
  ): Promise<boolean> => {
    dispatch(updateRequestPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateRequestError);
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    dispatch(deleteRequestPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteRequestSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteRequestError);
      return false;
    }
  };

  const assignRequest = async (
    id: string,
    payload: AssignPricingRequestDto,
  ): Promise<boolean> => {
    dispatch(assignRequestPending());
    try {
      const { data } = await instance.post(`${BASE_URL}/${id}/assign`, payload);
      dispatch(assignRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, assignRequestError);
      return false;
    }
  };

  const completeRequest = async (id: string): Promise<boolean> => {
    dispatch(completeRequestPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/complete`);
      dispatch(completeRequestSuccess(data));
      return true;
    } catch (err) {
      handleError(err, completeRequestError);
      return false;
    }
  };

  return (
    <PricingRequestStateContext.Provider value={state}>
      <PricingRequestActionContext.Provider
        value={{
          getRequest,
          getRequests,
          getMyRequests,
          getPendingRequests,
          createRequest,
          updateRequest,
          deleteRequest,
          assignRequest,
          completeRequest,
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
    throw new Error("usePricingRequestState must be used within a PricingRequestProvider");
  }
  return context;
};

export const usePricingRequestActions = () => {
  const context = useContext(PricingRequestActionContext);
  if (!context) {
    throw new Error("usePricingRequestActions must be used within a PricingRequestProvider");
  }
  return context;
};
