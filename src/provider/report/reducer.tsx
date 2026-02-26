import { handleActions } from "redux-actions";
import type { IReportStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ReportActionEnums } from "./actions";

export const ReportReducer = handleActions<IReportStateContext, IReportStateContext>(
  {
    [ReportActionEnums.getOpportunitiesReportPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ReportActionEnums.getOpportunitiesReportSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ReportActionEnums.getOpportunitiesReportError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ReportActionEnums.getSalesByPeriodPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ReportActionEnums.getSalesByPeriodSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ReportActionEnums.getSalesByPeriodError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
