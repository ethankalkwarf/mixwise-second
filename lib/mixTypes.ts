/**
 * Types for the Mix tool - unified types that work with Sanity data
 * Uses string IDs to be compatible with Sanity's _id field
 */

// Ingredient for the Mix tool (simplified from Sanity)
export type MixIngredient = {
  id: string;       // Sanity _id
  name: string;
  category: string; // type field from Sanity (spirit, liqueur, etc.)
  imageUrl?: string | null;
  isStaple?: boolean;
};

// Ingredient within a cocktail recipe
export type MixCocktailIngredient = {
  id: string;       // Sanity ingredient _id
  name: string;
  amount?: string | null;
  isOptional?: boolean;
  notes?: string | null;
};

// Cocktail for the Mix tool (simplified from Sanity)
export type MixCocktail = {
  id: string;       // Sanity _id
  name: string;
  slug: string;
  description?: string | null;
  instructions?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  glass?: string | null;
  method?: string | null;
  primarySpirit?: string | null;
  difficulty?: string | null;
  isPopular?: boolean;
  isFavorite?: boolean;
  isTrending?: boolean;
  drinkCategories?: string[];
  tags?: string[];
  garnish?: string | null;
  ingredients: MixCocktailIngredient[];
};

// Matching result
export type MixMatchResult = {
  cocktail: MixCocktail;
  score: number;
  missingIngredientIds: string[];
  missingIngredientNames: string[];
};

// Match groups
export type MixMatchGroups = {
  makeNow: MixMatchResult[];
  almostThere: MixMatchResult[];
  all: MixMatchResult[];
};

