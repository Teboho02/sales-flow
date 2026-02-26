import { createAction } from "redux-actions";
import type { IOpportunity, IOpportunityStateContext, IPipelineMetrics, IOpportunityStageHistory } from "./context";

export enum OpportunityActionEnums {
  getOpportunityPending = "GET_OPPORTUNITY_PENDING",
  getOpportunitySuccess = "GET_OPPORTUNITY_SUCCESS",
  getOpportunityError = "GET_OPPORTUNITY_ERROR",

  getOpportunitiesPending = "GET_OPPORTUNITIES_PENDING",
  getOpportunitiesSuccess = "GET_OPPORTUNITIES_SUCCESS",
  getOpportunitiesError = "GET_OPPORTUNITIES_ERROR",

  createOpportunityPending = "CREATE_OPPORTUNITY_PENDING",
  createOpportunitySuccess = "CREATE_OPPORTUNITY_SUCCESS",
  createOpportunityError = "CREATE_OPPORTUNITY_ERROR",

  updateOpportunityPending = "UPDATE_OPPORTUNITY_PENDING",
  updateOpportunitySuccess = "UPDATE_OPPORTUNITY_SUCCESS",
  updateOpportunityError = "UPDATE_OPPORTUNITY_ERROR",

  deleteOpportunityPending = "DELETE_OPPORTUNITY_PENDING",
  deleteOpportunitySuccess = "DELETE_OPPORTUNITY_SUCCESS",
  deleteOpportunityError = "DELETE_OPPORTUNITY_ERROR",

  updateStagePending = "UPDATE_STAGE_PENDING",
  updateStageSuccess = "UPDATE_STAGE_SUCCESS",
  updateStageError = "UPDATE_STAGE_ERROR",

  assignOpportunityPending = "ASSIGN_OPPORTUNITY_PENDING",
  assignOpportunitySuccess = "ASSIGN_OPPORTUNITY_SUCCESS",
  assignOpportunityError = "ASSIGN_OPPORTUNITY_ERROR",

  getStageHistoryPending = "GET_STAGE_HISTORY_PENDING",
  getStageHistorySuccess = "GET_STAGE_HISTORY_SUCCESS",
  getStageHistoryError = "GET_STAGE_HISTORY_ERROR",

  getPipelineMetricsPending = "GET_PIPELINE_METRICS_PENDING",
  getPipelineMetricsSuccess = "GET_PIPELINE_METRICS_SUCCESS",
  getPipelineMetricsError = "GET_PIPELINE_METRICS_ERROR",
}

const pendingState: IOpportunityStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IOpportunityStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getOpportunityPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.getOpportunityPending,
  () => pendingState,
);

export const getOpportunitySuccess = createAction<
  IOpportunityStateContext,
  IOpportunity
>(OpportunityActionEnums.getOpportunitySuccess, (opportunity: IOpportunity) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunity,
}));

export const getOpportunityError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.getOpportunityError, (message?: string) => errorState(message));

export const getOpportunitiesPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.getOpportunitiesPending,
  () => pendingState,
);

export const getOpportunitiesSuccess = createAction<
  IOpportunityStateContext,
  {
    items: IOpportunity[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(OpportunityActionEnums.getOpportunitiesSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunities: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getOpportunitiesError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.getOpportunitiesError, (message?: string) => errorState(message));

export const createOpportunityPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.createOpportunityPending,
  () => pendingState,
);

export const createOpportunitySuccess = createAction<
  IOpportunityStateContext,
  IOpportunity
>(OpportunityActionEnums.createOpportunitySuccess, (opportunity: IOpportunity) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunity,
}));

export const createOpportunityError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.createOpportunityError, (message?: string) => errorState(message));

export const updateOpportunityPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.updateOpportunityPending,
  () => pendingState,
);

export const updateOpportunitySuccess = createAction<
  IOpportunityStateContext,
  IOpportunity
>(OpportunityActionEnums.updateOpportunitySuccess, (opportunity: IOpportunity) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunity,
}));

export const updateOpportunityError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.updateOpportunityError, (message?: string) => errorState(message));

export const deleteOpportunityPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.deleteOpportunityPending,
  () => pendingState,
);

export const deleteOpportunitySuccess = createAction<IOpportunityStateContext, string>(
  OpportunityActionEnums.deleteOpportunitySuccess,
  (_id: string) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    opportunity: undefined,
  }),
  (id) => ({ id }),
);

export const deleteOpportunityError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.deleteOpportunityError, (message?: string) => errorState(message));

export const updateStagePending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.updateStagePending,
  () => pendingState,
);

export const updateStageSuccess = createAction<
  IOpportunityStateContext,
  IOpportunity
>(OpportunityActionEnums.updateStageSuccess, (opportunity: IOpportunity) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunity,
}));

export const updateStageError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.updateStageError, (message?: string) => errorState(message));

export const assignOpportunityPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.assignOpportunityPending,
  () => pendingState,
);

export const assignOpportunitySuccess = createAction<
  IOpportunityStateContext,
  IOpportunity
>(OpportunityActionEnums.assignOpportunitySuccess, (opportunity: IOpportunity) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  opportunity,
}));

export const assignOpportunityError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.assignOpportunityError, (message?: string) => errorState(message));

export const getStageHistoryPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.getStageHistoryPending,
  () => pendingState,
);

export const getStageHistorySuccess = createAction<
  IOpportunityStateContext,
  IOpportunityStageHistory[]
>(OpportunityActionEnums.getStageHistorySuccess, (history: IOpportunityStageHistory[]) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  stageHistory: history,
}));

export const getStageHistoryError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.getStageHistoryError, (message?: string) => errorState(message));

export const getPipelineMetricsPending = createAction<IOpportunityStateContext>(
  OpportunityActionEnums.getPipelineMetricsPending,
  () => pendingState,
);

export const getPipelineMetricsSuccess = createAction<
  IOpportunityStateContext,
  IPipelineMetrics
>(OpportunityActionEnums.getPipelineMetricsSuccess, (metrics: IPipelineMetrics) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pipelineMetrics: metrics,
}));

export const getPipelineMetricsError = createAction<
  IOpportunityStateContext,
  string | undefined
>(OpportunityActionEnums.getPipelineMetricsError, (message?: string) => errorState(message));
