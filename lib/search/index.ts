import { isNewCocktail } from "@/lib/formatters";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";
import type { MixIngredient } from "@/lib/mixTypes";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { getIngredientGuide, listIngredientGuideSlugs } from "@/lib/ingredientContent";
import {
  cocktailListItemToSearchDocument,
  sanityCocktailToSearchDocument,
  mixIngredientToSearchDocument,
  directoryIngredientToSearchDocument,
  buildLearnSearchCorpus,
  type LearnSearchItem,
} from "./adapters";
import { parseSearchIntent, type ParsedSearchIntent } from "./intent";
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
export { parseSearchIntent, type ParsedSearchIntent } from "./intent";
export {
  scoreCocktailDocument,
  searchCocktailDocuments,
  type CocktailSearchDocument,
  type CocktailSearchHit,
} from "./scoreCocktail";
export {
  cocktailListItemToSearchDocument,
  sanityCocktailToSearchDocument,
  mixIngredientToSearchDocument,
  directoryIngredientToSearchDocument,
  buildLearnSearchCorpus,
  type LearnSearchItem,
} from "./adapters";

const DEFAULT_KEYWORDS = {
  isNew: (createdAt?: string | null) => Boolean(createdAt && isNewCocktail(createdAt)),
};

/** Rank cocktail list items (navbar / Cmd+K / wedding pickers). */
export function searchCocktailListItems(
  items: CocktailListItem[],
  query: string,
  options: { limit?: number; intent?: ParsedSearchIntent } = {}
): CocktailListItem[] {
  const intent = options.intent ?? parseSearchIntent(query);
  const docs = items.map(cocktailListItemToSearchDocument);
  const hits = searchCocktailDocuments(docs, query, {
    limit: options.limit,
    keywords: DEFAULT_KEYWORDS,
    intent,
  });
  return hits.map((hit) => hit.item.listItem);
}

/** Rank directory cocktails (Sanity view-model). */
export function searchSanityCocktails(
  cocktails: SanityCocktail[],
  query: string,
  options: { limit?: number; intent?: ParsedSearchIntent } = {}
): SanityCocktail[] {
  const intent = options.intent ?? parseSearchIntent(query);
  const docs = cocktails.map(sanityCocktailToSearchDocument);
  const hits: CocktailSearchHit<(typeof docs)[number]>[] = searchCocktailDocuments(
    docs,
    query,
    {
      limit: options.limit,
      keywords: DEFAULT_KEYWORDS,
      intent,
    }
  );
  return hits.map((hit) => hit.item.cocktail);
}

/** Rank Mix cabinet ingredients. */
export function searchMixIngredients(
  ingredients: MixIngredient[],
  query: string,
  options: { limit?: number } = {}
): MixIngredient[] {
  const docs = ingredients.map(mixIngredientToSearchDocument);
  const hits = searchCocktailDocuments(docs, query, { limit: options.limit });
  return hits.map((hit) => hit.item.ingredient);
}

/** Rank ingredients directory entries. */
export function searchDirectoryIngredients(
  ingredients: DirectoryIngredient[],
  query: string,
  options: { limit?: number } = {}
): DirectoryIngredient[] {
  const docs = ingredients.map(directoryIngredientToSearchDocument);
  const hits = searchCocktailDocuments(docs, query, { limit: options.limit });
  return hits.map((hit) => hit.item.ingredient);
}

/** Rank Learn guides / methods / techniques. */
export function searchLearnItems(
  query: string,
  options: { limit?: number; intent?: ParsedSearchIntent } = {}
): LearnSearchItem[] {
  const intent = options.intent ?? parseSearchIntent(query);
  const docs = buildLearnSearchCorpus();
  const hits = searchCocktailDocuments(docs, intent.matchQuery || query, {
    limit: options.limit,
  });
  return hits.map((hit) => hit.item.learn);
}

export type OmnibarIngredientHit = {
  id: string;
  name: string;
  slug: string;
  href: string;
  summary?: string;
};

export type OmnibarResult = {
  intent: ParsedSearchIntent;
  cocktails: CocktailListItem[];
  ingredients: OmnibarIngredientHit[];
  learn: LearnSearchItem[];
};

/** Build omnibar ingredient hits from published guides (static, no DB). */
export function searchOmnibarIngredients(
  query: string,
  options: { limit?: number } = {}
): OmnibarIngredientHit[] {
  const docs = listIngredientGuideSlugs().map((slug) => {
    const guide = getIngredientGuide(slug)!;
    return {
      id: slug,
      name: guide.seoTitle,
      description: guide.dek,
      tags: [] as string[],
      aliases: [...(guide.aliases || []), ...(guide.matchNames || []), slug.replace(/-/g, " ")],
      guide,
    };
  });

  const hits = searchCocktailDocuments(docs, query, { limit: options.limit ?? 5 });
  return hits.map((hit) => ({
    id: hit.item.id,
    name: hit.item.name,
    slug: hit.item.guide.slug,
    href: `/ingredients/${hit.item.guide.slug}`,
    summary: hit.item.guide.dek,
  }));
}

/** Grouped catalog search for Cmd+K omnibar. */
export function searchOmnibarCatalog(
  cocktails: CocktailListItem[],
  query: string,
  options: {
    cocktailLimit?: number;
    ingredientLimit?: number;
    learnLimit?: number;
  } = {}
): OmnibarResult {
  const intent = parseSearchIntent(query);
  const preferLearn = intent.preferLearn;

  const cocktailLimit = options.cocktailLimit ?? (preferLearn ? 4 : 6);
  const ingredientLimit = options.ingredientLimit ?? 4;
  const learnLimit = options.learnLimit ?? (preferLearn ? 6 : 4);

  return {
    intent,
    cocktails: searchCocktailListItems(cocktails, query, {
      limit: cocktailLimit,
      intent,
    }),
    ingredients: searchOmnibarIngredients(intent.matchQuery || query, {
      limit: ingredientLimit,
    }),
    learn: searchLearnItems(query, { limit: learnLimit, intent }),
  };
}

/** Helper for Mix URL slug links when guide slug differs from name. */
export function mixIngredientHref(ingredient: MixIngredient): string {
  const slug = slugifyIngredientName(ingredient.name);
  const guide = getIngredientGuide(slug);
  return `/ingredients/${guide?.slug || slug}`;
}
