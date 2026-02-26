import { createContext } from "react";

export interface IContact {
  id: string;
  clientId: string;
  clientName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle?: string;
  isPrimary?: boolean;
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface ContactQuery {
  pageNumber?: number;
  pageSize?: number;
  clientId?: string;
  searchTerm?: string;
  isActive?: boolean;
}

export interface IPagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IContactStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  contact?: IContact;
  contacts?: IContact[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IContactActionContext {
  getContact: (id: string) => Promise<void>;
  getContacts: (query?: ContactQuery) => Promise<void>;
  getContactsByClient: (clientId: string) => Promise<void>;
  createContact: (payload: CreateContactDto) => Promise<boolean>;
  updateContact: (id: string, payload: UpdateContactDto) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  setPrimary: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IContactStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IContactActionContext = {
  getContact: async () => {},
  getContacts: async () => {},
  getContactsByClient: async () => {},
  createContact: async () => false,
  updateContact: async () => false,
  deleteContact: async () => false,
  setPrimary: async () => false,
};

export const ContactStateContext = createContext<IContactStateContext>(INITIAL_STATE);

export const ContactActionContext = createContext<IContactActionContext | undefined>(undefined);
