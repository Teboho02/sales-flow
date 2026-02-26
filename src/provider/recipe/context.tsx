import { createContext } from "react";

export interface IRecipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  rating?: number;
}

export interface IRecipeStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  recipe?: IRecipe;
  recipes?: IRecipe[];
}

export interface IRecipeActionContext {
  getRecipe: (id: string) => Promise<void>;
  getRecipes: () => Promise<void>;
  createRecipe: (recipe: Omit<IRecipe, "id">) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<IRecipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

export const INITIAL_STATE: IRecipeStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
};

export const INITIAL_ACTION_STATE: IRecipeActionContext = {
  getRecipe: async () => {},
  getRecipes: async () => {},
  createRecipe: async () => {},
  updateRecipe: async () => {},
  deleteRecipe: async () => {},
};

export const RecipeStateContext =
  createContext<IRecipeStateContext>(INITIAL_STATE);

export const RecipeActionContext =
  createContext<IRecipeActionContext | undefined>(undefined);
