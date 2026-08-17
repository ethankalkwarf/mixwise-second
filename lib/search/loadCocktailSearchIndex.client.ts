"use client";

import { getCocktailsListClient } from "@/lib/cocktails";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import { searchCocktailListItems, searchOmnibarCatalog, type OmnibarResult } from "@/lib/search";

let indexCache: CocktailListItem[] | null = null;
let indexPromise: Promise<CocktailListItem[]> | null = null;

/** Load (and memoize) the slim cocktail catalog for client-side ranked search. */
export async function loadCocktailSearchIndex(): Promise<CocktailListItem[]> {
  if (indexCache) return indexCache;
  if (!indexPromise) {
    indexPromise = getCocktailsListClient({ includeIngredients: true })
      .then((items) => {
        indexCache = items;
        return items;
      })
      .catch((error) => {
        indexPromise = null;
        throw error;
      });
  }
  return indexPromise;
}

/** Ranked cocktail search for wedding pickers. */
export async function searchCocktailsClient(
  query: string,
  limit = 10
): Promise<CocktailListItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const index = await loadCocktailSearchIndex();
  return searchCocktailListItems(index, trimmed, { limit });
}

/** Grouped omnibar search for Cmd+K. */
export async function searchOmnibarClient(query: string): Promise<OmnibarResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      intent: {
        raw: "",
        matchQuery: "",
        preferLearn: false,
      },
      cocktails: [],
      ingredients: [],
      learn: [],
    };
  }
  const index = await loadCocktailSearchIndex();
  return searchOmnibarCatalog(index, trimmed);
}
