"use client";

import { useContext, useReducer } from "react";
import { getAxiosInstace } from "../../utils/axiosInstance";
import {
  createRecipeError,
  createRecipePending,
  createRecipeSuccess,
  deleteRecipeError,
  deleteRecipePending,
  deleteRecipeSuccess,
  getRecipeError,
  getRecipePending,
  getRecipeSuccess,
  getRecipesError,
  getRecipesPending,
  getRecipesSuccess,
  updateRecipeError,
  updateRecipePending,
  updateRecipeSuccess,
} from "./actions";
import type { IRecipe } from "./context";
import { INITIAL_STATE, RecipeActionContext, RecipeStateContext } from "./context";
import { RecipeReducer } from "./reducer";

const BASE_URL = "/recipes";

const extractRecipe = (data: unknown): IRecipe | undefined => {
  if (!data) {
    return undefined;
  }

  if (typeof data === "object" && "recipe" in data) {
    const recipe = (data as { recipe?: IRecipe }).recipe;
    return recipe ?? undefined;
  }

  return data as IRecipe;
};

const extractRecipes = (data: unknown): IRecipe[] => {
  if (Array.isArray(data)) {
    return data as IRecipe[];
  }

  if (data && typeof data === "object" && "recipes" in data) {
    const recipes = (data as { recipes?: IRecipe[] }).recipes;
    return Array.isArray(recipes) ? recipes : [];
  }

  return [];
};

export const RecipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(RecipeReducer, INITIAL_STATE);
  const instance = getAxiosInstace();

  const getRecipe = async (id: string) => {
    dispatch(getRecipePending());
    try {
      const response = await instance.get(`${BASE_URL}/${id}`);
      const recipe = extractRecipe(response.data);
      if (recipe) {
        dispatch(getRecipeSuccess(recipe));
      } else {
        dispatch(getRecipeError());
      }
    } catch (error) {
      console.error(error);
      dispatch(getRecipeError());
    }
  };

  const getRecipes = async () => {
    dispatch(getRecipesPending());
    try {
      const response = await instance.get(BASE_URL);
      dispatch(getRecipesSuccess(extractRecipes(response.data)));
    } catch (error) {
      console.error(error);
      dispatch(getRecipesError());
    }
  };

  const createRecipe = async (recipe: Omit<IRecipe, "id">) => {
    dispatch(createRecipePending());
    try {
      const response = await instance.post(BASE_URL, recipe);
      const created = extractRecipe(response.data);
      if (created) {
        dispatch(createRecipeSuccess(created));
      } else {
        dispatch(createRecipeError());
      }
    } catch (error) {
      console.error(error);
      dispatch(createRecipeError());
    }
  };

  const updateRecipe = async (id: string, recipe: Partial<IRecipe>) => {
    dispatch(updateRecipePending());
    try {
      const response = await instance.put(`${BASE_URL}/${id}`, recipe);
      const updated = extractRecipe(response.data);
      if (updated) {
        dispatch(updateRecipeSuccess(updated));
      } else {
        dispatch(updateRecipeError());
      }
    } catch (error) {
      console.error(error);
      dispatch(updateRecipeError());
    }
  };

  const deleteRecipe = async (id: string) => {
    dispatch(deleteRecipePending());
    try {
      await instance.delete(`${BASE_URL}/${id}`);
      dispatch(deleteRecipeSuccess(id));
    } catch (error) {
      console.error(error);
      dispatch(deleteRecipeError());
    }
  };

  return (
    <RecipeStateContext.Provider value={state}>
      <RecipeActionContext.Provider
        value={{
          getRecipe,
          getRecipes,
          createRecipe,
          updateRecipe,
          deleteRecipe,
        }}
      >
        {children}
      </RecipeActionContext.Provider>
    </RecipeStateContext.Provider>
  );
};

export const useRecipeState = () => {
  const context = useContext(RecipeStateContext);
  if (!context) {
    throw new Error("useRecipeState must be used within a RecipeProvider");
  }
  return context;
};

export const useRecipeActions = () => {
  const context = useContext(RecipeActionContext);
  if (!context) {
    throw new Error("useRecipeActions must be used within a RecipeProvider");
  }
  return context;
};
