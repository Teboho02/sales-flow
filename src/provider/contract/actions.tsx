import { createAction } from "redux-actions";
import type { IContract, IContractStateContext } from "./context";

export enum ContractActionEnums {
  getContractPending = "GET_CONTRACT_PENDING",
  getContractSuccess = "GET_CONTRACT_SUCCESS",
  getContractError = "GET_CONTRACT_ERROR",

  getContractsPending = "GET_CONTRACTS_PENDING",
  getContractsSuccess = "GET_CONTRACTS_SUCCESS",
  getContractsError = "GET_CONTRACTS_ERROR",

  createContractPending = "CREATE_CONTRACT_PENDING",
  createContractSuccess = "CREATE_CONTRACT_SUCCESS",
  createContractError = "CREATE_CONTRACT_ERROR",

  updateContractPending = "UPDATE_CONTRACT_PENDING",
  updateContractSuccess = "UPDATE_CONTRACT_SUCCESS",
  updateContractError = "UPDATE_CONTRACT_ERROR",

  deleteContractPending = "DELETE_CONTRACT_PENDING",
  deleteContractSuccess = "DELETE_CONTRACT_SUCCESS",
  deleteContractError = "DELETE_CONTRACT_ERROR",

  activateContractPending = "ACTIVATE_CONTRACT_PENDING",
  activateContractSuccess = "ACTIVATE_CONTRACT_SUCCESS",
  activateContractError = "ACTIVATE_CONTRACT_ERROR",

  cancelContractPending = "CANCEL_CONTRACT_PENDING",
  cancelContractSuccess = "CANCEL_CONTRACT_SUCCESS",
  cancelContractError = "CANCEL_CONTRACT_ERROR",
}

const pendingState: IContractStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
  errorMessage: undefined,
};

const errorState = (message?: string): IContractStateContext => ({
  isPending: false,
  isSuccess: false,
  isError: true,
  errorMessage: message,
});

export const getContractPending = createAction<IContractStateContext>(
  ContractActionEnums.getContractPending,
  () => pendingState,
);

export const getContractSuccess = createAction<IContractStateContext, IContract>(
  ContractActionEnums.getContractSuccess,
  (contract) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract,
  }),
);

export const getContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.getContractError,
  (message?: string) => errorState(message),
);

export const getContractsPending = createAction<IContractStateContext>(
  ContractActionEnums.getContractsPending,
  () => pendingState,
);

export const getContractsSuccess = createAction<
  IContractStateContext,
  { items: IContract[]; pageNumber?: number; pageSize?: number; totalCount?: number; totalPages?: number }
>(ContractActionEnums.getContractsSuccess, (payload) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  contracts: payload.items,
  pageNumber: payload.pageNumber,
  pageSize: payload.pageSize,
  totalCount: payload.totalCount,
  totalPages: payload.totalPages,
}));

export const getContractsError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.getContractsError,
  (message?: string) => errorState(message),
);

export const createContractPending = createAction<IContractStateContext>(
  ContractActionEnums.createContractPending,
  () => pendingState,
);

export const createContractSuccess = createAction<IContractStateContext, IContract>(
  ContractActionEnums.createContractSuccess,
  (contract) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract,
  }),
);

export const createContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.createContractError,
  (message?: string) => errorState(message),
);

export const updateContractPending = createAction<IContractStateContext>(
  ContractActionEnums.updateContractPending,
  () => pendingState,
);

export const updateContractSuccess = createAction<IContractStateContext, IContract>(
  ContractActionEnums.updateContractSuccess,
  (contract) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract,
  }),
);

export const updateContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.updateContractError,
  (message?: string) => errorState(message),
);

export const deleteContractPending = createAction<IContractStateContext>(
  ContractActionEnums.deleteContractPending,
  () => pendingState,
);

export const deleteContractSuccess = createAction<IContractStateContext & { id: string }, string>(
  ContractActionEnums.deleteContractSuccess,
  (id) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract: undefined,
    id,
  }),
);

export const deleteContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.deleteContractError,
  (message?: string) => errorState(message),
);

export const activateContractPending = createAction<IContractStateContext>(
  ContractActionEnums.activateContractPending,
  () => pendingState,
);

export const activateContractSuccess = createAction<IContractStateContext, IContract>(
  ContractActionEnums.activateContractSuccess,
  (contract) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract,
  }),
);

export const activateContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.activateContractError,
  (message?: string) => errorState(message),
);

export const cancelContractPending = createAction<IContractStateContext>(
  ContractActionEnums.cancelContractPending,
  () => pendingState,
);

export const cancelContractSuccess = createAction<IContractStateContext, IContract>(
  ContractActionEnums.cancelContractSuccess,
  (contract) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    contract,
  }),
);

export const cancelContractError = createAction<IContractStateContext, string | undefined>(
  ContractActionEnums.cancelContractError,
  (message?: string) => errorState(message),
);
