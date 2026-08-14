import type { IngredientGuide } from "./types";
import { SPIRIT_GUIDES } from "./spirits";
import { LIQUEUR_GUIDES } from "./liqueurs";
import { MODIFIER_GUIDES } from "./modifiers";

const GUIDES: IngredientGuide[] = [...SPIRIT_GUIDES, ...LIQUEUR_GUIDES, ...MODIFIER_GUIDES];

const bySlug = new Map<string, IngredientGuide>();
for (const guide of GUIDES) {
  bySlug.set(guide.slug, guide);
  for (const alias of guide.aliases || []) {
    if (!bySlug.has(alias)) {
      bySlug.set(alias, guide);
    }
  }
}

export function getIngredientGuide(slug: string): IngredientGuide | null {
  return bySlug.get(slug) || null;
}

export function hasIngredientGuide(slug: string): boolean {
  return bySlug.has(slug);
}

export function listIngredientGuideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}

/** Title tag (site name is appended). Keep under ~60 characters when possible. */
export function ingredientMetaTitle(name: string): string {
  const full = `What is ${name}? Taste, History, and Cocktails`;
  if (full.length <= 58) return full;
  const mid = `What is ${name}? Cocktails and How to Use It`;
  if (mid.length <= 58) return mid;
  return `What is ${name}?`;
}

export function ingredientMetaDescription(name: string, existing?: string): string {
  if (existing && existing.length >= 80) return existing;
  return `What is ${name}? How it tastes, where it comes from, how to use it in cocktails, and MixWise recipes that call for it.`;
}

export function ingredientHeadings(name: string) {
  return {
    h1: `What is ${name}?`,
    what: `What ${name} is`,
    taste: `What ${name} tastes like`,
    history: `${name} origin and history`,
    use: `How to use ${name} in cocktails`,
    pairs: `What pairs with ${name}`,
    drinks: `Cocktails you can make with ${name}`,
  };
}

function categoryPhrase(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("spirit")) return "spirit";
  if (t.includes("liqueur") || t.includes("amaro")) return "liqueur";
  if (t.includes("bitter")) return "bitters";
  if (t.includes("syrup")) return "syrup";
  if (t.includes("citrus")) return "citrus";
  if (t.includes("wine") || t.includes("vermouth") || t.includes("beer")) return "wine or beer";
  if (t.includes("garnish")) return "garnish";
  if (t.includes("mixer")) return "mixer";
  return "cocktail ingredient";
}

export function fallbackIngredientGuide(args: {
  slug: string;
  name: string;
  type: string;
  cocktailCount: number;
}): IngredientGuide {
  const kind = categoryPhrase(args.type);
  const countLine =
    args.cocktailCount > 0
      ? `It currently matches ${args.cocktailCount} cocktail${args.cocktailCount === 1 ? "" : "s"} in the MixWise library.`
      : "It does not yet match a MixWise recipe by name; this page remains the catalog entry when a spec calls for it.";

  return {
    slug: args.slug,
    seoTitle: args.name,
    seoDescription: `What is ${args.name}? A ${kind} used in cocktails — taste, how to use it, and MixWise recipes that call for it.`,
    dek: `${args.name} is catalogued as a ${kind}. ${countLine}`,
    tastingNotes: `Taste ${args.name} on its own before building a drink around it. Match it to recipes that name it rather than forcing it into a template written for a different ${kind}.`,
    whatItIs: `${args.name} appears in MixWise as a ${kind}. This is a catalog stub rather than a full monograph: the drinks list below is the evidence of how the library uses it.\n\nIf you already have a bottle, add it to your bar and use Mix to see what you can make. When substituting, stay inside the same category and expect the drink’s structure — sweetness, bitterness, proof — to shift.`,
    history: `MixWise has not yet published a full origin note for ${args.name}. For most home-bar purposes the useful questions are which templates call for it, and whether those drinks share other bottles you already own.`,
    howToUse: `Use ${args.name} when a recipe lists it. Fresh juices and vermouths oxidize in the refrigerator; distilled spirits and most liqueurs are stable at room temperature. If you are substituting, stay inside the same category (${kind}) and taste rather than assuming a one-to-one swap.`,
    pairsWith: [],
    signatureSlugs: [],
  };
}
