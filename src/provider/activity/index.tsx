"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { Action } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  cancelActivityError,
  cancelActivityPending,
  cancelActivitySuccess,
  completeActivityError,
  completeActivityPending,
  completeActivitySuccess,
  createActivityError,
  createActivityPending,
  createActivitySuccess,
  deleteActivityError,
  deleteActivityPending,
  deleteActivitySuccess,
  getActivitiesError,
  getActivitiesPending,
  getActivitiesSuccess,
  getActivityError,
  getActivityPending,
  getActivitySuccess,
  updateActivityError,
  updateActivityPending,
  updateActivitySuccess,
} from "./actions";
import type {
  ActivityQuery,
  CompleteActivityDto,
  CreateActivityDto,
  IActivityStateContext,
  UpdateActivityDto,
} from "./context";
import { ActivityActionContext, ActivityStateContext, INITIAL_STATE } from "./context";
import { ActivityReducer } from "./reducer";

const BASE_URL = "/api/Activities";

const buildQueryString = (query?: ActivityQuery) => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.assignedToId) params.set("assignedToId", query.assignedToId);
  if (query.type) params.set("type", String(query.type));
  if (query.status) params.set("status", String(query.status));
  if (query.relatedToType) params.set("relatedToType", String(query.relatedToType));
  if (query.relatedToId) params.set("relatedToId", query.relatedToId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ActivityReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: (message?: string) => Action<IActivityStateContext>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getActivity = async (id: string) => {
    dispatch(getActivityPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getActivitySuccess(data));
    } catch (err) {
      handleError(err, getActivityError);
    }
  };

  const getActivities = async (query?: ActivityQuery) => {
    dispatch(getActivitiesPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data?.items)) {
        dispatch(
          getActivitiesSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          }),
        );
      } else {
        dispatch(
          getActivitiesSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getActivitiesError);
    }
  };

  const createActivity = async (payload: CreateActivityDto): Promise<boolean> => {
    dispatch(createActivityPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createActivitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, createActivityError);
      return false;
    }
  };

  const updateActivity = async (
    id: string,
    payload: UpdateActivityDto,
  ): Promise<boolean> => {
    dispatch(updateActivityPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateActivitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateActivityError);
      return false;
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    dispatch(deleteActivityPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteActivitySuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteActivityError);
      return false;
    }
  };

  const completeActivity = async (
    id: string,
    payload?: CompleteActivityDto,
  ): Promise<boolean> => {
    dispatch(completeActivityPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/complete`, payload ?? {});
      dispatch(completeActivitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, completeActivityError);
      return false;
    }
  };

  const cancelActivity = async (id: string): Promise<boolean> => {
    dispatch(cancelActivityPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/cancel`);
      dispatch(cancelActivitySuccess(data));
      return true;
    } catch (err) {
      handleError(err, cancelActivityError);
      return false;
    }
  };

  return (
    <ActivityStateContext.Provider value={state}>
      <ActivityActionContext.Provider
        value={{
          getActivity,
          getActivities,
          createActivity,
          updateActivity,
          deleteActivity,
          completeActivity,
          cancelActivity,
        }}
      >
        {children}
      </ActivityActionContext.Provider>
    </ActivityStateContext.Provider>
  );
};

export const useActivityState = () => {
  const context = useContext(ActivityStateContext);
  if (!context) {
    throw new Error("useActivityState must be used within an ActivityProvider");
  }
  return context;
};

export const useActivityActions = () => {
  const context = useContext(ActivityActionContext);
  if (!context) {
    throw new Error("useActivityActions must be used within an ActivityProvider");
  }
  return context;
};
