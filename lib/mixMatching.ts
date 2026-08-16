/**
 * Matching engine for the Mix tool
 * Determines which cocktails can be made based on owned ingredients
 *
 * CRITICAL: All ingredient IDs MUST be in canonical UUID format (strings).
 * This file assumes IDs are already normalized by useBarIngredients and getMixDataClient.
 */

import type { MixCocktail, MixMatchResult, MixMatchGroups } from "./mixTypes";

export type MixMatchParams = {
  cocktails: MixCocktail[];
  ownedIngredientIds: string[];
  stapleIngredientIds?: string[];
  maxMissing?: number; // Maximum missing required ingredients for "almost there"
};

export function getMixMatchGroups(params: MixMatchParams): MixMatchGroups {
  const {
    cocktails,
    ownedIngredientIds,
    stapleIngredientIds = [],
    maxMissing = 2
  } = params;

  const owned = new Set<string>(ownedIngredientIds);
  const staples = new Set<string>(stapleIngredientIds);

  const ready: MixMatchResult[] = [];
  const almostThere: MixMatchResult[] = [];
  const far: MixMatchResult[] = [];

  for (const cocktail of cocktails) {
    if (!cocktail.ingredients || cocktail.ingredients.length === 0) {
      continue;
    }

    // Unmatched recipe lines are tagged id "unknown" during JSON→catalog mapping.
    // They must not block "ready" — the user cannot add an ingredient that is not in the catalog.
    const requiredIngredients = cocktail.ingredients.filter(
      (ing) =>
        ing.id &&
        ing.id !== "unknown" &&
        !ing.isOptional &&
        !staples.has(ing.id)
    );

    if (requiredIngredients.length === 0) {
      continue;
    }

    const requiredTotal = requiredIngredients.length;
    let requiredCovered = 0;
    const missingRequiredIds: string[] = [];
    const missingNames: string[] = [];

    for (const ing of requiredIngredients) {
      if (owned.has(ing.id)) {
        requiredCovered += 1;
      } else {
        missingRequiredIds.push(ing.id);
        missingNames.push(ing.name);
      }
    }

    const missingCount = missingRequiredIds.length;
    const matchPercent = requiredTotal > 0 ? requiredCovered / requiredTotal : 0;

    const result: MixMatchResult = {
      cocktail,
      score: matchPercent,
      missingRequiredIngredientIds: missingRequiredIds,
      missingIngredientIds: missingRequiredIds,
      missingIngredientNames: missingNames,
      missingCount,
      matchPercent,
    };

    if (missingCount === 0) {
      ready.push(result);
    } else if (missingCount <= maxMissing) {
      almostThere.push(result);
    } else {
      far.push(result);
    }
  }

  ready.sort((a, b) => {
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    const aRequiredCount = a.cocktail.ingredients.filter((ing) => !ing.isOptional).length;
    const bRequiredCount = b.cocktail.ingredients.filter((ing) => !ing.isOptional).length;
    return aRequiredCount - bRequiredCount;
  });

  almostThere.sort((a, b) => {
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });

  far.sort((a, b) => {
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });

  return {
    ready,
    almostThere,
    far,
    makeNow: ready
  };
}
