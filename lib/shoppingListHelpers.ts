/**
 * Helper functions for shopping list operations
 * Extracts missing ingredients from cocktails based on user's bar
 */

import type { MixCocktail } from "./mixTypes";

export interface MissingIngredient {
  id: string;
  name: string;
  category?: string;
}

/**
 * Extract missing ingredients from a cocktail based on user's bar
 * Returns only required (non-optional) ingredients that are not in the user's bar
 */
export function getMissingIngredientsForCocktail(
  cocktail: MixCocktail,
  userBarIngredientIds: string[],
  stapleIngredientIds: string[] = []
): MissingIngredient[] {
  if (!cocktail.ingredients || cocktail.ingredients.length === 0) {
    return [];
  }

  const userBarSet = new Set(userBarIngredientIds);
  const staplesSet = new Set(stapleIngredientIds);

  const missing: MissingIngredient[] = [];

  for (const ingredient of cocktail.ingredients) {
    // Skip optional ingredients
    if (ingredient.isOptional) {
      continue;
    }

    // Skip ingredients user already has
    if (userBarSet.has(ingredient.id)) {
      continue;
    }

    // Skip staples (ice, water, etc.)
    if (staplesSet.has(ingredient.id)) {
      continue;
    }

    // Add missing ingredient
    missing.push({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
    });
  }

  return missing;
}

/**
 * Extract missing ingredients from multiple cocktails
 * Returns a deduplicated list of all missing ingredients
 */
export function getMissingIngredientsForCocktails(
  cocktails: MixCocktail[],
  userBarIngredientIds: string[],
  stapleIngredientIds: string[] = []
): MissingIngredient[] {
  const ingredientMap = new Map<string, MissingIngredient>();

  for (const cocktail of cocktails) {
    const missing = getMissingIngredientsForCocktail(
      cocktail,
      userBarIngredientIds,
      stapleIngredientIds
    );

    for (const ing of missing) {
      // Deduplicate by ID
      if (!ingredientMap.has(ing.id)) {
        ingredientMap.set(ing.id, ing);
      }
    }
  }

  return Array.from(ingredientMap.values());
}








