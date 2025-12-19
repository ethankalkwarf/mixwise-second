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
  id: string;       // String ingredient ID from ingredients table
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
  ingredients: MixCocktailIngredient[]; // Now uses numeric IDs
};

// Matching result
export type MixMatchResult = {
  cocktail: MixCocktail;
  score: number; // Legacy field, kept for compatibility
  missingRequiredIngredientIds: string[];
  missingIngredientIds: string[]; // Legacy field, kept for compatibility
  missingIngredientNames: string[]; // Legacy field, kept for compatibility
  missingCount: number; // Number of missing required ingredients
  matchPercent: number; // Percentage of required ingredients owned (0-1)
};

// Match groups
export type MixMatchGroups = {
  ready: MixMatchResult[]; // Previously makeNow
  almostThere: MixMatchResult[];
  far: MixMatchResult[]; // Previously unused "all" group
  makeNow?: MixMatchResult[]; // Legacy alias for backward compatibility
};

