import { handleActions } from "redux-actions";
import type { IContactStateContext } from "./context";
import { INITIAL_STATE } from "./context";
import { ContactActionEnums } from "./actions";

export const ContactReducer = handleActions<IContactStateContext, IContactStateContext>(
  {
    [ContactActionEnums.getContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.getContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts
        ? state.contacts.map((c) =>
            c.id === action.payload?.contact?.id ? action.payload.contact! : c,
          )
        : state.contacts,
    }),
    [ContactActionEnums.getContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.getContactsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.getContactsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.getContactsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.createContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.createContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts
        ? [...state.contacts, action.payload.contact!]
        : [action.payload.contact!],
    }),
    [ContactActionEnums.createContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.updateContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.updateContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts
        ? state.contacts.map((c) =>
            c.id === action.payload?.contact?.id ? action.payload.contact! : c,
          )
        : state.contacts,
    }),
    [ContactActionEnums.updateContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.deleteContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.deleteContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts?.filter(
        (c) => c.id !== (action.payload as IContactStateContext & { id?: string }).id,
      ),
      contact: undefined,
    }),
    [ContactActionEnums.deleteContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.setPrimaryContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.setPrimaryContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts
        ? state.contacts.map((c) =>
            c.clientId === action.payload?.contact?.clientId
              ? {
                  ...c,
                  isPrimary: c.id === action.payload.contact!.id,
                }
              : c,
          )
        : state.contacts,
    }),
    [ContactActionEnums.setPrimaryContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
