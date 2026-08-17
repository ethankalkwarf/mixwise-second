import { normalizeSearchText, tokenizeSearchText } from "./normalize";

/**
 * Bidirectional synonym groups for search expansion.
 * Keep these tight — spirit subtypes like bourbon→whiskey are intentional
 * so "whisky cocktails" and "whiskey" find overlapping drinks.
 */
const SYNONYM_GROUPS: string[][] = [
  ["whiskey", "whisky"],
  ["scotch", "scotch whisky", "scotch whiskey"],
  ["curacao", "blue curacao"],
  ["triple sec", "cointreau"],
  ["club soda", "soda water", "sparkling water"],
  ["simple syrup", "sugar syrup"],
  ["lime juice", "fresh lime juice"],
  ["lemon juice", "fresh lemon juice"],
  ["coffee liqueur", "kahlua"],
  ["irish cream", "baileys"],
  ["campari", "bitter aperitivo"],
];

/** Common cocktail / spirit misspellings → canonical forms. */
const MISSPELLINGS: Record<string, string> = {
  magarita: "margarita",
  margharita: "margarita",
  margerita: "margarita",
  margaritae: "margarita",
  negronni: "negroni",
  negrony: "negroni",
  negroni: "negroni",
  daiquri: "daiquiri",
  daquiri: "daiquiri",
  daiquiry: "daiquiri",
  manhatten: "manhattan",
  manhatan: "manhattan",
  mohjito: "mojito",
  mohito: "mojito",
  mojito: "mojito",
  cosmopoliton: "cosmopolitan",
  cosmopolitian: "cosmopolitan",
  oldfashion: "old fashioned",
  oldfashioned: "old fashioned",
  whiskeysour: "whiskey sour",
  whiskysour: "whiskey sour",
  ginntonic: "gin tonic",
  gintonic: "gin tonic",
  aperolspritz: "aperol spritz",
  expressomartini: "espresso martini",
  espressomartini: "espresso martini",
};

function buildSynonymLookup(): Map<string, Set<string>> {
  const lookup = new Map<string, Set<string>>();

  const add = (from: string, to: string) => {
    const key = normalizeSearchText(from);
    const value = normalizeSearchText(to);
    if (!key || !value) return;
    let set = lookup.get(key);
    if (!set) {
      set = new Set<string>();
      lookup.set(key, set);
    }
    set.add(value);
    set.add(key);
  };

  for (const group of SYNONYM_GROUPS) {
    for (const a of group) {
      for (const b of group) {
        add(a, b);
      }
    }
  }

  for (const [typo, canonical] of Object.entries(MISSPELLINGS)) {
    add(typo, canonical);
    // Also link multi-word canonicals as phrase replacements
    for (const token of tokenizeSearchText(canonical)) {
      add(typo, token);
    }
  }

  return lookup;
}

const SYNONYM_LOOKUP = buildSynonymLookup();

/** Expand a single token with synonyms and misspelling corrections. */
export function expandSearchToken(token: string): string[] {
  const normalized = normalizeSearchText(token);
  if (!normalized) return [];

  const forms = new Set<string>([normalized]);
  const direct = SYNONYM_LOOKUP.get(normalized);
  if (direct) {
    for (const form of direct) forms.add(form);
  }

  // If the whole token is a glued misspelling (oldfashioned), expand to tokens
  const correction = MISSPELLINGS[normalized.replace(/\s+/g, "")];
  if (correction) {
    for (const part of tokenizeSearchText(correction)) {
      forms.add(part);
      const syn = SYNONYM_LOOKUP.get(part);
      if (syn) for (const s of syn) forms.add(s);
    }
  }

  return Array.from(forms);
}

/**
 * Prepare a user query for matching: normalize, apply phrase corrections,
 * tokenize, and expand each token into acceptable forms.
 */
export function prepareSearchQuery(query: string): {
  raw: string;
  normalized: string;
  tokens: string[];
  expandedTokens: string[][];
} {
  let normalized = normalizeSearchText(query);

  // Phrase-level misspellings / glued words
  const glued = normalized.replace(/\s+/g, "");
  const gluedCorrection = MISSPELLINGS[glued];
  if (gluedCorrection) {
    normalized = normalizeSearchText(gluedCorrection);
  } else {
    for (const [typo, canonical] of Object.entries(MISSPELLINGS)) {
      if (typo.includes(" ") && normalized.includes(typo)) {
        normalized = normalized.replace(typo, normalizeSearchText(canonical));
      }
    }
  }

  const tokens = tokenizeSearchText(normalized);
  const expandedTokens = tokens.map((token) => expandSearchToken(token));

  return {
    raw: query,
    normalized,
    tokens,
    expandedTokens,
  };
}
