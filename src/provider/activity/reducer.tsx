import { handleActions } from "redux-actions";
import type { IActivityStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ActivityActionEnums } from "./actions";

export const ActivityReducer = handleActions<IActivityStateContext, IActivityStateContext>(
  {
    [ActivityActionEnums.getActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.getActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities
        ? state.activities.map((item) =>
            item.id === action.payload?.activity?.id ? action.payload.activity! : item,
          )
        : state.activities,
    }),
    [ActivityActionEnums.getActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.getActivitiesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.getActivitiesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.getActivitiesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.createActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.createActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities
        ? [action.payload.activity!, ...state.activities]
        : [action.payload.activity!],
    }),
    [ActivityActionEnums.createActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.updateActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.updateActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities
        ? state.activities.map((item) =>
            item.id === action.payload?.activity?.id ? action.payload.activity! : item,
          )
        : state.activities,
    }),
    [ActivityActionEnums.updateActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.completeActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.completeActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities
        ? state.activities.map((item) =>
            item.id === action.payload?.activity?.id ? action.payload.activity! : item,
          )
        : state.activities,
    }),
    [ActivityActionEnums.completeActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.cancelActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.cancelActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities
        ? state.activities.map((item) =>
            item.id === action.payload?.activity?.id ? action.payload.activity! : item,
          )
        : state.activities,
    }),
    [ActivityActionEnums.cancelActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ActivityActionEnums.deleteActivityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityActionEnums.deleteActivitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      activities: state.activities?.filter(
        (item) => item.id !== (action.payload as IActivityStateContext & { id?: string }).id,
      ),
      activity: undefined,
    }),
    [ActivityActionEnums.deleteActivityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
