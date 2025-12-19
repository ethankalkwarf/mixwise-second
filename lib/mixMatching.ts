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

  // Always debug Margarita (not just in development)
  console.log('[MIX-MATCH-DEBUG] Input:', {
    ownedCount: ownedIngredientIds.length,
    cocktailCount: cocktails.length,
    stapleCount: stapleIngredientIds.length,
    ownedSample: ownedIngredientIds.slice(0, 5),
    firstCocktailIngredients: cocktails.length > 0 ? cocktails[0].ingredients.slice(0, 3).map(i => ({ id: i.id, name: i.name, optional: i.isOptional })) : []
  });

  // Debug Margarita specifically - try multiple name variations
  const margaritaVariations = ['margarita', 'classic margarita', 'tequila margarita'];
  let margarita = null;
  for (const variation of margaritaVariations) {
    margarita = cocktails.find(c => c.name.toLowerCase().includes(variation));
    if (margarita) break;
  }

  if (margarita) {
    console.log('[MIX-MATCH-DEBUG] Margarita found:', {
      id: margarita.id,
      name: margarita.name,
      ingredients: margarita.ingredients.map(i => ({ id: i.id, name: i.name, optional: i.isOptional }))
    });
  } else {
    console.log('[MIX-MATCH-DEBUG] Margarita not found in cocktails. Available names:', cocktails.slice(0, 10).map(c => c.name));
  }

  // Specifically debug the basic "Margarita" cocktail
  const basicMargarita = cocktails.find(c => c.name.toLowerCase() === 'margarita');
  if (basicMargarita) {
    console.log('[MIX-MATCH-DEBUG] BASIC Margarita ingredients:', basicMargarita.ingredients.map(i => ({
      id: i.id,
      name: i.name,
      optional: i.isOptional,
      isStaple: stapleIngredientIds.includes(i.id)
    })));
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

    // Debug Margarita specifically
    if (cocktail.name.toLowerCase() === 'margarita') {
      console.log('[MIX-MATCH-DEBUG] BASIC Margarita matching:', {
        name: cocktail.name,
        requiredTotal,
        requiredCovered,
        missingCount,
        matchPercent,
        requiredIngredients: requiredIngredients.map(i => ({ id: i.id, name: i.name })),
        missingRequiredIds,
        ownedIngredientIds: ownedIngredientIds.slice(0, 10),
        staples: stapleIngredientIds,
        category: missingCount === 0 ? 'READY' : missingCount <= maxMissing ? 'ALMOST' : 'FAR'
      });
    }

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

