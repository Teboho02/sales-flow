import { handleActions } from "redux-actions";
import type { IPricingRequestStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { PricingRequestActionEnums } from "./actions";

export const PricingRequestReducer = handleActions<
  IPricingRequestStateContext,
  IPricingRequestStateContext
>(
  {
    [PricingRequestActionEnums.getPricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getPricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests
        ? state.pricingRequests.map((request) =>
            request.id === action.payload?.pricingRequest?.id
              ? action.payload.pricingRequest!
              : request,
          )
        : state.pricingRequests,
    }),
    [PricingRequestActionEnums.getPricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.getPricingRequestsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getPricingRequestsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getPricingRequestsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.createPricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.createPricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests
        ? [action.payload.pricingRequest!, ...state.pricingRequests]
        : [action.payload.pricingRequest!],
    }),
    [PricingRequestActionEnums.createPricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.updatePricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.updatePricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests
        ? state.pricingRequests.map((request) =>
            request.id === action.payload?.pricingRequest?.id
              ? action.payload.pricingRequest!
              : request,
          )
        : state.pricingRequests,
    }),
    [PricingRequestActionEnums.updatePricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.assignPricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.assignPricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests
        ? state.pricingRequests.map((request) =>
            request.id === action.payload?.pricingRequest?.id
              ? action.payload.pricingRequest!
              : request,
          )
        : state.pricingRequests,
    }),
    [PricingRequestActionEnums.assignPricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.completePricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.completePricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests
        ? state.pricingRequests.map((request) =>
            request.id === action.payload?.pricingRequest?.id
              ? action.payload.pricingRequest!
              : request,
          )
        : state.pricingRequests,
    }),
    [PricingRequestActionEnums.completePricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.deletePricingRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.deletePricingRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      pricingRequests: state.pricingRequests?.filter(
        (request) =>
          request.id !==
          (action.payload as IPricingRequestStateContext & { id?: string }).id,
      ),
      pricingRequest: undefined,
    }),
    [PricingRequestActionEnums.deletePricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
