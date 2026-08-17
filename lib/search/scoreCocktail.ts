import { tokensFuzzyEqual } from "./fuzzy";
import { normalizeSearchText, tokenizeSearchText } from "./normalize";
import { prepareSearchQuery } from "./synonyms";

/** Minimal cocktail shape needed for ranked search. */
export type CocktailSearchDocument = {
  id: string;
  name: string;
  description?: string | null;
  primarySpirit?: string | null;
  tags?: string[] | null;
  categories?: string[] | null;
  ingredientNames?: string[] | null;
  createdAt?: string | null;
  isPopular?: boolean | null;
  isFavorite?: boolean | null;
  isTrending?: boolean | null;
};

export type CocktailSearchHit<T extends CocktailSearchDocument = CocktailSearchDocument> = {
  item: T;
  score: number;
};

type FieldMatch = "exact_name" | "prefix_name" | "name" | "spirit" | "ingredient" | "tag" | "category" | "description" | "fuzzy_name" | "keyword";

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

/**
 * Score one cocktail against a prepared query.
 * Returns null when the cocktail should be excluded.
 */
export function scoreCocktailDocument(
  doc: CocktailSearchDocument,
  prepared: ReturnType<typeof prepareSearchQuery>,
  keywords?: SearchKeywordFlags
): number | null {
  if (prepared.tokens.length === 0) return null;

  const nameNorm = normalizeSearchText(doc.name);
  const nameTokens = tokenizeSearchText(doc.name);
  const spiritTokens = fieldTokens([doc.primarySpirit ?? undefined]);
  const ingredientTokens = fieldTokens(doc.ingredientNames ?? []);
  const tagTokens = fieldTokens(doc.tags ?? []);
  const categoryTokens = fieldTokens(doc.categories ?? []);
  const descriptionTokens = fieldTokens([doc.description ?? undefined]);

  // Whole-query exact / prefix boosts
  let score = 0;
  if (nameNorm === prepared.normalized) {
    score += SCORE.exact_name;
  } else if (nameNorm.startsWith(prepared.normalized)) {
    score += SCORE.prefix_name;
  }

  // Keyword intents (new / popular / etc.)
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

  // Multi-token queries require every token to hit somewhere (unless keyword intent matched alone)
  if (covered < prepared.tokens.length) {
    if (!(keywordMatched && prepared.tokens.length === 1)) {
      return null;
    }
  }

  // Prefer shorter names slightly when scores tie-ish
  score += Math.max(0, 12 - nameTokens.length);

  return score;
}

export function searchCocktailDocuments<T extends CocktailSearchDocument>(
  items: T[],
  query: string,
  options: {
    limit?: number;
    keywords?: SearchKeywordFlags;
  } = {}
): CocktailSearchHit<T>[] {
  const prepared = prepareSearchQuery(query);
  if (prepared.tokens.length === 0) return [];

  const hits: CocktailSearchHit<T>[] = [];
  for (const item of items) {
    const score = scoreCocktailDocument(item, prepared, options.keywords);
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
