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

  console.log(`[PROD-DEBUG] Matching ${ownedIngredientIds.length} owned ingredients against ${cocktails.length} cocktails`);
  console.log(`[PROD-DEBUG] Owned IDs sample:`, ownedIngredientIds.slice(0, 5));

  const owned = new Set<string>(ownedIngredientIds);
  const staples = new Set<string>(stapleIngredientIds);

  const makeNow: MixMatchResult[] = [];
  const almostThere: MixMatchResult[] = [];
  const all: MixMatchResult[] = [];

  for (const cocktail of cocktails) {
    // Skip cocktails with no ingredients (bad data)
    if (!cocktail.ingredientsWithIds || cocktail.ingredientsWithIds.length === 0) {
      continue;
    }

    // Filter to required ingredients (not optional, not staples)
    const requiredIngredients = cocktail.ingredientsWithIds.filter(
      (ing) => ing.id && !ing.isOptional && !staples.has(ing.id)
    );

    // Skip cocktails with no valid required ingredients
    if (requiredIngredients.length === 0) {
      continue;
    }

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

    const score = requiredCovered / requiredTotal;

    const result: MixMatchResult = {
      cocktail,
      score,
      missingIngredientIds: missingIds,
      missingIngredientNames: missingNames,
    };

    all.push(result);

    // READY: User has 100% of required ingredients
    if (missingIds.length === 0 && requiredCovered > 0) {
      makeNow.push(result);
    } 
    // ALMOST: User has ≥60% of ingredients AND is missing at least 1
    else if (score >= 0.6 && missingIds.length > 0) {
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

  console.log(`[PROD-DEBUG] Match results: ${makeNow.length} ready, ${almostThere.length} almost there`);

  return { makeNow, almostThere, all };
}

