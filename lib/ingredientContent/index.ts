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

/** Canonical slug for a finished public guide, including alias lookups. */
export function publishedIngredientSlug(slug: string): string | null {
  return getIngredientGuide(slug)?.slug || null;
}

/** True only for the canonical URL of a finished guide — not aliases, not stubs. */
export function isPublishedIngredientSlug(slug: string): boolean {
  const guide = getIngredientGuide(slug);
  return Boolean(guide && guide.slug === slug);
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

