import type { DirectoryIngredient } from "@/lib/ingredientTypes";

export type LibrarySectionId =
  | "spirits"
  | "fortified"
  | "liqueurs"
  | "citrus"
  | "mixers"
  | "pantry"
  | "also";

export type LibrarySection = {
  id: LibrarySectionId;
  title: string;
  dek: string;
};

/** Bottles that actually open a working bar — shown first, then again in their section. */
export const WORKING_BAR_SLUGS = [
  "gin",
  "vodka",
  "bourbon",
  "rye-whiskey",
  "white-rum",
  "light-rum",
  "tequila",
  "cognac",
  "sweet-vermouth",
  "dry-vermouth",
  "campari",
  "cointreau",
  "angostura-bitters",
  "lime-juice",
  "lemon-juice",
  "simple-syrup",
  "soda-water",
  "tonic-water",
] as const;

export const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: "spirits",
    title: "Base spirits",
    dek: "Distilled bases that set the drink’s structure: grain, agave, cane, and grape.",
  },
  {
    id: "fortified",
    title: "Fortified wine and aperitivi",
    dek: "Aromatized wines, sparkling wine, and the bitter aperitivi that sit between wine and liqueur.",
  },
  {
    id: "liqueurs",
    title: "Liqueurs and amari",
    dek: "Sweetened, flavored distillates used as modifiers — orange, herbal, cherry, coffee, almond.",
  },
  {
    id: "citrus",
    title: "Citrus, syrups, and bitters",
    dek: "Acid, sugar, and concentrated botanicals: the seasoning of sours, Old Fashioneds, and stirred drinks.",
  },
  {
    id: "mixers",
    title: "Mixers and lengtheners",
    dek: "Carbonated and still liquids that turn a short drink into a highball or spritz.",
  },
  {
    id: "pantry",
    title: "Garnish and pantry",
    dek: "Herbs, peels, eggs, coffee, and dry goods that finish or texture a cocktail.",
  },
  {
    id: "also",
    title: "Also catalogued",
    dek: "Bottles and products in the MixWise inventory that rarely appear in the recipe library.",
  },
];

const SPIRIT_SLUGS = new Set([
  "gin",
  "vodka",
  "bourbon",
  "rye-whiskey",
  "rye",
  "scotch",
  "blended-scotch",
  "irish-whiskey",
  "whiskey",
  "whisky",
  "tequila",
  "mezcal",
  "rum",
  "white-rum",
  "light-rum",
  "dark-rum",
  "cognac",
  "brandy",
  "apple-brandy",
  "pisco",
  "absinthe",
  "apricot-brandy",
  "vanilla-vodka",
  "citrus-vodka",
]);

const FORTIFIED_SLUGS = new Set([
  "sweet-vermouth",
  "dry-vermouth",
  "vermouth",
  "prosecco",
  "champagne",
  "sherry",
  "campari",
  "aperol",
  "rose",
]);

const LIQUEUR_SLUGS = new Set([
  "cointreau",
  "triple-sec",
  "grand-marnier",
  "green-chartreuse",
  "yellow-chartreuse",
  "maraschino-liqueur",
  "amaretto",
  "amaretto-liqueur",
  "coffee-liqueur",
  "kahlua",
  "irish-cream",
  "baileys-irish-cream",
  "benedictine",
  "cherry-heering",
  "cherry-liqueur",
  "falernum",
  "drambuie",
  "galliano",
  "jagermeister",
  "chambord-raspberry-liqueur",
  "strawberry-liqueur",
  "butterscotch-schnapps",
  "white-creme-de-menthe",
  "sloe-gin",
  "amaro-montenegro",
  "sambuca",
  "banana-liqueur",
  "peach-schnapps",
  "dark-creme-de-cacao",
]);

const CITRUS_SLUGS = new Set([
  "lime-juice",
  "lemon-juice",
  "fresh-lemon-juice",
  "grapefruit-juice",
  "orange-juice",
  "simple-syrup",
  "sugar-syrup",
  "agave-syrup",
  "honey-syrup",
  "mint-syrup",
  "orgeat-syrup",
  "grenadine",
  "angostura-bitters",
  "orange-bitters",
  "bitters",
  "honey",
  "pineapple-juice",
  "cranberry-juice",
  "cherry-juice",
  "sour-mix",
  "raspberry-syrup",
  "ginger-syrup",
]);

const MIXER_SLUGS = new Set([
  "soda-water",
  "club-soda",
  "tonic-water",
  "ginger-beer",
  "cola",
  "apple-juice",
  "beer",
]);

const PANTRY_SLUGS = new Set([
  "mint",
  "orange-peel",
  "egg",
  "espresso",
  "salt",
  "sugar",
  "ice",
  "water",
  "cream",
  "heavy-cream",
  "whipped-cream",
  "demerara-sugar",
  "nutmeg",
  "mango",
  "kiwi",
  "pineapple",
  "cucumber",
]);

const ALSO_SLUGS = new Set([
  "mountain-dew",
  "everclear",
  "corona",
  "fruit",
  "wormwood",
  "bacardi-limon",
]);

function typeKey(type: string): string {
  return type.toLowerCase();
}

function fallbackSection(ingredient: DirectoryIngredient): LibrarySectionId {
  const t = typeKey(ingredient.type);
  if (t.includes("spirit") || t.includes("whiskey") || t.includes("whisky")) return "spirits";
  if (t.includes("vermouth") || t.includes("wine") || t.includes("aperitiv")) return "fortified";
  if (t.includes("liqueur") || t.includes("amaro") || t.includes("schnapps")) return "liqueurs";
  if (t.includes("bitter") || t.includes("syrup") || t.includes("citrus") || t.includes("juice")) return "citrus";
  if (t.includes("mixer") || t.includes("soda") || t.includes("beer")) return "mixers";
  if (t.includes("garnish") || t.includes("herb") || t.includes("other")) return "pantry";
  return "also";
}

export function classifyIngredient(ingredient: DirectoryIngredient): LibrarySectionId {
  const slug = ingredient.slug;
  if (ALSO_SLUGS.has(slug) || ingredient.cocktailCount === 0) return "also";
  if (SPIRIT_SLUGS.has(slug)) return "spirits";
  if (FORTIFIED_SLUGS.has(slug)) return "fortified";
  if (LIQUEUR_SLUGS.has(slug)) return "liqueurs";
  if (CITRUS_SLUGS.has(slug)) return "citrus";
  if (MIXER_SLUGS.has(slug)) return "mixers";
  if (PANTRY_SLUGS.has(slug)) return "pantry";
  return fallbackSection(ingredient);
}

export function sortByUsefulness(a: DirectoryIngredient, b: DirectoryIngredient): number {
  if (b.cocktailCount !== a.cocktailCount) return b.cocktailCount - a.cocktailCount;
  if (Boolean(b.hasGuide) !== Boolean(a.hasGuide)) return a.hasGuide ? -1 : 1;
  return a.name.localeCompare(b.name);
}

export function workingBarIngredients(ingredients: DirectoryIngredient[]): DirectoryIngredient[] {
  const bySlug = new Map(ingredients.map((item) => [item.slug, item]));
  return WORKING_BAR_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (item): item is DirectoryIngredient => Boolean(item)
  );
}

const SPIRIT_BROWSE_QUERY: Record<string, string> = {
  gin: "gin",
  vodka: "vodka",
  bourbon: "bourbon",
  rye: "whiskey",
  "rye-whiskey": "whiskey",
  scotch: "scotch",
  "blended-scotch": "scotch",
  whiskey: "whiskey",
  whisky: "whiskey",
  "irish-whiskey": "whiskey",
  tequila: "tequila",
  mezcal: "mezcal",
  rum: "rum",
  "white-rum": "rum",
  "light-rum": "rum",
  "dark-rum": "rum",
  cognac: "cognac",
  brandy: "brandy",
  "apple-brandy": "brandy",
};

/** Recipe-library URL that opens already filtered to this bottle. */
export function cocktailBrowseHref(ingredient: Pick<DirectoryIngredient, "slug" | "name">): string {
  const spirit = SPIRIT_BROWSE_QUERY[ingredient.slug];
  if (spirit) return `/cocktails?spirit=${encodeURIComponent(spirit)}`;
  return `/cocktails?ingredient=${encodeURIComponent(ingredient.name)}`;
}

export type IngredientWayfinder = {
  sectionId: LibrarySectionId;
  sectionTitle: string;
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
};

export function getIngredientWayfinder(
  ingredient: DirectoryIngredient,
  directory: DirectoryIngredient[]
): IngredientWayfinder {
  const sectionId = classifyIngredient(ingredient);
  const sectionTitle = LIBRARY_SECTIONS.find((section) => section.id === sectionId)?.title || "Library";
  const siblings = groupIngredients(directory)[sectionId];
  const index = siblings.findIndex((item) => item.slug === ingredient.slug);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  return {
    sectionId,
    sectionTitle,
    prev: prev ? { slug: prev.slug, name: prev.name } : null,
    next: next ? { slug: next.slug, name: next.name } : null,
  };
}

export function groupIngredients(
  ingredients: DirectoryIngredient[]
): Record<LibrarySectionId, DirectoryIngredient[]> {
  const groups = Object.fromEntries(LIBRARY_SECTIONS.map((section) => [section.id, [] as DirectoryIngredient[]])) as Record<
    LibrarySectionId,
    DirectoryIngredient[]
  >;

  for (const ingredient of ingredients) {
    groups[classifyIngredient(ingredient)].push(ingredient);
  }

  for (const section of LIBRARY_SECTIONS) {
    groups[section.id].sort(sortByUsefulness);
  }

  return groups;
}
