import { createAction } from "redux-actions";
import type { IActivity, IActivityStateContext } from "./context";

export enum ActivityActionEnums {
  getActivityPending = "GET_ACTIVITY_PENDING",
  getActivitySuccess = "GET_ACTIVITY_SUCCESS",
  getActivityError = "GET_ACTIVITY_ERROR",

  getActivitiesPending = "GET_ACTIVITIES_PENDING",
  getActivitiesSuccess = "GET_ACTIVITIES_SUCCESS",
  getActivitiesError = "GET_ACTIVITIES_ERROR",

  createActivityPending = "CREATE_ACTIVITY_PENDING",
  createActivitySuccess = "CREATE_ACTIVITY_SUCCESS",
  createActivityError = "CREATE_ACTIVITY_ERROR",

  updateActivityPending = "UPDATE_ACTIVITY_PENDING",
  updateActivitySuccess = "UPDATE_ACTIVITY_SUCCESS",
  updateActivityError = "UPDATE_ACTIVITY_ERROR",

  deleteActivityPending = "DELETE_ACTIVITY_PENDING",
  deleteActivitySuccess = "DELETE_ACTIVITY_SUCCESS",
  deleteActivityError = "DELETE_ACTIVITY_ERROR",

  completeActivityPending = "COMPLETE_ACTIVITY_PENDING",
  completeActivitySuccess = "COMPLETE_ACTIVITY_SUCCESS",
  completeActivityError = "COMPLETE_ACTIVITY_ERROR",

  cancelActivityPending = "CANCEL_ACTIVITY_PENDING",
  cancelActivitySuccess = "CANCEL_ACTIVITY_SUCCESS",
  cancelActivityError = "CANCEL_ACTIVITY_ERROR",
}

const pendingState: IActivityStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IActivityStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.getActivityPending,
  () => pendingState,
);

export const getActivitySuccess = createAction<IActivityStateContext, IActivity>(
  ActivityActionEnums.getActivitySuccess,
  (activity) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    activity,
  }),
);

export const getActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.getActivityError,
  (message?: string) => errorState(message),
);

export const getActivitiesPending = createAction<IActivityStateContext>(
  ActivityActionEnums.getActivitiesPending,
  () => pendingState,
);

export const getActivitiesSuccess = createAction<
  IActivityStateContext,
  {
    items: IActivity[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(ActivityActionEnums.getActivitiesSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  activities: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getActivitiesError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.getActivitiesError,
  (message?: string) => errorState(message),
);

export const createActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.createActivityPending,
  () => pendingState,
);

export const createActivitySuccess = createAction<IActivityStateContext, IActivity>(
  ActivityActionEnums.createActivitySuccess,
  (activity) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    activity,
  }),
);

export const createActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.createActivityError,
  (message?: string) => errorState(message),
);

export const updateActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.updateActivityPending,
  () => pendingState,
);

export const updateActivitySuccess = createAction<IActivityStateContext, IActivity>(
  ActivityActionEnums.updateActivitySuccess,
  (activity) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    activity,
  }),
);

export const updateActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.updateActivityError,
  (message?: string) => errorState(message),
);

export const deleteActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.deleteActivityPending,
  () => pendingState,
);

export const deleteActivitySuccess = createAction<
  IActivityStateContext & { id: string },
  string
>(ActivityActionEnums.deleteActivitySuccess, (id) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  activity: undefined,
  id,
}));

export const deleteActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.deleteActivityError,
  (message?: string) => errorState(message),
);

export const completeActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.completeActivityPending,
  () => pendingState,
);

export const completeActivitySuccess = createAction<IActivityStateContext, IActivity>(
  ActivityActionEnums.completeActivitySuccess,
  (activity) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    activity,
  }),
);

export const completeActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.completeActivityError,
  (message?: string) => errorState(message),
);

export const cancelActivityPending = createAction<IActivityStateContext>(
  ActivityActionEnums.cancelActivityPending,
  () => pendingState,
);

export const cancelActivitySuccess = createAction<IActivityStateContext, IActivity>(
  ActivityActionEnums.cancelActivitySuccess,
  (activity) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    activity,
  }),
);

export const cancelActivityError = createAction<IActivityStateContext, string | undefined>(
  ActivityActionEnums.cancelActivityError,
  (message?: string) => errorState(message),
);
