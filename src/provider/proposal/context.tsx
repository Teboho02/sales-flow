import { createContext } from "react";

export interface IProposal {
  id: string;
  proposalNumber: string | null;
  opportunityId: string;
  opportunityTitle: string | null;
  clientId: string;
  clientName: string | null;
  title: string | null;
  description: string | null;
  status: number;
  statusName: string | null;
  totalAmount: number;
  currency: string | null;
  validUntil: string | null;
  submittedDate: string | null;
  approvedDate: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  lineItemsCount: number;
}

export interface CreateProposalDto {
  opportunityId: string;
  clientId: string;
  title: string;
  description?: string;
  currency?: string;
  validUntil?: string;
}

export interface UpdateProposalDto {
  title?: string;
  description?: string;
  currency?: string;
  validUntil?: string;
}

export interface ProposalQuery {
  pageNumber?: number;
  pageSize?: number;
  opportunityId?: string;
  clientId?: string;
  status?: number;
  searchTerm?: string;
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

export interface IProposalStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  proposal?: IProposal;
  proposals?: IProposal[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IProposalActionContext {
  getProposal: (id: string) => Promise<void>;
  getProposals: (query?: ProposalQuery) => Promise<void>;
  createProposal: (payload: CreateProposalDto) => Promise<boolean>;
  updateProposal: (id: string, payload: UpdateProposalDto) => Promise<boolean>;
  deleteProposal: (id: string) => Promise<boolean>;
  submitProposal: (id: string) => Promise<boolean>;
  approveProposal: (id: string) => Promise<boolean>;
  rejectProposal: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IProposalStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IProposalActionContext = {
  getProposal: async () => {},
  getProposals: async () => {},
  createProposal: async () => false,
  updateProposal: async () => false,
  deleteProposal: async () => false,
  submitProposal: async () => false,
  approveProposal: async () => false,
  rejectProposal: async () => false,
};

export const ProposalStateContext = createContext<IProposalStateContext>(INITIAL_STATE);
export const ProposalActionContext =
  createContext<IProposalActionContext | undefined>(undefined);
