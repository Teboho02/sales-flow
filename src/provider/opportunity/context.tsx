import { createContext } from "react";

export interface IOpportunity {
  id: string;
  title: string | null;
  clientId: string;
  clientName: string | null;
  contactId: string | null;
  contactName: string | null;
  ownerId: string;
  ownerName: string | null;
  estimatedValue: number;
  currency: string | null;
  probability: number;
  stage: number;
  stageName: string | null;
  source: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  description: string | null;
  lossReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface IOpportunityStageHistory {
  id: string;
  opportunityId: string;
  fromStage: number;
  fromStageName: string | null;
  toStage: number;
  toStageName: string | null;
  changedById: string;
  changedByName: string | null;
  changedAt: string;
  notes: string | null;
}

export interface IStageMetrics {
  stage: number;
  stageName: string | null;
  count: number;
  totalValue: number;
  weightedValue: number;
}

export interface IPipelineMetrics {
  stageMetrics: {
    Lead: IStageMetrics;
    Qualified: IStageMetrics;
    Proposal: IStageMetrics;
    Negotiation: IStageMetrics;
    ClosedWon: IStageMetrics;
    ClosedLost: IStageMetrics;
  };
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalOpportunities: number;
  activeOpportunities: number;
  averageDealSize: number;
  winRate: number;
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

export interface CreateOpportunityDto {
  title: string;
  clientId: string;
  contactId?: string;
  estimatedValue: number;
  currency?: string;
  probability: number;
  source: number;
  expectedCloseDate?: string;
  description?: string;
}

export interface UpdateOpportunityDto {
  title?: string;
  contactId?: string;
  estimatedValue?: number;
  currency?: string;
  probability?: number;
  source?: number;
  expectedCloseDate?: string;
  description?: string;
}

export interface UpdateStageDto {
  newStage: number;
  notes?: string;
  lossReason?: string;
}

export interface AssignOpportunityDto {
  userId: string;
}

export interface OpportunityQuery {
  pageNumber?: number;
  pageSize?: number;
  stage?: number;
  clientId?: string;
  ownerId?: string;
  searchTerm?: string;
  isActive?: boolean;
}

export interface IOpportunityStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  opportunity?: IOpportunity;
  opportunities?: IOpportunity[];
  pipelineMetrics?: IPipelineMetrics;
  stageHistory?: IOpportunityStageHistory[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IOpportunityActionContext {
  getOpportunity: (id: string) => Promise<void>;
  getOpportunities: (query?: OpportunityQuery) => Promise<void>;
  createOpportunity: (payload: CreateOpportunityDto) => Promise<boolean>;
  updateOpportunity: (id: string, payload: UpdateOpportunityDto) => Promise<boolean>;
  deleteOpportunity: (id: string) => Promise<boolean>;
  updateStage: (id: string, payload: UpdateStageDto) => Promise<boolean>;
  assignOpportunity: (id: string, payload: AssignOpportunityDto) => Promise<boolean>;
  getStageHistory: (id: string) => Promise<void>;
  getPipelineMetrics: (ownerId?: string) => Promise<void>;
}

export const INITIAL_STATE: IOpportunityStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IOpportunityActionContext = {
  getOpportunity: async () => {},
  getOpportunities: async () => {},
  createOpportunity: async () => false,
  updateOpportunity: async () => false,
  deleteOpportunity: async () => false,
  updateStage: async () => false,
  assignOpportunity: async () => false,
  getStageHistory: async () => {},
  getPipelineMetrics: async () => {},
};

export const OpportunityStateContext =
  createContext<IOpportunityStateContext>(INITIAL_STATE);

export const OpportunityActionContext =
  createContext<IOpportunityActionContext | undefined>(undefined);
