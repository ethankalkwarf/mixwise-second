import { normalizeSearchText, tokenizeSearchText } from "./normalize";
import { expandSearchToken } from "./synonyms";
import { getLearnMethod } from "@/lib/learnLibrary";

const FILLER_TOKENS = new Set([
  "a",
  "an",
  "the",
  "with",
  "and",
  "or",
  "for",
  "me",
  "my",
  "please",
  "show",
  "find",
  "get",
  "make",
  "recipe",
  "recipes",
  "cocktail",
  "cocktails",
  "drink",
  "drinks",
  "something",
  "some",
  "how",
  "to",
  "do",
  "i",
  "can",
  "you",
  "whats",
  "what",
  "is",
]);

const SPIRITS = [
  "vodka",
  "gin",
  "rum",
  "tequila",
  "mezcal",
  "whiskey",
  "whisky",
  "bourbon",
  "scotch",
  "brandy",
  "cognac",
] as const;

const CATEGORIES = [
  "tiki",
  "classic",
  "sour",
  "sweet",
  "refreshing",
  "boozy",
  "strong",
  "dessert",
  "mocktail",
  "party",
  "summer",
  "winter",
  "fall",
  "spring",
  "holiday",
  "modern",
  "quick",
] as const;

const TECHNIQUES = [
  "shake",
  "shaken",
  "stir",
  "stirred",
  "build",
  "built",
  "muddle",
  "muddling",
  "layer",
  "layered",
  "blend",
  "blended",
  "swizzle",
  "dry shake",
  "fine strain",
] as const;

export type ParsedSearchIntent = {
  raw: string;
  /** Query used for ranked token matching after stripping filler / intent words */
  matchQuery: string;
  preferLearn: boolean;
  spirit?: string;
  ingredient?: string;
  category?: string;
  technique?: string;
  /** Omnibar chip, e.g. "Gin cocktails" */
  chipLabel?: string;
  /** Deep link for the chip */
  chipHref?: string;
};

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function canonicalSpirit(token: string): string | undefined {
  const forms = expandSearchToken(token);
  for (const spirit of SPIRITS) {
    if (forms.includes(spirit) || token === spirit) {
      return spirit === "whisky" ? "whiskey" : spirit;
    }
  }
  return undefined;
}

function matchCategory(token: string): string | undefined {
  const normalized = normalizeSearchText(token);
  return CATEGORIES.find((cat) => cat === normalized);
}

function matchTechnique(text: string): string | undefined {
  const normalized = normalizeSearchText(text);
  for (const technique of TECHNIQUES) {
    if (normalized === technique || normalized.includes(technique)) {
      return technique.replace(/\s+/g, "-");
    }
  }
  return undefined;
}

function stripFiller(tokens: string[], extra: string[] = []): string {
  const drop = new Set([...FILLER_TOKENS, ...extra.map((t) => normalizeSearchText(t))]);
  return tokens.filter((token) => !drop.has(token)).join(" ");
}

/**
 * Lightweight intent parser for cocktail / learn / ingredient queries.
 * Prefer deterministic rules over LLM for the hot search path.
 */
export function parseSearchIntent(query: string): ParsedSearchIntent {
  const raw = query.trim();
  const normalized = normalizeSearchText(raw);
  const tokens = tokenizeSearchText(normalized);

  const base: ParsedSearchIntent = {
    raw,
    matchQuery: normalized,
    preferLearn: false,
  };

  if (!normalized) return base;

  // how to shake / how do i stir
  const howTo = normalized.match(/^(?:how to|how do i)\s+(.+)$/);
  if (howTo) {
    const rest = howTo[1];
    const technique = matchTechnique(rest) || tokenizeSearchText(rest)[0];
    const methodSlug = technique?.replace(/shake$/, "shake").replace(/stirred|stir$/, "stir");
    const method =
      (technique && getLearnMethod(technique)) ||
      (methodSlug && getLearnMethod(methodSlug)) ||
      getLearnMethod(rest.replace(/\s+/g, "-"));
    return {
      ...base,
      preferLearn: true,
      technique,
      matchQuery: rest,
      chipLabel: technique ? `Learn: ${titleCase(technique.replace(/-/g, " "))}` : "Learn",
      chipHref: method ? `/learn/methods/${method.slug}` : `/learn`,
    };
  }

  // shake vs stir
  if (/\bvs\.?\b|\bversus\b/.test(normalized)) {
    return {
      ...base,
      preferLearn: true,
      matchQuery: normalized.replace(/\bvs\.?\b|\bversus\b/g, " ").replace(/\s+/g, " ").trim(),
      chipLabel: "Learn guides",
      chipHref: "/learn/guides/shake-vs-stir",
    };
  }

  // drinks with campari / cocktails with lime
  const withMatch = normalized.match(/^(?:drinks?|cocktails?)\s+with\s+(.+)$/);
  if (withMatch) {
    const ingredient = withMatch[1].trim();
    return {
      ...base,
      ingredient,
      matchQuery: ingredient,
      chipLabel: `Drinks with ${titleCase(ingredient)}`,
      chipHref: `/cocktails?q=${encodeURIComponent(ingredient)}`,
    };
  }

  // gin cocktails / sour drinks / whiskey cocktail
  const typedMatch = normalized.match(/^(.+?)\s+(?:drinks?|cocktails?)$/);
  if (typedMatch) {
    const subject = typedMatch[1].trim();
    const spirit = canonicalSpirit(subject) || canonicalSpirit(tokenizeSearchText(subject)[0] || "");
    const category = matchCategory(subject);
    if (spirit) {
      return {
        ...base,
        spirit,
        matchQuery: spirit,
        chipLabel: `${titleCase(spirit)} cocktails`,
        chipHref: `/cocktails?spirit=${encodeURIComponent(spirit)}`,
      };
    }
    if (category) {
      return {
        ...base,
        category,
        matchQuery: category,
        chipLabel: `${titleCase(category)} cocktails`,
        chipHref: `/cocktails?q=${encodeURIComponent(category)}`,
      };
    }
  }

  // something sour / something refreshing
  const somethingMatch = normalized.match(/^something\s+(.+)$/);
  if (somethingMatch) {
    const subject = somethingMatch[1].trim();
    const category = matchCategory(subject);
    if (category) {
      return {
        ...base,
        category,
        matchQuery: category,
        chipLabel: `${titleCase(category)} cocktails`,
        chipHref: `/cocktails?q=${encodeURIComponent(category)}`,
      };
    }
  }

  // Bare technique words lean learn (shake, stir, muddle…)
  if (tokens.length <= 2) {
    const technique = matchTechnique(normalized);
    if (technique && tokens.every((t) => FILLER_TOKENS.has(t) || matchTechnique(t) || t === "vs")) {
      const method =
        getLearnMethod(technique) ||
        getLearnMethod(technique.replace(/-/g, "")) ||
        getLearnMethod(normalized.replace(/\s+/g, "-"));
      return {
        ...base,
        preferLearn: true,
        technique,
        matchQuery: normalized,
        chipLabel: `Learn: ${titleCase(technique.replace(/-/g, " "))}`,
        chipHref: method ? `/learn/methods/${method.slug}` : `/learn/techniques/${technique}`,
      };
    }
  }

  // Bare spirit → spirit intent chip + match
  if (tokens.length === 1) {
    const spirit = canonicalSpirit(tokens[0]);
    if (spirit) {
      return {
        ...base,
        spirit,
        matchQuery: spirit,
        chipLabel: `${titleCase(spirit)} cocktails`,
        chipHref: `/cocktails?spirit=${encodeURIComponent(spirit)}`,
      };
    }
    const category = matchCategory(tokens[0]);
    if (category) {
      return {
        ...base,
        category,
        matchQuery: category,
        chipLabel: `${titleCase(category)} cocktails`,
        chipHref: `/cocktails?q=${encodeURIComponent(category)}`,
      };
    }
  }

  // Default: strip filler words for cleaner token AND
  const cleaned = stripFiller(tokens);
  return {
    ...base,
    matchQuery: cleaned || normalized,
  };
}
