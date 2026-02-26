import { createContext } from "react";

export interface IContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  clientId: string;
  clientName: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  jobTitle?: string;
  clientId: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
  clientId?: string;
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
  createContact: (payload: CreateContactDto) => Promise<boolean>;
  updateContact: (id: string, payload: UpdateContactDto) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  setPrimaryContact: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IContactStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IContactActionContext = {
  getContact: async () => {},
  getContacts: async () => {},
  createContact: async () => false,
  updateContact: async () => false,
  deleteContact: async () => false,
  setPrimaryContact: async () => false,
};

export const ContactStateContext = createContext<IContactStateContext>(INITIAL_STATE);
export const ContactActionContext =
  createContext<IContactActionContext | undefined>(undefined);
