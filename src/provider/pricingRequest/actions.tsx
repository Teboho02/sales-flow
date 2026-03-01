import { createAction } from "redux-actions";
import type { IPricingRequest, IPricingRequestStateContext } from "./context";

export enum PricingRequestActionEnums {
  getPricingRequestPending = "GET_PRICING_REQUEST_PENDING",
  getPricingRequestSuccess = "GET_PRICING_REQUEST_SUCCESS",
  getPricingRequestError = "GET_PRICING_REQUEST_ERROR",

  getPricingRequestsPending = "GET_PRICING_REQUESTS_PENDING",
  getPricingRequestsSuccess = "GET_PRICING_REQUESTS_SUCCESS",
  getPricingRequestsError = "GET_PRICING_REQUESTS_ERROR",

  createPricingRequestPending = "CREATE_PRICING_REQUEST_PENDING",
  createPricingRequestSuccess = "CREATE_PRICING_REQUEST_SUCCESS",
  createPricingRequestError = "CREATE_PRICING_REQUEST_ERROR",

  updatePricingRequestPending = "UPDATE_PRICING_REQUEST_PENDING",
  updatePricingRequestSuccess = "UPDATE_PRICING_REQUEST_SUCCESS",
  updatePricingRequestError = "UPDATE_PRICING_REQUEST_ERROR",

  deletePricingRequestPending = "DELETE_PRICING_REQUEST_PENDING",
  deletePricingRequestSuccess = "DELETE_PRICING_REQUEST_SUCCESS",
  deletePricingRequestError = "DELETE_PRICING_REQUEST_ERROR",

  assignPricingRequestPending = "ASSIGN_PRICING_REQUEST_PENDING",
  assignPricingRequestSuccess = "ASSIGN_PRICING_REQUEST_SUCCESS",
  assignPricingRequestError = "ASSIGN_PRICING_REQUEST_ERROR",

  completePricingRequestPending = "COMPLETE_PRICING_REQUEST_PENDING",
  completePricingRequestSuccess = "COMPLETE_PRICING_REQUEST_SUCCESS",
  completePricingRequestError = "COMPLETE_PRICING_REQUEST_ERROR",
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

export const getPricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.getPricingRequestPending,
  () => pendingState,
);

export const getPricingRequestSuccess = createAction<
  IPricingRequestStateContext,
  IPricingRequest
>(PricingRequestActionEnums.getPricingRequestSuccess, (pricingRequest) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest,
}));

export const getPricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.getPricingRequestError, (message?: string) =>
  errorState(message),
);

export const getPricingRequestsPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.getPricingRequestsPending,
  () => pendingState,
);

export const getPricingRequestsSuccess = createAction<
  IPricingRequestStateContext,
  {
    items: IPricingRequest[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(PricingRequestActionEnums.getPricingRequestsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequests: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getPricingRequestsError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.getPricingRequestsError, (message?: string) =>
  errorState(message),
);

export const createPricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.createPricingRequestPending,
  () => pendingState,
);

export const createPricingRequestSuccess = createAction<
  IPricingRequestStateContext,
  IPricingRequest
>(PricingRequestActionEnums.createPricingRequestSuccess, (pricingRequest) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest,
}));

export const createPricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.createPricingRequestError, (message?: string) =>
  errorState(message),
);

export const updatePricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.updatePricingRequestPending,
  () => pendingState,
);

export const updatePricingRequestSuccess = createAction<
  IPricingRequestStateContext,
  IPricingRequest
>(PricingRequestActionEnums.updatePricingRequestSuccess, (pricingRequest) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest,
}));

export const updatePricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.updatePricingRequestError, (message?: string) =>
  errorState(message),
);

export const deletePricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.deletePricingRequestPending,
  () => pendingState,
);

export const deletePricingRequestSuccess = createAction<
  IPricingRequestStateContext & { id: string },
  string
>(PricingRequestActionEnums.deletePricingRequestSuccess, (id) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest: undefined,
  id,
}));

export const deletePricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.deletePricingRequestError, (message?: string) =>
  errorState(message),
);

export const assignPricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.assignPricingRequestPending,
  () => pendingState,
);

export const assignPricingRequestSuccess = createAction<
  IPricingRequestStateContext,
  IPricingRequest
>(PricingRequestActionEnums.assignPricingRequestSuccess, (pricingRequest) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest,
}));

export const assignPricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.assignPricingRequestError, (message?: string) =>
  errorState(message),
);

export const completePricingRequestPending = createAction<IPricingRequestStateContext>(
  PricingRequestActionEnums.completePricingRequestPending,
  () => pendingState,
);

export const completePricingRequestSuccess = createAction<
  IPricingRequestStateContext,
  IPricingRequest
>(PricingRequestActionEnums.completePricingRequestSuccess, (pricingRequest) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  pricingRequest,
}));

export const completePricingRequestError = createAction<
  IPricingRequestStateContext,
  string | undefined
>(PricingRequestActionEnums.completePricingRequestError, (message?: string) =>
  errorState(message),
);
