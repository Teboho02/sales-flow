import { createAction } from "redux-actions";
import type { IProposal, IProposalStateContext } from "./context";

export enum ProposalActionEnums {
  getProposalPending = "GET_PROPOSAL_PENDING",
  getProposalSuccess = "GET_PROPOSAL_SUCCESS",
  getProposalError = "GET_PROPOSAL_ERROR",

  getProposalsPending = "GET_PROPOSALS_PENDING",
  getProposalsSuccess = "GET_PROPOSALS_SUCCESS",
  getProposalsError = "GET_PROPOSALS_ERROR",

  createProposalPending = "CREATE_PROPOSAL_PENDING",
  createProposalSuccess = "CREATE_PROPOSAL_SUCCESS",
  createProposalError = "CREATE_PROPOSAL_ERROR",

  updateProposalPending = "UPDATE_PROPOSAL_PENDING",
  updateProposalSuccess = "UPDATE_PROPOSAL_SUCCESS",
  updateProposalError = "UPDATE_PROPOSAL_ERROR",

  deleteProposalPending = "DELETE_PROPOSAL_PENDING",
  deleteProposalSuccess = "DELETE_PROPOSAL_SUCCESS",
  deleteProposalError = "DELETE_PROPOSAL_ERROR",

  submitProposalPending = "SUBMIT_PROPOSAL_PENDING",
  submitProposalSuccess = "SUBMIT_PROPOSAL_SUCCESS",
  submitProposalError = "SUBMIT_PROPOSAL_ERROR",

  approveProposalPending = "APPROVE_PROPOSAL_PENDING",
  approveProposalSuccess = "APPROVE_PROPOSAL_SUCCESS",
  approveProposalError = "APPROVE_PROPOSAL_ERROR",

  rejectProposalPending = "REJECT_PROPOSAL_PENDING",
  rejectProposalSuccess = "REJECT_PROPOSAL_SUCCESS",
  rejectProposalError = "REJECT_PROPOSAL_ERROR",
}

const pendingState: IProposalStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IProposalStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.getProposalPending,
  () => pendingState,
);

export const getProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.getProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const getProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.getProposalError,
  (message?: string) => errorState(message),
);

export const getProposalsPending = createAction<IProposalStateContext>(
  ProposalActionEnums.getProposalsPending,
  () => pendingState,
);

export const getProposalsSuccess = createAction<
  IProposalStateContext,
  {
    items: IProposal[];
    pageNumber?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  }
>(ProposalActionEnums.getProposalsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  proposals: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getProposalsError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.getProposalsError,
  (message?: string) => errorState(message),
);

export const createProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.createProposalPending,
  () => pendingState,
);

export const createProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.createProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const createProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.createProposalError,
  (message?: string) => errorState(message),
);

export const updateProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.updateProposalPending,
  () => pendingState,
);

export const updateProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.updateProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const updateProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.updateProposalError,
  (message?: string) => errorState(message),
);

export const deleteProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.deleteProposalPending,
  () => pendingState,
);

export const deleteProposalSuccess = createAction<IProposalStateContext & { id: string }, string>(
  ProposalActionEnums.deleteProposalSuccess,
  (id) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal: undefined,
    id,
  }),
);

export const deleteProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.deleteProposalError,
  (message?: string) => errorState(message),
);

export const submitProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.submitProposalPending,
  () => pendingState,
);

export const submitProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.submitProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const submitProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.submitProposalError,
  (message?: string) => errorState(message),
);

export const approveProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.approveProposalPending,
  () => pendingState,
);

export const approveProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.approveProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const approveProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.approveProposalError,
  (message?: string) => errorState(message),
);

export const rejectProposalPending = createAction<IProposalStateContext>(
  ProposalActionEnums.rejectProposalPending,
  () => pendingState,
);

export const rejectProposalSuccess = createAction<IProposalStateContext, IProposal>(
  ProposalActionEnums.rejectProposalSuccess,
  (proposal) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    proposal,
  }),
);

export const rejectProposalError = createAction<IProposalStateContext, string | undefined>(
  ProposalActionEnums.rejectProposalError,
  (message?: string) => errorState(message),
);
