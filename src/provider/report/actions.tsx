import { createAction } from "redux-actions";
import type { IReportStateContext, OpportunitiesReportItem, SalesByPeriodItem, SalesPerformanceReport } from "./context";

export enum ReportActionEnums {
  getOpportunitiesReportPending = "GET_OPPORTUNITIES_REPORT_PENDING",
  getOpportunitiesReportSuccess = "GET_OPPORTUNITIES_REPORT_SUCCESS",
  getOpportunitiesReportError = "GET_OPPORTUNITIES_REPORT_ERROR",

  getSalesByPeriodPending = "GET_SALES_BY_PERIOD_PENDING",
  getSalesByPeriodSuccess = "GET_SALES_BY_PERIOD_SUCCESS",
  getSalesByPeriodError = "GET_SALES_BY_PERIOD_ERROR",

  getSalesPerformancePending = "GET_SALES_PERFORMANCE_PENDING",
  getSalesPerformanceSuccess = "GET_SALES_PERFORMANCE_SUCCESS",
  getSalesPerformanceError = "GET_SALES_PERFORMANCE_ERROR",
}

const pendingState: IReportStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IReportStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getOpportunitiesReportPending = createAction<IReportStateContext>(
  ReportActionEnums.getOpportunitiesReportPending,
  () => pendingState,
);

export const getOpportunitiesReportSuccess = createAction<
  IReportStateContext,
  OpportunitiesReportItem[]
>(ReportActionEnums.getOpportunitiesReportSuccess, (items) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunitiesReport: items,
}));

export const getOpportunitiesReportError = createAction<IReportStateContext, string | undefined>(
  ReportActionEnums.getOpportunitiesReportError,
  (message?: string) => errorState(message),
);

export const getSalesByPeriodPending = createAction<IReportStateContext>(
  ReportActionEnums.getSalesByPeriodPending,
  () => pendingState,
);

export const getSalesByPeriodSuccess = createAction<IReportStateContext, SalesByPeriodItem[]>(
  ReportActionEnums.getSalesByPeriodSuccess,
  (items) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    salesByPeriod: items,
  }),
);

export const getSalesByPeriodError = createAction<IReportStateContext, string | undefined>(
  ReportActionEnums.getSalesByPeriodError,
  (message?: string) => errorState(message),
);

export const getSalesPerformancePending = createAction<IReportStateContext>(
  ReportActionEnums.getSalesPerformancePending,
  () => pendingState,
);

export const getSalesPerformanceSuccess = createAction<IReportStateContext, SalesPerformanceReport>(
  ReportActionEnums.getSalesPerformanceSuccess,
  (report) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    salesPerformance: report,
  }),
);

export const getSalesPerformanceError = createAction<IReportStateContext, string | undefined>(
  ReportActionEnums.getSalesPerformanceError,
  (message?: string) => errorState(message),
);
