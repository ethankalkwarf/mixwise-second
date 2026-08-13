import type { CocktailListItem } from "@/lib/cocktailTypes";

export type OccasionCocktail = Pick<
  CocktailListItem,
  "id" | "slug" | "name" | "short_description" | "base_spirit" | "category_primary" | "tags" | "categories_all" | "image_url" | "image_alt" | "created_at"
>;

export type OccasionDefinition = {
  slug: string;
  name: string;
  headline: string;
  description: string;
  /** Soft visual cue — botanical palette, no emoji-heavy UI */
  accentClass: string;
  matchTokens: string[];
  /** Preferred catalog cocktail slugs for cover photography */
  coverSlugs?: string[];
  /** Extra matcher beyond token bag (optional) */
  matchExtra?: (c: OccasionCocktail) => boolean;
};

function tokenBag(c: OccasionCocktail): Set<string> {
  const bag = new Set<string>();
  for (const value of [...(c.categories_all || []), ...(c.tags || [])]) {
    String(value)
      .toLowerCase()
      .split(/[|,/\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => bag.add(t));
  }
  if (c.category_primary) bag.add(c.category_primary.toLowerCase());
  if (c.base_spirit) bag.add(c.base_spirit.toLowerCase());
  return bag;
}

export const OCCASIONS: OccasionDefinition[] = [
  {
    slug: "summer",
    name: "Summer",
    headline: "Bright, cold, and patio-ready",
    description: "Highballs, spritzes, and citrus drinks built for heat — easy to batch and easy to drink.",
    accentClass: "from-olive/25 via-cream to-cream",
    matchTokens: ["summer"],
    coverSlugs: ["limoncello-spritz", "whiskey-smash", "gin-gin-mule", "strawberry-daiquiri"],
  },
  {
    slug: "fall",
    name: "Fall",
    headline: "Spice, orchard fruit, and longer evenings",
    description: "Apple, maple, warming spices, and spirit-forward drinks that fit cooler weather.",
    accentClass: "from-terracotta/20 via-cream to-cream",
    matchTokens: ["fall", "autumn"],
    coverSlugs: ["apple-cider-old-fashioned", "maple-old-fashioned", "spiced-pear-cocktail", "stone-fence"],
  },
  {
    slug: "holidays",
    name: "Holidays",
    headline: "Festive pours for the table",
    description: "Christmas, Thanksgiving, and party-table classics — from punches to peppermint.",
    accentClass: "from-forest/15 via-cream to-cream",
    matchTokens: ["holiday", "christmas", "thanksgiving", "winter"],
    coverSlugs: ["eggnog", "peppermint-martini", "coquito", "wassail"],
  },
  {
    slug: "party",
    name: "Party",
    headline: "Crowd-pleasers that scale",
    description: "Familiar, colorful, and shareable drinks people actually ask for at a gathering.",
    accentClass: "from-terracotta/15 via-cream to-cream",
    matchTokens: ["party"],
    coverSlugs: ["long-island-iced-tea", "sangria", "electric-lemonade", "fuzzy-navel"],
  },
  {
    slug: "brunch",
    name: "Brunch",
    headline: "Morning-to-noon glasses",
    description: "Savory, sparkling, and light daytime drinks for late breakfasts and slow weekends.",
    accentClass: "from-olive/20 via-cream to-cream",
    matchTokens: ["brunch"],
    coverSlugs: ["bloody-caesar", "mimosa", "bellini", "virgin-mary"],
  },
  {
    slug: "zero-proof",
    name: "Zero-Proof",
    headline: "Full drinks without the alcohol",
    description: "Mocktails and non-alcoholic builds that still feel intentional — not an afterthought soda.",
    accentClass: "from-olive/30 via-cream to-cream",
    matchTokens: ["zero-proof", "mocktail"],
    coverSlugs: ["virgin-mojito", "hibiscus-cooler", "shirley-temple", "zero-proof-margarita"],
    matchExtra: (c) => /non-?alcoholic/i.test(c.base_spirit || ""),
  },
  {
    slug: "aperitivo",
    name: "Aperitivo",
    headline: "Low-ABV opens and golden-hour sips",
    description: "Spritzes, bitters, vermouth highballs, and sessionable starters before dinner.",
    accentClass: "from-terracotta/25 via-cream to-cream",
    matchTokens: ["aperitif", "aperitivo", "spritz", "low-abv"],
    coverSlugs: ["aperol-spritz", "campari-soda", "negroni-sbagliato", "vermouth-tonic"],
  },
  {
    slug: "tiki",
    name: "Tiki",
    headline: "Rum, spice, and crushed-ice theater",
    description: "Tropical classics and craft tiki builds — big flavor, garnish-forward, vacation energy.",
    accentClass: "from-olive/15 via-cream to-cream",
    matchTokens: ["tiki", "tiki-adjacent"],
    coverSlugs: ["mai-tai", "blue-hawaiian", "pina-colada", "jungle-bird"],
  },
];

export function pickOccasionCover(
  occasion: OccasionDefinition,
  cocktails: OccasionCocktail[]
): OccasionCocktail | null {
  const matched = filterCocktailsForOccasion(cocktails, occasion);
  if (!matched.length) return null;
  for (const slug of occasion.coverSlugs || []) {
    const hit = matched.find((c) => c.slug === slug && c.image_url);
    if (hit) return hit;
  }
  return matched.find((c) => c.image_url) || matched[0] || null;
}

export function getOccasionCovers(
  cocktails: OccasionCocktail[]
): Record<string, OccasionCocktail | null> {
  const covers: Record<string, OccasionCocktail | null> = {};
  for (const occasion of OCCASIONS) {
    covers[occasion.slug] = pickOccasionCover(occasion, cocktails);
  }
  return covers;
}

export function getOccasion(slug: string): OccasionDefinition | undefined {
  return OCCASIONS.find((o) => o.slug === slug);
}

export function cocktailMatchesOccasion(c: OccasionCocktail, occasion: OccasionDefinition): boolean {
  if (occasion.matchExtra?.(c)) return true;
  const bag = tokenBag(c);
  return occasion.matchTokens.some((token) => bag.has(token.toLowerCase()));
}

export function filterCocktailsForOccasion(
  cocktails: OccasionCocktail[],
  occasion: OccasionDefinition
): OccasionCocktail[] {
  return cocktails
    .filter((c) => cocktailMatchesOccasion(c, occasion))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function countCocktailsByOccasion(cocktails: OccasionCocktail[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const occasion of OCCASIONS) {
    counts[occasion.slug] = cocktails.filter((c) => cocktailMatchesOccasion(c, occasion)).length;
  }
  return counts;
}
