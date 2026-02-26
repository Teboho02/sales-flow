import { createAction } from "redux-actions";
import type { IPricingRequest, IPricingRequestStateContext } from "./context";

export enum PricingRequestActionEnums {
  getRequestPending = "GET_PRICING_REQUEST_PENDING",
  getRequestSuccess = "GET_PRICING_REQUEST_SUCCESS",
  getRequestError = "GET_PRICING_REQUEST_ERROR",

  getRequestsPending = "GET_PRICING_REQUESTS_PENDING",
  getRequestsSuccess = "GET_PRICING_REQUESTS_SUCCESS",
  getRequestsError = "GET_PRICING_REQUESTS_ERROR",

  createRequestPending = "CREATE_PRICING_REQUEST_PENDING",
  createRequestSuccess = "CREATE_PRICING_REQUEST_SUCCESS",
  createRequestError = "CREATE_PRICING_REQUEST_ERROR",

  updateRequestPending = "UPDATE_PRICING_REQUEST_PENDING",
  updateRequestSuccess = "UPDATE_PRICING_REQUEST_SUCCESS",
  updateRequestError = "UPDATE_PRICING_REQUEST_ERROR",

  deleteRequestPending = "DELETE_PRICING_REQUEST_PENDING",
  deleteRequestSuccess = "DELETE_PRICING_REQUEST_SUCCESS",
  deleteRequestError = "DELETE_PRICING_REQUEST_ERROR",

  assignRequestPending = "ASSIGN_PRICING_REQUEST_PENDING",
  assignRequestSuccess = "ASSIGN_PRICING_REQUEST_SUCCESS",
  assignRequestError = "ASSIGN_PRICING_REQUEST_ERROR",

  completeRequestPending = "COMPLETE_PRICING_REQUEST_PENDING",
  completeRequestSuccess = "COMPLETE_PRICING_REQUEST_SUCCESS",
  completeRequestError = "COMPLETE_PRICING_REQUEST_ERROR",
}

const pendingState: IPricingRequestStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IPricingRequestStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.getRequestPending,
  () => pendingState,
);

export const getRequestSuccess = createAction<IPricingRequestStateContext, IPricingRequest>(
  PricingRequestActionEnums.getRequestSuccess,
  (request: IPricingRequest) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    request,
  }),
);

export const getRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.getRequestError,
  (message?: string) => errorState(message),
);

export const getRequestsPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.getRequestsPending,
  () => pendingState,
);

export const getRequestsSuccess = createAction<
  IPricingRequestStateContext,
  {
    items: IPricingRequest[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(PricingRequestActionEnums.getRequestsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  requests: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getRequestsError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.getRequestsError,
  (message?: string) => errorState(message),
);

export const createRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.createRequestPending,
  () => pendingState,
);

export const createRequestSuccess = createAction<IPricingRequestStateContext, IPricingRequest>(
  PricingRequestActionEnums.createRequestSuccess,
  (request: IPricingRequest) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    request,
  }),
);

export const createRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.createRequestError,
  (message?: string) => errorState(message),
);

export const updateRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.updateRequestPending,
  () => pendingState,
);

export const updateRequestSuccess = createAction<IPricingRequestStateContext, IPricingRequest>(
  PricingRequestActionEnums.updateRequestSuccess,
  (request: IPricingRequest) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    request,
  }),
);

export const updateRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.updateRequestError,
  (message?: string) => errorState(message),
);

export const deleteRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.deleteRequestPending,
  () => pendingState,
);

export const deleteRequestSuccess = createAction<
  IPricingRequestStateContext & { id: string },
  string
>(PricingRequestActionEnums.deleteRequestSuccess, (id: string) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  request: undefined,
  id,
}));

export const deleteRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.deleteRequestError,
  (message?: string) => errorState(message),
);

export const assignRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.assignRequestPending,
  () => pendingState,
);

export const assignRequestSuccess = createAction<IPricingRequestStateContext, IPricingRequest>(
  PricingRequestActionEnums.assignRequestSuccess,
  (request: IPricingRequest) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    request,
  }),
);

export const assignRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.assignRequestError,
  (message?: string) => errorState(message),
);

export const completeRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.completeRequestPending,
  () => pendingState,
);

export const completeRequestSuccess = createAction<IPricingRequestStateContext, IPricingRequest>(
  PricingRequestActionEnums.completeRequestSuccess,
  (request: IPricingRequest) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    request,
  }),
);

export const completeRequestError = createAction<IPricingRequestStateContext, string | undefined>(
  PricingRequestActionEnums.completeRequestError,
  (message?: string) => errorState(message),
);
