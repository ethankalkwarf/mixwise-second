/**
 * Matching engine for the Mix tool
 * Determines which cocktails can be made based on owned ingredients
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[MIX-MATCH-DEBUG] Input:', {
      ownedCount: ownedIngredientIds.length,
      cocktailCount: cocktails.length,
      stapleCount: stapleIngredientIds.length,
      ownedSample: ownedIngredientIds.slice(0, 5),
      firstCocktailIngredients: cocktails.length > 0 ? cocktails[0].ingredients.slice(0, 3).map(i => ({ id: i.id, name: i.name, optional: i.isOptional })) : []
    });
  }

  for (const cocktail of cocktails) {
    // Skip cocktails with no ingredients (bad data)
    if (!cocktail.ingredients || cocktail.ingredients.length === 0) {
      continue;
    }

    // Classify ingredients
    const requiredIngredients = cocktail.ingredients.filter(
      (ing) => ing.id && !ing.isOptional && !staples.has(ing.id)
    );

    // Skip cocktails with no valid required ingredients
    if (requiredIngredients.length === 0) {
      continue;
    }

    const requiredTotal = requiredIngredients.length;
    let requiredCovered = 0;
    const missingRequiredIds: string[] = [];
    const missingNames: string[] = [];

    // Check required ingredients
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
      score: matchPercent, // Legacy compatibility
      missingRequiredIngredientIds: missingRequiredIds,
      missingIngredientIds: missingRequiredIds, // Legacy compatibility
      missingIngredientNames: missingNames, // Legacy compatibility
      missingCount,
      matchPercent,
    };

    // Categorize cocktails based on missing required ingredients
    if (missingCount === 0) {
      // READY: All required ingredients owned
      ready.push(result);
    } else if (missingCount <= maxMissing) {
      // ALMOST THERE: Missing 1-maxMissing required ingredients
      almostThere.push(result);
    } else {
      // FAR: Missing more than maxMissing required ingredients
      far.push(result);
    }
  }

  // Sort READY: highest matchPercent, then fewest total required ingredients
  ready.sort((a, b) => {
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    const aRequiredCount = a.cocktail.ingredients.filter(ing => !ing.isOptional).length;
    const bRequiredCount = b.cocktail.ingredients.filter(ing => !ing.isOptional).length;
    return aRequiredCount - bRequiredCount;
  });

  // Sort ALMOST THERE: missingCount ascending, then matchPercent descending
  almostThere.sort((a, b) => {
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });

  // Sort FAR: by matchPercent descending (can be ignored by UI)
  far.sort((a, b) => {
    if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[MIX-MATCH-DEBUG] Results:', {
      ready: ready.length,
      almostThere: almostThere.length,
      far: far.length,
      readySample: ready.slice(0, 3).map(r => ({ name: r.cocktail.name, matchPercent: r.matchPercent })),
      almostThereSample: almostThere.slice(0, 3).map(r => ({ name: r.cocktail.name, missingCount: r.missingCount, matchPercent: r.matchPercent }))
    });
  }

  return {
    ready,
    almostThere,
    far,
    makeNow: ready // Legacy compatibility
  };
}

