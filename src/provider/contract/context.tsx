import { createContext } from "react";

export interface IContract {
  id: string;
  contractNumber: string | null;
  clientId: string;
  clientName: string | null;
  opportunityId: string | null;
  opportunityTitle: string | null;
  proposalId: string | null;
  proposalNumber: string | null;
  title: string | null;
  contractValue: number;
  currency: string | null;
  startDate: string;
  endDate: string;
  status: number;
  statusName: string | null;
  renewalNoticePeriod: number;
  autoRenew: boolean;
  terms: string | null;
  ownerId: string;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  renewalsCount: number;
}

export interface CreateContractDto {
  clientId: string;
  opportunityId?: string;
  proposalId?: string;
  title: string;
  contractValue: number;
  currency?: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  renewalNoticePeriod: number;
  autoRenew: boolean;
  terms?: string;
}

export interface UpdateContractDto {
  title?: string;
  contractValue?: number;
  currency?: string;
  endDate?: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
  ownerId?: string;
}

export interface ContractQuery {
  pageNumber?: number;
  pageSize?: number;
  clientId?: string;
  ownerId?: string;
  status?: number;
}

export interface ExpiringQuery {
  daysUntilExpiry?: number;
}

export interface IContractStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  contract?: IContract;
  contracts?: IContract[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IContractActionContext {
  getContract: (id: string) => Promise<void>;
  getContracts: (query?: ContractQuery) => Promise<void>;
  getExpiringContracts: (query?: ExpiringQuery) => Promise<void>;
  createContract: (payload: CreateContractDto) => Promise<boolean>;
  updateContract: (id: string, payload: UpdateContractDto) => Promise<boolean>;
  deleteContract: (id: string) => Promise<boolean>;
  activateContract: (id: string) => Promise<boolean>;
  cancelContract: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IContractStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IContractActionContext = {
  getContract: async () => {},
  getContracts: async () => {},
  getExpiringContracts: async () => {},
  createContract: async () => false,
  updateContract: async () => false,
  deleteContract: async () => false,
  activateContract: async () => false,
  cancelContract: async () => false,
};

export const ContractStateContext = createContext<IContractStateContext>(INITIAL_STATE);
export const ContractActionContext =
  createContext<IContractActionContext | undefined>(undefined);
