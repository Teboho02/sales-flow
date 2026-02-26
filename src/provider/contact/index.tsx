"use client";

import { useContext, useReducer, type Dispatch } from "react";
import axios from "axios";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
  ContactActionEnums,
  createContactError,
  createContactPending,
  createContactSuccess,
  deleteContactError,
  deleteContactPending,
  deleteContactSuccess,
  getContactError,
  getContactPending,
  getContactSuccess,
  getContactsError,
  getContactsPending,
  getContactsSuccess,
  setPrimaryError,
  setPrimaryPending,
  setPrimarySuccess,
  updateContactError,
  updateContactPending,
  updateContactSuccess,
} from "./actions";
import type {
  ContactQuery,
  CreateContactDto,
  IContactActionContext,
  IContactStateContext,
  UpdateContactDto,
} from "./context";
import { INITIAL_STATE, ContactActionContext, ContactStateContext } from "./context";
import { ContactReducer } from "./reducer";

const BASE_URL = "/api/Contacts";

const buildQueryString = (query?: ContactQuery): string => {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.clientId) params.set("clientId", query.clientId);
  if (query.searchTerm) params.set("searchTerm", query.searchTerm);
  if (typeof query.isActive === "boolean") params.set("isActive", String(query.isActive));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const handleError = (
  err: unknown,
  fallback: (msg?: string) => { type: ContactActionEnums; payload?: IContactStateContext },
  dispatch: Dispatch<{ type: ContactActionEnums; payload?: IContactStateContext }>,
) => {
  const message = axios.isAxiosError(err)
    ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
    : "Request failed.";
  dispatch(fallback(message));
  return message;
};

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ContactReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const getContact = async (id: string) => {
    dispatch(getContactPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getContactSuccess(data));
    } catch (err) {
      handleError(err, getContactError, dispatch);
    }
  };

  const getContacts = async (query?: ContactQuery) => {
    dispatch(getContactsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}${buildQueryString(query)}`);
      if (Array.isArray(data.items)) {
        dispatch(
          getContactsSuccess({
            items: data.items,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
            hasPreviousPage: data.hasPreviousPage,
            hasNextPage: data.hasNextPage,
          }),
        );
      } else if (Array.isArray(data)) {
        dispatch(getContactsSuccess(data));
      }
    } catch (err) {
      handleError(err, getContactsError, dispatch);
    }
  };

  const getContactsByClient = async (clientId: string) => {
    dispatch(getContactsPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/by-client/${clientId}`);
      dispatch(getContactsSuccess(Array.isArray(data) ? data : []));
    } catch (err) {
      handleError(err, getContactsError, dispatch);
    }
  };

  const createContact = async (payload: CreateContactDto): Promise<boolean> => {
    dispatch(createContactPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createContactSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createContactError, dispatch);
      return false;
    }
  };

  const updateContact = async (id: string, payload: UpdateContactDto): Promise<boolean> => {
    dispatch(updateContactPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}`, payload);
      dispatch(updateContactSuccess(data));
      return true;
    } catch (err) {
      handleError(err, updateContactError, dispatch);
      return false;
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    dispatch(deleteContactPending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteContactSuccess(id));
      return true;
    } catch (err) {
      handleError(err, deleteContactError, dispatch);
      return false;
    }
  };

  const setPrimary = async (id: string): Promise<boolean> => {
    dispatch(setPrimaryPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/set-primary`);
      dispatch(setPrimarySuccess(data));
      return true;
    } catch (err) {
      handleError(err, setPrimaryError, dispatch);
      return false;
    }
  };

  return (
    <ContactStateContext.Provider value={state}>
      <ContactActionContext.Provider
        value={{
          getContact,
          getContacts,
          getContactsByClient,
          createContact,
          updateContact,
          deleteContact,
          setPrimary,
        }}
      >
        {children}
      </ContactActionContext.Provider>
    </ContactStateContext.Provider>
  );
};

export const useContactState = () => {
  const context = useContext(ContactStateContext);
  if (!context) {
    throw new Error("useContactState must be used within a ContactProvider");
  }
  return context;
};

export const useContactActions = () => {
  const context = useContext(ContactActionContext);
  if (!context) {
    throw new Error("useContactActions must be used within a ContactProvider");
  }
  return context;
};
