import { isNewCocktail } from "@/lib/formatters";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";
import {
  cocktailListItemToSearchDocument,
  sanityCocktailToSearchDocument,
} from "./adapters";
import {
  searchCocktailDocuments,
  type CocktailSearchHit,
} from "./scoreCocktail";

export {
  foldSearchAccents,
  normalizeSearchText,
  tokenizeSearchText,
} from "./normalize";
export { expandSearchToken, prepareSearchQuery } from "./synonyms";
export { levenshteinDistance, tokensFuzzyEqual } from "./fuzzy";
export {
  scoreCocktailDocument,
  searchCocktailDocuments,
  type CocktailSearchDocument,
  type CocktailSearchHit,
} from "./scoreCocktail";
export {
  cocktailListItemToSearchDocument,
  sanityCocktailToSearchDocument,
} from "./adapters";

const DEFAULT_KEYWORDS = {
  isNew: (createdAt?: string | null) => Boolean(createdAt && isNewCocktail(createdAt)),
};

/** Rank cocktail list items (navbar / Cmd+K / wedding pickers). */
export function searchCocktailListItems(
  items: CocktailListItem[],
  query: string,
  options: { limit?: number } = {}
): CocktailListItem[] {
  const docs = items.map(cocktailListItemToSearchDocument);
  const hits = searchCocktailDocuments(docs, query, {
    limit: options.limit,
    keywords: DEFAULT_KEYWORDS,
  });
  return hits.map((hit) => hit.item.listItem);
}

/** Rank directory cocktails (Sanity view-model). */
export function searchSanityCocktails(
  cocktails: SanityCocktail[],
  query: string,
  options: { limit?: number } = {}
): SanityCocktail[] {
  const docs = cocktails.map(sanityCocktailToSearchDocument);
  const hits: CocktailSearchHit<(typeof docs)[number]>[] = searchCocktailDocuments(
    docs,
    query,
    {
      limit: options.limit,
      keywords: DEFAULT_KEYWORDS,
    }
  );
  return hits.map((hit) => hit.item.cocktail);
}
