import { createContext } from "react";

export interface IClient {
  id: string;
  name: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  billingAddress: string | null;
  taxNumber: string | null;
  clientType: number;
  isActive: boolean;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  contactsCount: number;
  opportunitiesCount: number;
  contractsCount: number;
}

export interface IClientStats {
  totalContacts: number;
  totalOpportunities: number;
  totalContracts: number;
  totalContractValue: number;
  activeOpportunities: number;
}

export interface CreateClientDto {
  name: string;
  industry?: string;
  companySize?: string;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
  clientType: number;
}

export interface UpdateClientDto {
  name?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
  clientType?: number;
  isActive?: boolean;
}

export interface ClientQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  industry?: string;
  clientType?: number;
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

export interface IClientStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  client?: IClient;
  clients?: IClient[];
  clientStats?: IClientStats;
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IClientActionContext {
  getClient: (id: string) => Promise<void>;
  getClients: (query?: ClientQuery) => Promise<void>;
  createClient: (payload: CreateClientDto) => Promise<boolean>;
  updateClient: (id: string, payload: UpdateClientDto) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  getClientStats: (id: string) => Promise<void>;
}

export const INITIAL_STATE: IClientStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IClientActionContext = {
  getClient: async () => {},
  getClients: async () => {},
  createClient: async () => false,
  updateClient: async () => false,
  deleteClient: async () => false,
  getClientStats: async () => {},
};

export const ClientStateContext = createContext<IClientStateContext>(INITIAL_STATE);
export const ClientActionContext =
  createContext<IClientActionContext | undefined>(undefined);
