"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  getOpportunitiesReportError,
  getOpportunitiesReportPending,
  getOpportunitiesReportSuccess,
  getSalesByPeriodError,
  getSalesByPeriodPending,
  getSalesByPeriodSuccess,
} from "./actions";
import type {
  IReportActionContext,
  IReportStateContext,
  OpportunitiesReportQuery,
  SalesByPeriodQuery,
} from "./context";
import { INITIAL_STATE, ReportActionContext, ReportStateContext } from "./context";
import { ReportReducer } from "./reducer";

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ReportReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (err: unknown, fallback: (msg?: string) => any) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getOpportunitiesReport = async (filters: OpportunitiesReportQuery) => {
    dispatch(getOpportunitiesReportPending());
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (filters.stage) params.set("stage", String(filters.stage));
      if (filters.ownerId) params.set("ownerId", filters.ownerId);
      const { data } = await instance.get(`/api/Reports/opportunities?${params.toString()}`);
      dispatch(getOpportunitiesReportSuccess(Array.isArray(data) ? data : data?.items ?? []));
    } catch (err) {
      handleError(err, getOpportunitiesReportError);
    }
  };

  const getSalesByPeriod = async (filters: SalesByPeriodQuery) => {
    dispatch(getSalesByPeriodPending());
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
      });
      const { data } = await instance.get(`/api/Reports/sales-by-period?${params.toString()}`);
      dispatch(getSalesByPeriodSuccess(Array.isArray(data) ? data : data?.items ?? []));
    } catch (err) {
      handleError(err, getSalesByPeriodError);
    }
  };

  return (
    <ReportStateContext.Provider value={state}>
      <ReportActionContext.Provider
        value={{
          getOpportunitiesReport,
          getSalesByPeriod,
        }}
      >
        {children}
      </ReportActionContext.Provider>
    </ReportStateContext.Provider>
  );
};

export const useReportState = () => {
  const context = useContext(ReportStateContext);
  if (!context) {
    throw new Error("useReportState must be used within a ReportProvider");
  }
  return context;
};

export const useReportActions = () => {
  const context = useContext(ReportActionContext);
  if (!context) {
    throw new Error("useReportActions must be used within a ReportProvider");
  }
  return context;
};
