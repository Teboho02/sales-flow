import { handleActions } from "redux-actions";
import type { IOpportunityStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { OpportunityActionEnums } from "./actions";

export const OpportunityReducer = handleActions<
  IOpportunityStateContext,
  IOpportunityStateContext
>(
  {
    [OpportunityActionEnums.getOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities
        ? state.opportunities.map((o) =>
            o.id === action.payload?.opportunity?.id ? action.payload.opportunity! : o,
          )
        : state.opportunities,
    }),
    [OpportunityActionEnums.getOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.getOpportunitiesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getOpportunitiesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getOpportunitiesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.createOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.createOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities
        ? [...state.opportunities, action.payload.opportunity!]
        : [action.payload.opportunity!],
    }),
    [OpportunityActionEnums.createOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.updateOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.updateOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities
        ? state.opportunities.map((o) =>
            o.id === action.payload?.opportunity?.id ? action.payload.opportunity! : o,
          )
        : state.opportunities,
    }),
    [OpportunityActionEnums.updateOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.updateStagePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.updateStageSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities
        ? state.opportunities.map((o) =>
            o.id === action.payload?.opportunity?.id ? action.payload.opportunity! : o,
          )
        : state.opportunities,
    }),
    [OpportunityActionEnums.updateStageError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.assignOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.assignOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities
        ? state.opportunities.map((o) =>
            o.id === action.payload?.opportunity?.id ? action.payload.opportunity! : o,
          )
        : state.opportunities,
    }),
    [OpportunityActionEnums.assignOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.deleteOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.deleteOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      opportunities: state.opportunities?.filter(
        (o) => o.id !== (action.payload as any).id,
      ),
      opportunity: undefined,
    }),
    [OpportunityActionEnums.deleteOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.getStageHistoryPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getStageHistorySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getStageHistoryError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunityActionEnums.getPipelineMetricsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getPipelineMetricsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [OpportunityActionEnums.getPipelineMetricsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
