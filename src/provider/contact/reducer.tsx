import { handleActions } from "redux-actions";
import { ContactActionEnums } from "./actions";
import { INITIAL_STATE } from "./context";
import type { IContactStateContext } from "./context";

export const ContactReducer = handleActions<IContactStateContext, IContactStateContext>(
  {
    [ContactActionEnums.getContactPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.getContactSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
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
      contacts: state.contacts ? [...state.contacts, action.payload.contact!] : state.contacts,
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
      contacts: state.contacts?.map((c) =>
        c.id === action.payload.contact?.id ? action.payload.contact : c,
      ),
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
      contacts: state.contacts?.filter((c) => {
        const deletedId =
          (action.payload as unknown as { id?: string })?.id ??
          (action.payload as unknown as string | undefined);
        return c.id !== deletedId;
      }),
      contact: undefined,
    }),
    [ContactActionEnums.deleteContactError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactActionEnums.setPrimaryPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ContactActionEnums.setPrimarySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      contacts: state.contacts?.map((c) =>
        c.id === action.payload.contact?.id
          ? { ...c, isPrimary: true }
          : { ...c, isPrimary: false },
      ),
    }),
    [ContactActionEnums.setPrimaryError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
