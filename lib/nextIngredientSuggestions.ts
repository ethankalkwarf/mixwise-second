/**
 * Next Ingredient Suggestions for Mix Tool
 * Suggests ingredients to add to unlock more cocktails
 */

import type { MixCocktail } from "./mixTypes";

export type NextIngredientSuggestion = {
  ingredientId: string;
  unlockScore: number;
  unlocksMissing1Count: number; // Cocktails missing only this ingredient
  unlocksMissing2Count: number; // Cocktails missing this ingredient + 1 other
};

export type NextIngredientSuggestionsParams = {
  cocktails: MixCocktail[];
  ownedIngredientIds: string[];
  stapleIngredientIds?: string[];
  maxMissing?: number;
  limit?: number;
};

/**
 * Suggests the next ingredients to add to unlock the most cocktails
 */
export function getNextIngredientSuggestions({
  cocktails,
  ownedIngredientIds,
  stapleIngredientIds = [],
  maxMissing = 2,
  limit = 10
}: NextIngredientSuggestionsParams): NextIngredientSuggestion[] {
  const owned = new Set(ownedIngredientIds);
  const staples = new Set(stapleIngredientIds);

  // Track scores for each missing ingredient
  const ingredientScores = new Map<string, {
    unlockScore: number;
    unlocksMissing1Count: number;
    unlocksMissing2Count: number;
  }>();

  for (const cocktail of cocktails) {
    if (!cocktail.ingredients || cocktail.ingredients.length === 0) {
      continue;
    }

    // Get required ingredients (not optional, not staples)
    const requiredIngredients = cocktail.ingredients.filter(
      (ing) => ing.id && !ing.isOptional && !staples.has(ing.id)
    );

    if (requiredIngredients.length === 0) {
      continue;
    }

    // Find missing required ingredients
    const missingRequiredIds: string[] = [];
    for (const ing of requiredIngredients) {
      if (!owned.has(ing.id)) {
        missingRequiredIds.push(ing.id);
      }
    }

    const missingCount = missingRequiredIds.length;

    // Only consider cocktails with 1-2 missing ingredients
    if (missingCount >= 1 && missingCount <= maxMissing) {
      const weight = missingCount === 1 ? 3 : 1;

      for (const ingredientId of missingRequiredIds) {
        const current = ingredientScores.get(ingredientId) || {
          unlockScore: 0,
          unlocksMissing1Count: 0,
          unlocksMissing2Count: 0
        };

        current.unlockScore += weight;

        if (missingCount === 1) {
          current.unlocksMissing1Count += 1;
        } else if (missingCount === 2) {
          current.unlocksMissing2Count += 1;
        }

        ingredientScores.set(ingredientId, current);
      }
    }
  }

  // Convert to array and sort by unlock score
  const suggestions: NextIngredientSuggestion[] = Array.from(ingredientScores.entries())
    .map(([ingredientId, scores]) => ({
      ingredientId,
      unlockScore: scores.unlockScore,
      unlocksMissing1Count: scores.unlocksMissing1Count,
      unlocksMissing2Count: scores.unlocksMissing2Count
    }))
    .sort((a, b) => b.unlockScore - a.unlockScore)
    .slice(0, limit);

  return suggestions;
}

/**
 * Maps ingredient IDs to names using cocktail data (no extra network calls)
 */
export function mapIngredientIdsToNames(
  ingredientIds: string[],
  cocktails: MixCocktail[]
): Map<string, string> {
  const idToName = new Map<string, string>();

  for (const cocktail of cocktails) {
    if (!cocktail.ingredients) continue;

    for (const ingredient of cocktail.ingredients) {
      if (ingredientIds.includes(ingredient.id) && !idToName.has(ingredient.id)) {
        idToName.set(ingredient.id, ingredient.name);
      }
    }
  }

  return idToName;
}

/**
 * Enhanced suggestions with ingredient names
 */
export type NextIngredientSuggestionWithName = NextIngredientSuggestion & {
  ingredientName: string;
};

export function getNextIngredientSuggestionsWithNames(
  params: NextIngredientSuggestionsParams
): NextIngredientSuggestionWithName[] {
  const suggestions = getNextIngredientSuggestions(params);
  const ingredientIds = suggestions.map(s => s.ingredientId);
  const idToName = mapIngredientIdsToNames(ingredientIds, params.cocktails);

  return suggestions.map(suggestion => ({
    ...suggestion,
    ingredientName: idToName.get(suggestion.ingredientId) || 'Unknown Ingredient'
  }));
}
