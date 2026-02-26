import { createContext } from "react";

export interface IPricingRequest {
  id: string;
  title: string | null;
  description: string | null;
  status: number;
  statusName: string | null;
  priority: number;
  dueDate: string | null;
  opportunityId: string | null;
  opportunityTitle: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRequestDto {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string;
  opportunityId?: string;
}

export interface UpdatePricingRequestDto {
  title?: string;
  description?: string;
  priority?: number;
  dueDate?: string;
}

export interface AssignPricingRequestDto {
  userId: string;
}

export interface PricingRequestQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: number;
  priority?: number;
  assignedToId?: string;
  opportunityId?: string;
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

export interface IPricingRequestStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  request?: IPricingRequest;
  requests?: IPricingRequest[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IPricingRequestActionContext {
  getRequest: (id: string) => Promise<void>;
  getRequests: (query?: PricingRequestQuery) => Promise<void>;
  getMyRequests: () => Promise<void>;
  getPendingRequests: () => Promise<void>;
  createRequest: (payload: CreatePricingRequestDto) => Promise<boolean>;
  updateRequest: (id: string, payload: UpdatePricingRequestDto) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  assignRequest: (id: string, payload: AssignPricingRequestDto) => Promise<boolean>;
  completeRequest: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IPricingRequestStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IPricingRequestActionContext = {
  getRequest: async () => {},
  getRequests: async () => {},
  getMyRequests: async () => {},
  getPendingRequests: async () => {},
  createRequest: async () => false,
  updateRequest: async () => false,
  deleteRequest: async () => false,
  assignRequest: async () => false,
  completeRequest: async () => false,
};

export const PricingRequestStateContext =
  createContext<IPricingRequestStateContext>(INITIAL_STATE);

export const PricingRequestActionContext =
  createContext<IPricingRequestActionContext | undefined>(undefined);
