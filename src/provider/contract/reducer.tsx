import { handleActions } from "redux-actions";
import type { IContractStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ContractActionEnums } from "./actions";

export const ContractReducer = handleActions<IContractStateContext, IContractStateContext>(
  {
    [ContractActionEnums.getContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.getContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts
        ? state.contracts.map((c) =>
            c.id === action.payload?.contract?.id ? action.payload.contract! : c,
          )
        : state.contracts,
    }),
    [ContractActionEnums.getContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.getContractsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.getContractsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.getContractsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.createContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.createContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts
        ? [...state.contracts, action.payload.contract!]
        : [action.payload.contract!],
    }),
    [ContractActionEnums.createContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.updateContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.updateContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts
        ? state.contracts.map((c) =>
            c.id === action.payload?.contract?.id ? action.payload.contract! : c,
          )
        : state.contracts,
    }),
    [ContractActionEnums.updateContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.activateContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.activateContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts
        ? state.contracts.map((c) =>
            c.id === action.payload?.contract?.id ? action.payload.contract! : c,
          )
        : state.contracts,
    }),
    [ContractActionEnums.activateContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.cancelContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.cancelContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts
        ? state.contracts.map((c) =>
            c.id === action.payload?.contract?.id ? action.payload.contract! : c,
          )
        : state.contracts,
    }),
    [ContractActionEnums.cancelContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractActionEnums.deleteContractPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContractActionEnums.deleteContractSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contracts: state.contracts?.filter(
        (c) => c.id !== (action.payload as IContractStateContext & { id?: string }).id,
      ),
      contract: undefined,
    }),
    [ContractActionEnums.deleteContractError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
