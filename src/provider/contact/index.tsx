"use client";

import { useContext, useReducer } from "react";
import axios from "axios";
import type { ActionFunctionAny } from "redux-actions";
import { getAxiosInstace } from "@/utils/axiosInstance";
import {
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
  setPrimaryContactError,
  setPrimaryContactPending,
  setPrimaryContactSuccess,
  updateContactError,
  updateContactPending,
  updateContactSuccess,
} from "./actions";
import type {
  ContactQuery,
  CreateContactDto,
  IContactStateContext,
  UpdateContactDto,
} from "./context";
import {
  ContactActionContext,
  ContactStateContext,
  INITIAL_STATE,
} from "./context";
import { ContactReducer } from "./reducer";

const BASE_URL = "/api/Contacts";

const buildQueryString = (query?: ContactQuery) => {
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

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(ContactReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const handleError = (
    err: unknown,
    fallback: ActionFunctionAny<IContactStateContext>,
  ) => {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.detail ?? err.response?.data?.title ?? err.message
      : "Request failed.";
    dispatch(fallback(message));
    return message;
  };

  const getContact = async (id: string) => {
    dispatch(getContactPending());
    try {
      const { data } = await instance.get(`${BASE_URL}/${id}`);
      dispatch(getContactSuccess(data));
    } catch (err) {
      handleError(err, getContactError);
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
          }),
        );
      } else {
        dispatch(
          getContactsSuccess({
            items: Array.isArray(data) ? data : [],
          }),
        );
      }
    } catch (err) {
      handleError(err, getContactsError);
    }
  };

  const createContact = async (payload: CreateContactDto): Promise<boolean> => {
    dispatch(createContactPending());
    try {
      const { data } = await instance.post(BASE_URL, payload);
      dispatch(createContactSuccess(data));
      return true;
    } catch (err) {
      handleError(err, createContactError);
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
      handleError(err, updateContactError);
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
      handleError(err, deleteContactError);
      return false;
    }
  };

  const setPrimaryContact = async (id: string): Promise<boolean> => {
    dispatch(setPrimaryContactPending());
    try {
      const { data } = await instance.put(`${BASE_URL}/${id}/set-primary`);
      dispatch(setPrimaryContactSuccess(data));
      return true;
    } catch (err) {
      handleError(err, setPrimaryContactError);
      return false;
    }
  };

  return (
    <ContactStateContext.Provider value={state}>
      <ContactActionContext.Provider
        value={{
          getContact,
          getContacts,
          createContact,
          updateContact,
          deleteContact,
          setPrimaryContact,
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
