import { createAction } from "redux-actions";
import type { IContact, IContactStateContext } from "./context";

export enum ContactActionEnums {
  getContactPending = "GET_CONTACT_PENDING",
  getContactSuccess = "GET_CONTACT_SUCCESS",
  getContactError = "GET_CONTACT_ERROR",

  getContactsPending = "GET_CONTACTS_PENDING",
  getContactsSuccess = "GET_CONTACTS_SUCCESS",
  getContactsError = "GET_CONTACTS_ERROR",

  createContactPending = "CREATE_CONTACT_PENDING",
  createContactSuccess = "CREATE_CONTACT_SUCCESS",
  createContactError = "CREATE_CONTACT_ERROR",

  updateContactPending = "UPDATE_CONTACT_PENDING",
  updateContactSuccess = "UPDATE_CONTACT_SUCCESS",
  updateContactError = "UPDATE_CONTACT_ERROR",

  deleteContactPending = "DELETE_CONTACT_PENDING",
  deleteContactSuccess = "DELETE_CONTACT_SUCCESS",
  deleteContactError = "DELETE_CONTACT_ERROR",

  setPrimaryContactPending = "SET_PRIMARY_CONTACT_PENDING",
  setPrimaryContactSuccess = "SET_PRIMARY_CONTACT_SUCCESS",
  setPrimaryContactError = "SET_PRIMARY_CONTACT_ERROR",
}

const pendingState: IContactStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IContactStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getContactPending = createAction<IContactStateContext>(
  ContactActionEnums.getContactPending,
  () => pendingState,
);

export const getContactSuccess = createAction<IContactStateContext, IContact>(
  ContactActionEnums.getContactSuccess,
  (contact: IContact) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contact,
  }),
);

export const getContactError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.getContactError,
  (message?: string) => errorState(message),
);

export const getContactsPending = createAction<IContactStateContext>(
  ContactActionEnums.getContactsPending,
  () => pendingState,
);

export const getContactsSuccess = createAction<
  IContactStateContext,
  {
    items: IContact[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(ContactActionEnums.getContactsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  contacts: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getContactsError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.getContactsError,
  (message?: string) => errorState(message),
);

export const createContactPending = createAction<IContactStateContext>(
  ContactActionEnums.createContactPending,
  () => pendingState,
);

export const createContactSuccess = createAction<IContactStateContext, IContact>(
  ContactActionEnums.createContactSuccess,
  (contact: IContact) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contact,
  }),
);

export const createContactError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.createContactError,
  (message?: string) => errorState(message),
);

export const updateContactPending = createAction<IContactStateContext>(
  ContactActionEnums.updateContactPending,
  () => pendingState,
);

export const updateContactSuccess = createAction<IContactStateContext, IContact>(
  ContactActionEnums.updateContactSuccess,
  (contact: IContact) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contact,
  }),
);

export const updateContactError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.updateContactError,
  (message?: string) => errorState(message),
);

export const deleteContactPending = createAction<IContactStateContext>(
  ContactActionEnums.deleteContactPending,
  () => pendingState,
);

export const deleteContactSuccess = createAction<
  IContactStateContext & { id: string },
  string
>(ContactActionEnums.deleteContactSuccess, (id: string) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  contact: undefined,
  id,
}));

export const deleteContactError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.deleteContactError,
  (message?: string) => errorState(message),
);

export const setPrimaryContactPending = createAction<IContactStateContext>(
  ContactActionEnums.setPrimaryContactPending,
  () => pendingState,
);

export const setPrimaryContactSuccess = createAction<IContactStateContext, IContact>(
  ContactActionEnums.setPrimaryContactSuccess,
  (contact: IContact) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contact,
  }),
);

export const setPrimaryContactError = createAction<IContactStateContext, string | undefined>(
  ContactActionEnums.setPrimaryContactError,
  (message?: string) => errorState(message),
);
