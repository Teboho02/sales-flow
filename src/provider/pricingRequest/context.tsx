import { createContext } from "react";

export interface IPricingRequest {
  id: string;
  opportunityId: string;
  opportunityTitle: string | null;
  requestNumber: string | null;
  title: string | null;
  description: string | null;
  requestedById: string;
  requestedByName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  status: number;
  statusName: string | null;
  priority: number;
  priorityName: string | null;
  requestedDate: string;
  requiredByDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRequestDto {
  opportunityId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  priority: number;
  requiredByDate?: string;
}

export interface UpdatePricingRequestDto {
  title?: string;
  description?: string;
  priority?: number;
  requiredByDate?: string;
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
  pricingRequest?: IPricingRequest;
  pricingRequests?: IPricingRequest[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IPricingRequestActionContext {
  getPricingRequest: (id: string) => Promise<void>;
  getPricingRequests: (query?: PricingRequestQuery) => Promise<void>;
  getMyPricingRequests: (query?: PricingRequestQuery) => Promise<void>;
  createPricingRequest: (payload: CreatePricingRequestDto) => Promise<boolean>;
  updatePricingRequest: (id: string, payload: UpdatePricingRequestDto) => Promise<boolean>;
  deletePricingRequest: (id: string) => Promise<boolean>;
  assignPricingRequest: (id: string, payload: AssignPricingRequestDto) => Promise<boolean>;
  completePricingRequest: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IPricingRequestStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IPricingRequestActionContext = {
  getPricingRequest: async () => {},
  getPricingRequests: async () => {},
  getMyPricingRequests: async () => {},
  createPricingRequest: async () => false,
  updatePricingRequest: async () => false,
  deletePricingRequest: async () => false,
  assignPricingRequest: async () => false,
  completePricingRequest: async () => false,
};

export const PricingRequestStateContext =
  createContext<IPricingRequestStateContext>(INITIAL_STATE);
export const PricingRequestActionContext =
  createContext<IPricingRequestActionContext | undefined>(undefined);
