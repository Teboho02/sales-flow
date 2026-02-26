import { handleActions } from "redux-actions";
import { RecipeActionEnums } from "./actions";
import { INITIAL_STATE } from "./context";
import type { IRecipeStateContext } from "./context";

export const RecipeReducer = handleActions<
  IRecipeStateContext,
  IRecipeStateContext
>(
  {
    [RecipeActionEnums.getRecipePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.getRecipeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.getRecipeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [RecipeActionEnums.getRecipesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.getRecipesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.getRecipesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [RecipeActionEnums.createRecipePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.createRecipeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      recipes: state.recipes
        ? [...state.recipes, action.payload.recipe!]
        : action.payload.recipes ?? state.recipes,
    }),
    [RecipeActionEnums.createRecipeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [RecipeActionEnums.updateRecipePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.updateRecipeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      recipes: state.recipes?.map((recipe) =>
        recipe.id === action.payload.recipe!.id ? action.payload.recipe! : recipe,
      ),
    }),
    [RecipeActionEnums.updateRecipeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [RecipeActionEnums.deleteRecipePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [RecipeActionEnums.deleteRecipeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
      recipes: state.recipes?.filter(
        (recipe) =>
          recipe.id !==
          (action as { meta?: { id?: string } }).meta?.id,
      ),
      recipe: undefined,
    }),
    [RecipeActionEnums.deleteRecipeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
