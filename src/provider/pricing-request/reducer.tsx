import { handleActions } from "redux-actions";
import type { IPricingRequestStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { PricingRequestActionEnums } from "./actions";

export const PricingRequestReducer = handleActions<
  IPricingRequestStateContext,
  IPricingRequestStateContext
>(
  {
    [PricingRequestActionEnums.getRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests
        ? state.requests.map((r) =>
            r.id === action.payload?.request?.id ? action.payload.request! : r,
          )
        : state.requests,
    }),
    [PricingRequestActionEnums.getRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.getRequestsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getRequestsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.getRequestsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.createRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.createRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests
        ? [...state.requests, action.payload.request!]
        : [action.payload.request!],
    }),
    [PricingRequestActionEnums.createRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.updateRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.updateRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests
        ? state.requests.map((r) =>
            r.id === action.payload?.request?.id ? action.payload.request! : r,
          )
        : state.requests,
    }),
    [PricingRequestActionEnums.updateRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.deleteRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.deleteRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests?.filter(
        (r) => r.id !== (action.payload as IPricingRequestStateContext & { id?: string }).id,
      ),
      request: undefined,
    }),
    [PricingRequestActionEnums.deleteRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.assignRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.assignRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests
        ? state.requests.map((r) =>
            r.id === action.payload?.request?.id ? action.payload.request! : r,
          )
        : state.requests,
    }),
    [PricingRequestActionEnums.assignRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestActionEnums.completeRequestPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [PricingRequestActionEnums.completeRequestSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      requests: state.requests
        ? state.requests.map((r) =>
            r.id === action.payload?.request?.id ? action.payload.request! : r,
          )
        : state.requests,
    }),
    [PricingRequestActionEnums.completeRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
