import { cache } from "react";
import { getMixCocktails, getStapleIngredientIds } from "@/lib/cocktails.server";
import { getIngredientsDirectory, type DirectoryIngredient } from "@/lib/ingredients.server";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixMatchResult } from "@/lib/mixTypes";

/** Common query words people (and models) use that are not our catalog slugs. */
const SLUG_ALIASES: Record<string, string> = {
  lime: "lime-juice",
  lemon: "lemon-juice",
  grapefruit: "grapefruit-juice",
  orange: "orange-juice",
  bitters: "angostura-bitters",
  angostura: "angostura-bitters",
  tonic: "tonic-water",
  soda: "soda-water",
  "soda-water": "soda-water",
  "club-soda": "soda-water",
  simple: "simple-syrup",
  syrup: "simple-syrup",
  "orange-liqueur": "triple-sec",
  whiskey: "whiskey",
  whisky: "whiskey",
  rye: "rye-whiskey",
  cranberry: "cranberry-juice",
  pineapple: "pineapple-juice",
  ginger: "ginger-beer",
  cola: "cola",
};

const MAKE_WITH_COMBOS_RAW: string[][] = [
  ["gin", "lime-juice"],
  ["gin", "lemon-juice"],
  ["gin", "tonic-water"],
  ["gin", "dry-vermouth"],
  ["gin", "campari", "sweet-vermouth"],
  ["vodka", "lime-juice"],
  ["vodka", "coffee-liqueur"],
  ["white-rum", "lime-juice", "simple-syrup"],
  ["rum", "lime-juice"],
  ["tequila", "lime-juice"],
  ["tequila", "lime-juice", "triple-sec"],
  ["bourbon", "angostura-bitters"],
  ["bourbon", "lemon-juice", "simple-syrup"],
  ["whiskey", "angostura-bitters", "simple-syrup"],
  ["aperol", "prosecco"],
  ["mezcal", "lime-juice"],
  ["gin"],
  ["tequila"],
  ["bourbon"],
  ["vodka"],
  ["rum"],
  ["mezcal"],
  ["whiskey"],
  ["rye-whiskey"],
  ["scotch"],
  ["cognac"],
  ["champagne"],
  ["aperol"],
  ["vodka", "orange-juice"],
  ["vodka", "cranberry-juice"],
  ["vodka", "ginger-beer"],
  ["vodka", "espresso"],
  ["gin", "ginger-beer"],
  ["gin", "soda-water"],
  ["gin", "grapefruit-juice"],
  ["gin", "campari"],
  ["rum", "ginger-beer"],
  ["rum", "cola"],
  ["rum", "pineapple-juice"],
  ["white-rum", "mint"],
  ["tequila", "grapefruit-juice"],
  ["tequila", "soda-water"],
  ["mezcal", "grapefruit-juice"],
  ["bourbon", "ginger-beer"],
  ["bourbon", "sweet-vermouth"],
  ["rye-whiskey", "sweet-vermouth"],
  ["whiskey", "lemon-juice"],
  ["whiskey", "ginger-beer"],
  ["campari", "soda-water"],
  ["champagne", "orange-juice"],
  ["amaretto", "lemon-juice"],
  ["pisco", "lime-juice"],
  ["cognac", "lemon-juice"],
  ["white-rum", "lime-juice", "mint"],
  ["vodka", "lime-juice", "ginger-beer"],
  ["vodka", "triple-sec", "cranberry-juice"],
  ["gin", "lemon-juice", "soda-water"],
  ["gin", "lemon-juice", "simple-syrup"],
  ["rye-whiskey", "sweet-vermouth", "angostura-bitters"],
  ["tequila", "grapefruit-juice", "soda-water"],
  ["tequila", "lime-juice", "agave-syrup"],
  ["bourbon", "sweet-vermouth", "angostura-bitters"],
  ["vodka", "coffee-liqueur", "espresso"],
];

function uniqueMakeWithCombos(combos: string[][]): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const combo of combos) {
    const key = [...new Set(combo.map((s) => s.toLowerCase()).filter(Boolean))].sort().join("/");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(combo);
  }
  return out;
}

/**
 * High-intent cabinets for sitemap + /make-with index.
 * Slugs are canonical catalog slugs; URLs are sorted alphabetically.
 */
export const MAKE_WITH_COMBOS: string[][] = uniqueMakeWithCombos(MAKE_WITH_COMBOS_RAW);

const MAKE_WITH_GROUP_ORDER = [
  "gin",
  "vodka",
  "rum",
  "white-rum",
  "tequila",
  "mezcal",
  "bourbon",
  "whiskey",
  "rye-whiskey",
  "cognac",
  "pisco",
  "amaretto",
  "aperol",
  "campari",
  "champagne",
] as const;

const MAKE_WITH_GROUP_LABELS: Record<string, string> = {
  gin: "Gin",
  vodka: "Vodka",
  rum: "Rum",
  "white-rum": "White rum",
  tequila: "Tequila",
  mezcal: "Mezcal",
  bourbon: "Bourbon",
  whiskey: "Whiskey",
  "rye-whiskey": "Rye Whiskey",
  cognac: "Cognac",
  pisco: "Pisco",
  amaretto: "Amaretto",
  aperol: "Aperol",
  campari: "Campari",
  champagne: "Sparkling",
};

export type MakeWithIndexGroup = {
  heading: string;
  combos: string[][];
};

/** Two-or-more bottle combos grouped for the /make-with index. */
export function makeWithIndexGroups(): MakeWithIndexGroup[] {
  const multi = MAKE_WITH_COMBOS.filter((combo) => combo.length >= 2);
  const buckets = new Map<string, string[][]>();

  for (const combo of multi) {
    const key = MAKE_WITH_GROUP_ORDER.find((slug) => combo.includes(slug)) || "more";
    const list = buckets.get(key) || [];
    list.push(combo);
    buckets.set(key, list);
  }

  return MAKE_WITH_GROUP_ORDER.filter((slug) => buckets.has(slug)).map((slug) => ({
    heading: MAKE_WITH_GROUP_LABELS[slug] || slug,
    combos: buckets.get(slug) || [],
  }));
}

export function canonicalMakeWithPath(slugs: string[]): string {
  const unique = [...new Set(slugs.map((s) => s.toLowerCase()).filter(Boolean))].sort();
  return `/make-with/${unique.join("/")}`;
}

export function formatEnglishList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function displayNameList(ingredients: DirectoryIngredient[]): string {
  const ordered = [...ingredients].sort((a, b) => spiritScore(a) - spiritScore(b) || a.name.localeCompare(b.name));
  return formatEnglishList(ordered.map((item) => item.name.toLowerCase()));
}

function spiritScore(ingredient: DirectoryIngredient): number {
  const type = ingredient.type.toLowerCase();
  if (type.includes("spirit")) return 0;
  if (type.includes("liqueur") || type.includes("amaro")) return 1;
  if (type.includes("vermouth") || type.includes("wine")) return 2;
  return 3;
}

export function resolveMakeWithSlug(
  raw: string,
  directory: DirectoryIngredient[]
): DirectoryIngredient | null {
  const slug = slugifyIngredientName(raw);
  if (!slug) return null;

  const aliased = SLUG_ALIASES[slug] || slug;
  const bySlug = new Map(directory.map((item) => [item.slug, item]));

  const exact = bySlug.get(aliased) || bySlug.get(slug);
  if (exact) return exact;

  for (const suffix of ["-juice", "-syrup", "-water", "-bitters", "-liqueur"]) {
    const withSuffix = bySlug.get(`${slug}${suffix}`);
    if (withSuffix) return withSuffix;
  }

  return null;
}

export function resolveMakeWithIngredients(
  rawSlugs: string[],
  directory: DirectoryIngredient[]
): DirectoryIngredient[] {
  const resolved: DirectoryIngredient[] = [];
  const seen = new Set<string>();

  for (const raw of rawSlugs) {
    const match = resolveMakeWithSlug(raw, directory);
    if (!match || seen.has(match.id)) continue;
    seen.add(match.id);
    resolved.push(match);
  }

  return resolved;
}

export type MakeWithPageData = {
  ingredients: DirectoryIngredient[];
  canonicalPath: string;
  mixHref: string;
  nameList: string;
  ready: MixMatchResult[];
  almostThere: MixMatchResult[];
};

export const getMakeWithPageData = cache(async (rawSlugs: string[]): Promise<MakeWithPageData | null> => {
  const directory = await getIngredientsDirectory();
  const ingredients = resolveMakeWithIngredients(rawSlugs, directory);
  if (ingredients.length === 0) return null;

  const canonicalPath = canonicalMakeWithPath(ingredients.map((item) => item.slug));
  const mixHref = `/mix?have=${ingredients.map((item) => item.slug).sort().join(",")}`;
  const nameList = displayNameList(ingredients);

  const [cocktails, stapleIngredientIds] = await Promise.all([
    getMixCocktails(),
    getStapleIngredientIds(),
  ]);

  const groups = getMixMatchGroups({
    cocktails,
    ownedIngredientIds: ingredients.map((item) => item.id),
    stapleIngredientIds,
    maxMissing: 1,
  });

  return {
    ingredients,
    canonicalPath,
    mixHref,
    nameList,
    ready: groups.ready.slice(0, 24),
    almostThere: groups.almostThere.slice(0, 12),
  };
});

export function makeWithComboLabel(slugs: string[]): string {
  return formatEnglishList(slugs.map((slug) => slug.replace(/-/g, " ")));
}
