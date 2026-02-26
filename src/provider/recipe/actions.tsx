import { createAction } from "redux-actions";
import type { IRecipe, IRecipeStateContext } from "./context";

export enum RecipeActionEnums {
  getRecipePending = "GET_RECIPE_PENDING",
  getRecipeSuccess = "GET_RECIPE_SUCCESS",
  getRecipeError = "GET_RECIPE_ERROR",

  getRecipesPending = "GET_RECIPES_PENDING",
  getRecipesSuccess = "GET_RECIPES_SUCCESS",
  getRecipesError = "GET_RECIPES_ERROR",

  createRecipePending = "CREATE_RECIPE_PENDING",
  createRecipeSuccess = "CREATE_RECIPE_SUCCESS",
  createRecipeError = "CREATE_RECIPE_ERROR",

  updateRecipePending = "UPDATE_RECIPE_PENDING",
  updateRecipeSuccess = "UPDATE_RECIPE_SUCCESS",
  updateRecipeError = "UPDATE_RECIPE_ERROR",

  deleteRecipePending = "DELETE_RECIPE_PENDING",
  deleteRecipeSuccess = "DELETE_RECIPE_SUCCESS",
  deleteRecipeError = "DELETE_RECIPE_ERROR",
}

const pendingState: IRecipeStateContext = {
  isPending: true,
  isSuccess: false,
  isError: false,
};

const errorState: IRecipeStateContext = {
  isPending: false,
  isSuccess: false,
  isError: true,
};

export const getRecipePending = createAction<IRecipeStateContext>(
  RecipeActionEnums.getRecipePending,
  () => pendingState,
);

export const getRecipeSuccess = createAction<IRecipeStateContext, IRecipe>(
  RecipeActionEnums.getRecipeSuccess,
  (recipe: IRecipe) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    recipe,
  }),
);

export const getRecipeError = createAction<IRecipeStateContext>(
  RecipeActionEnums.getRecipeError,
  () => errorState,
);

export const getRecipesPending = createAction<IRecipeStateContext>(
  RecipeActionEnums.getRecipesPending,
  () => pendingState,
);

export const getRecipesSuccess = createAction<IRecipeStateContext, IRecipe[]>(
  RecipeActionEnums.getRecipesSuccess,
  (recipes: IRecipe[]) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    recipes,
  }),
);

export const getRecipesError = createAction<IRecipeStateContext>(
  RecipeActionEnums.getRecipesError,
  () => errorState,
);

export const createRecipePending = createAction<IRecipeStateContext>(
  RecipeActionEnums.createRecipePending,
  () => pendingState,
);

export const createRecipeSuccess = createAction<IRecipeStateContext, IRecipe>(
  RecipeActionEnums.createRecipeSuccess,
  (recipe: IRecipe) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    recipe,
  }),
);

export const createRecipeError = createAction<IRecipeStateContext>(
  RecipeActionEnums.createRecipeError,
  () => errorState,
);

export const updateRecipePending = createAction<IRecipeStateContext>(
  RecipeActionEnums.updateRecipePending,
  () => pendingState,
);

export const updateRecipeSuccess = createAction<IRecipeStateContext, IRecipe>(
  RecipeActionEnums.updateRecipeSuccess,
  (recipe: IRecipe) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    recipe,
  }),
);

export const updateRecipeError = createAction<IRecipeStateContext>(
  RecipeActionEnums.updateRecipeError,
  () => errorState,
);

export const deleteRecipePending = createAction<IRecipeStateContext>(
  RecipeActionEnums.deleteRecipePending,
  () => pendingState,
);

export const deleteRecipeSuccess = createAction<
  IRecipeStateContext,
  string,
  { id: string }
>(
  RecipeActionEnums.deleteRecipeSuccess,
  () => ({
    isPending: false,
    isSuccess: true,
    isError: false,
  }),
  (id: string) => ({ id }),
);

export const deleteRecipeError = createAction<IRecipeStateContext>(
  RecipeActionEnums.deleteRecipeError,
  () => errorState,
);
