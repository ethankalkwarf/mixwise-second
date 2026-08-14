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
  /** Optional static Envato/local cover under /public/occasions/{slug}.jpg */
  staticCoverPath?: string;
  /** Tailwind object-position class for cover crops (e.g. object-[center_80%]) */
  coverFocusClass?: string;
  /** Extra matcher beyond token bag (optional) */
  matchExtra?: (c: OccasionCocktail) => boolean;
  /** Hub parent — child pages nest under this collection */
  parentSlug?: string;
  /** Child occasion slugs when this is a hub (e.g. Holidays) */
  childSlugs?: string[];
  /** Compact label for tight nav (mobile sheet, chips). Falls back to `name`. */
  navName?: string;
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
  // Also index cocktail name words for holiday matching (eggnog, wassail, etc.)
  String(c.name || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
    .forEach((t) => bag.add(t));
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
    staticCoverPath: "/occasions/summer.jpg",
  },
  {
    slug: "fall",
    name: "Fall",
    headline: "Spice, orchard fruit, and longer evenings",
    description: "Apple, maple, warming spices, and spirit-forward drinks that fit cooler weather.",
    accentClass: "from-terracotta/20 via-cream to-cream",
    matchTokens: ["fall", "autumn"],
    coverSlugs: ["apple-cider-old-fashioned", "maple-old-fashioned", "spiced-pear-cocktail", "stone-fence"],
    staticCoverPath: "/occasions/fall.jpg",
    // Portrait whiskey shot — keep the glass (lower third) in the crop
    coverFocusClass: "object-[center_82%]",
  },
  {
    slug: "holidays",
    name: "Holidays",
    headline: "Festive pours for the table",
    description:
      "Dive into Christmas, Halloween, Thanksgiving, New Year’s, and more — then keep browsing sibling collections.",
    accentClass: "from-forest/15 via-cream to-cream",
    matchTokens: ["holiday", "christmas", "thanksgiving", "halloween", "winter", "nye", "valentine", "st-patricks"],
    coverSlugs: ["eggnog", "peppermint-martini", "coquito", "wassail"],
    staticCoverPath: "/occasions/holidays.jpg",
    childSlugs: ["halloween", "thanksgiving", "christmas", "new-years", "valentines", "st-patricks"],
  },
  {
    slug: "christmas",
    name: "Christmas",
    headline: "Peppermint, spice, and table punches",
    description: "Eggnog, coquito, peppermint builds, and warming classics for Christmas Eve through Boxing Day.",
    accentClass: "from-forest/20 via-cream to-cream",
    matchTokens: ["christmas", "peppermint", "eggnog", "coquito", "wassail", "gingerbread"],
    coverSlugs: ["eggnog", "peppermint-martini", "coquito", "peppermint-white-russian"],
    staticCoverPath: "/occasions/christmas.jpg",
    parentSlug: "holidays",
  },
  {
    slug: "halloween",
    name: "Halloween",
    headline: "Dark, dramatic, and a little theatrical",
    description: "Black, blood-orange, and smoky pours with costume-party energy — still worth drinking.",
    accentClass: "from-charcoal/30 via-cream to-cream",
    matchTokens: ["halloween", "spooky", "black-magic"],
    coverSlugs: ["black-magic", "corpse-reviver", "blood-and-sand"],
    staticCoverPath: "/occasions/halloween.jpg",
    parentSlug: "holidays",
    matchExtra: (c) => /black magic|corpse|blood|vampire|witch/i.test(c.name || ""),
  },
  {
    slug: "thanksgiving",
    name: "Thanksgiving",
    headline: "Orchard spice for the long table",
    description: "Apple cider, cranberry, maple, and batch-friendly punches that sit well with a feast.",
    accentClass: "from-terracotta/25 via-cream to-cream",
    matchTokens: ["thanksgiving", "cranberry", "apple-cider"],
    coverSlugs: ["thanksgiving-punch", "cranberry-mule", "apple-cider-old-fashioned", "cranberry-cosmo"],
    staticCoverPath: "/occasions/thanksgiving.jpg",
    parentSlug: "holidays",
  },
  {
    slug: "new-years",
    name: "New Year’s",
    headline: "Sparkle for midnight",
    description: "Champagne cocktails, sparkling highballs, and celebratory pours for ringing in the year.",
    accentClass: "from-olive/20 via-cream to-cream",
    matchTokens: ["new-year", "nye", "new-years", "champagne", "sparkling"],
    coverSlugs: ["french-75", "champagne-cocktail", "kir-royale", "bellini"],
    staticCoverPath: "/occasions/new-years.jpg",
    parentSlug: "holidays",
    matchExtra: (c) => /french 75|champagne|sparkling|bellini|kir|mimosa/i.test(c.name || ""),
  },
  {
    slug: "valentines",
    name: "Valentine’s",
    headline: "Romantic reds and soft pinks",
    description: "Berry, chocolate-leaning, and blush cocktails for date night — intimate, not overdone.",
    accentClass: "from-terracotta/30 via-cream to-cream",
    matchTokens: ["valentine", "romance", "date-night"],
    coverSlugs: ["pink-lady", "aviation", "clover-club", "boulevardier"],
    staticCoverPath: "/occasions/valentines.jpg",
    parentSlug: "holidays",
    matchExtra: (c) => /pink lady|clover club|aviation|amour/i.test(c.name || ""),
  },
  {
    slug: "st-patricks",
    name: "St. Patrick’s",
    headline: "Irish whiskey and emerald-hour pours",
    description: "Irish mules, whiskey highballs, and green-season classics for March gatherings.",
    accentClass: "from-olive/30 via-cream to-cream",
    matchTokens: ["st-patricks", "irish", "irish-whiskey"],
    coverSlugs: ["irish-mule", "irish-coffee", "blackthorn"],
    staticCoverPath: "/occasions/st-patricks.jpg",
    parentSlug: "holidays",
    matchExtra: (c) => /irish|blackthorn|shamrock/i.test(c.name || ""),
  },
  {
    slug: "party",
    name: "52 Crowd-Pleasing Cocktails",
    navName: "Crowd-Pleasers",
    headline: "The ones people actually ask for",
    description: "Familiar, colorful, and shareable drinks that scale for a gathering — easy to batch, easy to love.",
    accentClass: "from-terracotta/15 via-cream to-cream",
    matchTokens: ["party"],
    coverSlugs: ["long-island-iced-tea", "sangria", "electric-lemonade", "fuzzy-navel"],
    staticCoverPath: "/occasions/party.jpg",
  },
  {
    slug: "brunch",
    name: "Brunch",
    headline: "Morning-to-noon glasses",
    description: "Savory, sparkling, and light daytime drinks for late breakfasts and slow weekends.",
    accentClass: "from-olive/20 via-cream to-cream",
    matchTokens: ["brunch"],
    coverSlugs: ["bloody-caesar", "mimosa", "bellini", "virgin-mary"],
    staticCoverPath: "/occasions/brunch.jpg",
  },
  {
    slug: "zero-proof",
    name: "Zero-Proof",
    headline: "Full drinks without the alcohol",
    description: "Mocktails and non-alcoholic builds that still feel intentional — not an afterthought soda.",
    accentClass: "from-olive/30 via-cream to-cream",
    matchTokens: ["zero-proof", "mocktail"],
    coverSlugs: ["virgin-mojito", "hibiscus-cooler", "shirley-temple", "zero-proof-margarita"],
    staticCoverPath: "/occasions/zero-proof.jpg",
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
    staticCoverPath: "/occasions/aperitivo.jpg",
  },
  {
    slug: "tiki",
    name: "Tiki",
    headline: "Rum, spice, and crushed-ice theater",
    description: "Tropical classics and craft tiki builds — big flavor, garnish-forward, vacation energy.",
    accentClass: "from-olive/15 via-cream to-cream",
    matchTokens: ["tiki", "tiki-adjacent"],
    coverSlugs: ["mai-tai", "blue-hawaiian", "pina-colada", "jungle-bird"],
    staticCoverPath: "/occasions/tiki.jpg",
  },
  {
    slug: "classics",
    name: "Classics",
    headline: "The canon worth knowing by heart",
    description: "IBA and modern-classic builds that form the backbone of any home bar.",
    accentClass: "from-forest/20 via-cream to-cream",
    matchTokens: ["classic", "modern-classic", "iba", "pre-prohibition"],
    coverSlugs: ["manhattan", "negroni", "old-fashioned", "daiquiri"],
    staticCoverPath: "/occasions/classics.jpg",
  },
  {
    slug: "hot-drinks",
    name: "Hot Drinks",
    headline: "Steam, spice, and mug weather",
    description: "Toddies, mulled pours, and warming cups for cold nights.",
    accentClass: "from-terracotta/25 via-cream to-cream",
    matchTokens: ["hot", "toddy", "mulled"],
    coverSlugs: ["hot-toddy", "mulled-wine", "hot-buttered-rum", "wassail"],
    staticCoverPath: "/occasions/hot-drinks.jpg",
    matchExtra: (c) => /toddy|mulled|buttered rum|tom and jerry|irish coffee/i.test(c.name || ""),
  },
  {
    slug: "punch",
    name: "Punch",
    headline: "Batchable bowls for a crowd",
    description: "Punches, pitchers, and shareable builds meant for the table — not just one glass.",
    accentClass: "from-olive/20 via-cream to-cream",
    matchTokens: ["punch", "sharing", "hosting"],
    coverSlugs: ["sangria", "thanksgiving-punch", "apple-cider-punch", "fish-house-punch"],
    staticCoverPath: "/occasions/punch.jpg",
  },
  {
    slug: "dessert",
    name: "Dessert",
    headline: "After-dinner sweets in a glass",
    description: "Creamy, chocolate-leaning, and flip-style drinks that finish a meal.",
    accentClass: "from-terracotta/20 via-cream to-cream",
    matchTokens: ["dessert", "after-dinner", "flip", "digestif"],
    coverSlugs: ["porto-flip", "golden-dream", "stinger", "brandy-alexander"],
    staticCoverPath: "/occasions/dessert.jpg",
  },
];

/** Top-level collections shown on /occasions (excludes nested holiday children). */
export function getTopLevelOccasions(): OccasionDefinition[] {
  return OCCASIONS.filter((o) => !o.parentSlug);
}

/** US Thanksgiving = 4th Thursday of November */
function thanksgivingDate(year: number): Date {
  const nov1 = new Date(year, 10, 1);
  const weekday = nov1.getDay(); // 0 Sun … 4 Thu
  const firstThursday = 1 + ((4 - weekday + 7) % 7);
  return new Date(year, 10, firstThursday + 21);
}

/** Calendar anchors for holiday children (month is 0-indexed). */
const HOLIDAY_DATE: Record<string, { month: number; day: number } | "thanksgiving"> = {
  "new-years": { month: 0, day: 1 },
  valentines: { month: 1, day: 14 },
  "st-patricks": { month: 2, day: 17 },
  halloween: { month: 9, day: 31 },
  thanksgiving: "thanksgiving",
  christmas: { month: 11, day: 25 },
};

/** Next occurrence of a holiday on/after `from` (start of local day). */
export function nextHolidayOccurrence(slug: string, from: Date = new Date()): Date | null {
  const spec = HOLIDAY_DATE[slug];
  if (!spec) return null;

  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  const dateInYear = (year: number): Date => {
    if (spec === "thanksgiving") return thanksgivingDate(year);
    return new Date(year, spec.month, spec.day);
  };

  const thisYear = dateInYear(start.getFullYear());
  if (thisYear >= start) return thisYear;
  return dateInYear(start.getFullYear() + 1);
}

export function getChildOccasions(
  parent: OccasionDefinition,
  now: Date = new Date()
): OccasionDefinition[] {
  if (!parent.childSlugs?.length) return [];
  const children = parent.childSlugs
    .map((slug) => OCCASIONS.find((o) => o.slug === slug))
    .filter((o): o is OccasionDefinition => Boolean(o));

  // Holiday hub: chronological from the next upcoming holiday
  if (parent.slug === "holidays") {
    return [...children].sort((a, b) => {
      const aNext = nextHolidayOccurrence(a.slug, now)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bNext = nextHolidayOccurrence(b.slug, now)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aNext - bNext;
    });
  }

  return children;
}

export function getSiblingOccasions(occasion: OccasionDefinition): OccasionDefinition[] {
  if (!occasion.parentSlug) return [];
  const parent = getOccasion(occasion.parentSlug);
  if (!parent) return [];
  return getChildOccasions(parent).filter((o) => o.slug !== occasion.slug);
}

export function getRelatedOccasions(occasion: OccasionDefinition, limit = 4): OccasionDefinition[] {
  const siblings = getSiblingOccasions(occasion);
  if (siblings.length >= limit) return siblings.slice(0, limit);
  const exclude = new Set([occasion.slug, occasion.parentSlug, ...siblings.map((s) => s.slug)].filter(Boolean));
  const others = getTopLevelOccasions().filter((o) => !exclude.has(o.slug) && o.slug !== "holidays");
  return [...siblings, ...others].slice(0, limit);
}

export function getOccasionStaticCover(occasion: OccasionDefinition): string | null {
  return occasion.staticCoverPath || null;
}

export function resolveOccasionCoverUrl(
  occasion: OccasionDefinition,
  cocktails: OccasionCocktail[]
): string | null {
  const cover = pickOccasionCover(occasion, cocktails);
  return cover?.image_url || null;
}

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
  return occasion.matchTokens.some((token) => {
    const t = token.toLowerCase();
    if (bag.has(t)) return true;
    // Allow multi-word tokens via hyphen/space variants
    return [...bag].some((b) => b.includes(t) || t.includes(b));
  });
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
