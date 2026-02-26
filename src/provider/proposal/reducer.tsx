import { handleActions } from "redux-actions";
import type { IProposalStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ProposalActionEnums } from "./actions";

export const ProposalReducer = handleActions<IProposalStateContext, IProposalStateContext>(
  {
    [ProposalActionEnums.getProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.getProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? state.proposals.map((p) =>
            p.id === action.payload?.proposal?.id ? action.payload.proposal! : p,
          )
        : state.proposals,
    }),
    [ProposalActionEnums.getProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.getProposalsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.getProposalsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.getProposalsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.createProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.createProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? [...state.proposals, action.payload.proposal!]
        : [action.payload.proposal!],
    }),
    [ProposalActionEnums.createProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.updateProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.updateProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? state.proposals.map((p) =>
            p.id === action.payload?.proposal?.id ? action.payload.proposal! : p,
          )
        : state.proposals,
    }),
    [ProposalActionEnums.updateProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.submitProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.submitProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? state.proposals.map((p) =>
            p.id === action.payload?.proposal?.id ? action.payload.proposal! : p,
          )
        : state.proposals,
    }),
    [ProposalActionEnums.submitProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.approveProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.approveProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? state.proposals.map((p) =>
            p.id === action.payload?.proposal?.id ? action.payload.proposal! : p,
          )
        : state.proposals,
    }),
    [ProposalActionEnums.approveProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.rejectProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.rejectProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals
        ? state.proposals.map((p) =>
            p.id === action.payload?.proposal?.id ? action.payload.proposal! : p,
          )
        : state.proposals,
    }),
    [ProposalActionEnums.rejectProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalActionEnums.deleteProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ProposalActionEnums.deleteProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      proposals: state.proposals?.filter(
        (p) => p.id !== (action.payload as IProposalStateContext & { id?: string }).id,
      ),
      proposal: undefined,
    }),
    [ProposalActionEnums.deleteProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
