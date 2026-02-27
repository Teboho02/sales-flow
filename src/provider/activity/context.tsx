import { createContext } from "react";

export interface IActivity {
  id: string;
  type: number;
  typeName: string | null;
  subject: string | null;
  description: string | null;
  relatedToType: number;
  relatedToTypeName: string | null;
  relatedToId: string;
  relatedToTitle: string | null;
  assignedToId: string;
  assignedToName: string | null;
  status: number;
  statusName: string | null;
  priority: number;
  priorityName: string | null;
  dueDate: string | null;
  completedDate: string | null;
  duration: number | null;
  location: string | null;
  outcome: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  participantsCount: number;
}

export interface CreateActivityDto {
  type: number;
  subject: string;
  description?: string;
  relatedToType: number;
  relatedToId: string;
  assignedToId: string;
  priority: number;
  dueDate?: string;
  duration?: number;
  location?: string;
}

export interface UpdateActivityDto {
  subject?: string;
  description?: string;
  assignedToId?: string;
  priority?: number;
  dueDate?: string;
  duration?: number;
  location?: string;
  outcome?: string;
}

export interface CompleteActivityDto {
  outcome?: string;
}

export interface ActivityQuery {
  pageNumber?: number;
  pageSize?: number;
  assignedToId?: string;
  type?: number;
  status?: number;
  relatedToType?: number;
  relatedToId?: string;
}

export interface IActivityStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  activity?: IActivity;
  activities?: IActivity[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface IActivityActionContext {
  getActivity: (id: string) => Promise<void>;
  getActivities: (query?: ActivityQuery) => Promise<void>;
  createActivity: (payload: CreateActivityDto) => Promise<boolean>;
  updateActivity: (id: string, payload: UpdateActivityDto) => Promise<boolean>;
  deleteActivity: (id: string) => Promise<boolean>;
  completeActivity: (id: string, payload?: CompleteActivityDto) => Promise<boolean>;
  cancelActivity: (id: string) => Promise<boolean>;
}

export const INITIAL_STATE: IActivityStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IActivityActionContext = {
  getActivity: async () => {},
  getActivities: async () => {},
  createActivity: async () => false,
  updateActivity: async () => false,
  deleteActivity: async () => false,
  completeActivity: async () => false,
  cancelActivity: async () => false,
};

export const ActivityStateContext =
  createContext<IActivityStateContext>(INITIAL_STATE);

export const ActivityActionContext =
  createContext<IActivityActionContext | undefined>(undefined);
