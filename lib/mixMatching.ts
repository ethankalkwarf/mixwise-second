/**
 * Matching engine for the Mix tool
 * Determines which cocktails can be made based on owned ingredients
 */

import type { MixCocktail, MixMatchResult, MixMatchGroups } from "./mixTypes";

export type MixMatchParams = {
  cocktails: MixCocktail[];
  ownedIngredientIds: string[];
  stapleIngredientIds?: string[];
};

export function getMixMatchGroups(params: MixMatchParams): MixMatchGroups {
  const { cocktails, ownedIngredientIds, stapleIngredientIds = [] } = params;

  const owned = new Set<string>(ownedIngredientIds);
  const staples = new Set<string>(stapleIngredientIds);

  const makeNow: MixMatchResult[] = [];
  const almostThere: MixMatchResult[] = [];
  const all: MixMatchResult[] = [];

  for (const cocktail of cocktails) {
    // Filter to required ingredients (not optional, not staples)
    const requiredIngredients = cocktail.ingredients.filter(
      (ing) => !ing.isOptional && !staples.has(ing.id)
    );

    const requiredTotal = requiredIngredients.length;
    let requiredCovered = 0;
    const missingIds: string[] = [];
    const missingNames: string[] = [];

    for (const ing of requiredIngredients) {
      if (owned.has(ing.id) || staples.has(ing.id)) {
        requiredCovered += 1;
      } else {
        missingIds.push(ing.id);
        missingNames.push(ing.name);
      }
    }

    const score = requiredTotal === 0 ? 1 : requiredCovered / Math.max(requiredTotal, 1);

    const result: MixMatchResult = {
      cocktail,
      score,
      missingIngredientIds: missingIds,
      missingIngredientNames: missingNames,
    };

    all.push(result);

    if (missingIds.length === 0) {
      makeNow.push(result);
    } else if (missingIds.length === 1) {
      almostThere.push(result);
    }
  }

  // Sort by score descending, then by name
  const sortFn = (a: MixMatchResult, b: MixMatchResult) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.cocktail.name.localeCompare(b.cocktail.name);
  };

  makeNow.sort(sortFn);
  almostThere.sort(sortFn);
  all.sort(sortFn);

  return { makeNow, almostThere, all };
}

