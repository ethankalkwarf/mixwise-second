import { tokensFuzzyEqual } from "./fuzzy";
import type { ParsedSearchIntent } from "./intent";
import { normalizeSearchText, tokenizeSearchText } from "./normalize";
import { expandSearchToken, prepareSearchQuery } from "./synonyms";

/** Minimal cocktail shape needed for ranked search. */
export type CocktailSearchDocument = {
  id: string;
  name: string;
  description?: string | null;
  primarySpirit?: string | null;
  tags?: string[] | null;
  categories?: string[] | null;
  ingredientNames?: string[] | null;
  /** Extra alias tokens (ingredient guides, learn topics, etc.) */
  aliases?: string[] | null;
  createdAt?: string | null;
  isPopular?: boolean | null;
  isFavorite?: boolean | null;
  isTrending?: boolean | null;
};

export type CocktailSearchHit<T extends CocktailSearchDocument = CocktailSearchDocument> = {
  item: T;
  score: number;
};

type FieldMatch =
  | "exact_name"
  | "prefix_name"
  | "name"
  | "spirit"
  | "ingredient"
  | "tag"
  | "category"
  | "description"
  | "fuzzy_name"
  | "keyword"
  | "intent";

const SCORE: Record<FieldMatch, number> = {
  exact_name: 120,
  prefix_name: 90,
  name: 55,
  spirit: 40,
  ingredient: 35,
  tag: 28,
  category: 28,
  description: 12,
  fuzzy_name: 45,
  keyword: 100,
  intent: 50,
};

export type SearchKeywordFlags = {
  isNew?: (createdAt?: string | null) => boolean;
};

function fieldTokens(values: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    out.push(...tokenizeSearchText(value));
  }
  return out;
}

function formsMatchTokens(forms: string[], haystack: string[]): boolean {
  for (const form of forms) {
    for (const token of haystack) {
      if (token === form) return true;
      if (
        (token.startsWith(form) || form.startsWith(token)) &&
        Math.min(token.length, form.length) >= 3
      ) {
        return true;
      }
      if (tokensFuzzyEqual(token, form)) return true;
    }
  }
  return false;
}

function bestTokenFieldMatch(
  forms: string[],
  fields: { kind: FieldMatch; tokens: string[] }[]
): FieldMatch | null {
  let best: FieldMatch | null = null;
  let bestScore = -1;

  for (const field of fields) {
    for (const form of forms) {
      for (const token of field.tokens) {
        let kind: FieldMatch | null = null;
        if (token === form) {
          kind = field.kind === "fuzzy_name" ? "name" : field.kind;
        } else if (
          (token.startsWith(form) || form.startsWith(token)) &&
          Math.min(token.length, form.length) >= 3
        ) {
          kind = field.kind === "description" ? "description" : field.kind;
        } else if (field.kind === "name" && tokensFuzzyEqual(token, form)) {
          kind = "fuzzy_name";
        }

        if (kind && SCORE[kind] > bestScore) {
          best = kind;
          bestScore = SCORE[kind];
        }
      }
    }
  }

  return best;
}

function passesIntentConstraints(
  doc: CocktailSearchDocument,
  intent: ParsedSearchIntent | undefined,
  spiritTokens: string[],
  ingredientTokens: string[],
  tagTokens: string[],
  categoryTokens: string[]
): boolean {
  if (!intent) return true;

  if (intent.spirit) {
    const forms = expandSearchToken(intent.spirit);
    const ok =
      formsMatchTokens(forms, spiritTokens) ||
      formsMatchTokens(forms, ingredientTokens) ||
      formsMatchTokens(forms, tokenizeSearchText(doc.name));
    if (!ok) return false;
  }

  if (intent.ingredient) {
    const forms = expandSearchToken(intent.ingredient);
    const preparedIngredient = prepareSearchQuery(intent.ingredient);
    const allForms = new Set(forms);
    for (const set of preparedIngredient.expandedTokens) {
      for (const f of set) allForms.add(f);
    }
    const formList = Array.from(allForms);
    const ok =
      formsMatchTokens(formList, ingredientTokens) ||
      formsMatchTokens(formList, tokenizeSearchText(doc.name)) ||
      formsMatchTokens(formList, tagTokens);
    if (!ok) return false;
  }

  if (intent.category) {
    const forms = expandSearchToken(intent.category);
    const ok =
      formsMatchTokens(forms, categoryTokens) ||
      formsMatchTokens(forms, tagTokens) ||
      formsMatchTokens(forms, tokenizeSearchText(doc.name));
    if (!ok) return false;
  }

  return true;
}

/**
 * Score one cocktail against a prepared query.
 * Returns null when the cocktail should be excluded.
 */
export function scoreCocktailDocument(
  doc: CocktailSearchDocument,
  prepared: ReturnType<typeof prepareSearchQuery>,
  keywords?: SearchKeywordFlags,
  intent?: ParsedSearchIntent
): number | null {
  if (prepared.tokens.length === 0) return null;

  const nameNorm = normalizeSearchText(doc.name);
  const nameTokens = tokenizeSearchText(doc.name);
  const spiritTokens = fieldTokens([doc.primarySpirit ?? undefined]);
  const ingredientTokens = fieldTokens([
    ...(doc.ingredientNames ?? []),
    ...(doc.aliases ?? []),
  ]);
  const tagTokens = fieldTokens(doc.tags ?? []);
  const categoryTokens = fieldTokens(doc.categories ?? []);
  const descriptionTokens = fieldTokens([doc.description ?? undefined]);

  if (
    !passesIntentConstraints(
      doc,
      intent,
      spiritTokens,
      ingredientTokens,
      tagTokens,
      categoryTokens
    )
  ) {
    return null;
  }

  let score = 0;
  if (nameNorm === prepared.normalized) {
    score += SCORE.exact_name;
  } else if (nameNorm.startsWith(prepared.normalized)) {
    score += SCORE.prefix_name;
  }

  const keywordMatched = prepared.tokens.some((token) => {
    if (token === "new" && keywords?.isNew?.(doc.createdAt)) return true;
    if ((token === "popular" || token === "featured") && doc.isPopular) return true;
    if ((token === "favorite" || token === "favourites" || token === "favorites") && doc.isFavorite) {
      return true;
    }
    if ((token === "trending" || token === "hot") && doc.isTrending) return true;
    return false;
  });
  if (keywordMatched) {
    score += SCORE.keyword;
  }

  if (intent?.spirit || intent?.ingredient || intent?.category) {
    score += SCORE.intent;
  }

  const fields = [
    { kind: "name" as const, tokens: nameTokens },
    { kind: "spirit" as const, tokens: spiritTokens },
    { kind: "ingredient" as const, tokens: ingredientTokens },
    { kind: "tag" as const, tokens: tagTokens },
    { kind: "category" as const, tokens: categoryTokens },
    { kind: "description" as const, tokens: descriptionTokens },
  ];

  let covered = 0;
  for (const forms of prepared.expandedTokens) {
    const match = bestTokenFieldMatch(forms, fields);
    if (match) {
      covered += 1;
      score += SCORE[match];
    }
  }

  if (covered < prepared.tokens.length) {
    if (!(keywordMatched && prepared.tokens.length === 1)) {
      return null;
    }
  }

  score += Math.max(0, 12 - nameTokens.length);

  return score;
}

export function searchCocktailDocuments<T extends CocktailSearchDocument>(
  items: T[],
  query: string,
  options: {
    limit?: number;
    keywords?: SearchKeywordFlags;
    intent?: ParsedSearchIntent;
  } = {}
): CocktailSearchHit<T>[] {
  const matchQuery = options.intent?.matchQuery?.trim() || query;
  const prepared = prepareSearchQuery(matchQuery);
  if (prepared.tokens.length === 0) return [];

  const hits: CocktailSearchHit<T>[] = [];
  for (const item of items) {
    const score = scoreCocktailDocument(item, prepared, options.keywords, options.intent);
    if (score == null) continue;
    hits.push({ item, score });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  if (options.limit != null) {
    return hits.slice(0, options.limit);
  }
  return hits;
}
