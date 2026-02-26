import { createContext } from "react";

export interface OpportunitiesReportItem {
  stage: number;
  stageName: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  count: number;
  totalValue: number;
  weightedValue?: number;
}

export interface SalesByPeriodItem {
  period: string; // e.g. "2026-02" or "2026-W09"
  value: number;
}

export interface OpportunitiesReportQuery {
  startDate: string;
  endDate: string;
  stage?: number;
  ownerId?: string;
}

export interface SalesByPeriodQuery {
  startDate: string;
  endDate: string;
  groupBy: "month" | "week";
}

export interface IReportStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  opportunitiesReport?: OpportunitiesReportItem[];
  salesByPeriod?: SalesByPeriodItem[];
}

export interface IReportActionContext {
  getOpportunitiesReport: (filters: OpportunitiesReportQuery) => Promise<void>;
  getSalesByPeriod: (filters: SalesByPeriodQuery) => Promise<void>;
}

export const INITIAL_STATE: IReportStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IReportActionContext = {
  getOpportunitiesReport: async () => {},
  getSalesByPeriod: async () => {},
};

export const ReportStateContext = createContext<IReportStateContext>(INITIAL_STATE);
export const ReportActionContext =
  createContext<IReportActionContext | undefined>(undefined);
