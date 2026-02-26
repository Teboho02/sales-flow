import { handleActions } from "redux-actions";
import type { IClientStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ClientActionEnums } from "./actions";

export const ClientReducer = handleActions<IClientStateContext, IClientStateContext>(
  {
    [ClientActionEnums.getClientPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.getClientSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      clients: state.clients
        ? state.clients.map((c) =>
            c.id === action.payload?.client?.id ? action.payload.client! : c,
          )
        : state.clients,
    }),
    [ClientActionEnums.getClientError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientActionEnums.getClientsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.getClientsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.getClientsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientActionEnums.createClientPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.createClientSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      clients: state.clients
        ? [...state.clients, action.payload.client!]
        : [action.payload.client!],
    }),
    [ClientActionEnums.createClientError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientActionEnums.updateClientPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.updateClientSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      clients: state.clients
        ? state.clients.map((c) =>
            c.id === action.payload?.client?.id ? action.payload.client! : c,
          )
        : state.clients,
    }),
    [ClientActionEnums.updateClientError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientActionEnums.deleteClientPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.deleteClientSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      clients: state.clients?.filter((c) => c.id !== (action.payload as any).id),
      client: undefined,
    }),
    [ClientActionEnums.deleteClientError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientActionEnums.getClientStatsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.getClientStatsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ClientActionEnums.getClientStatsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
