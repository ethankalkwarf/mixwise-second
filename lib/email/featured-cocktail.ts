/**
 * Shared logic for picking a featured cocktail for email campaigns.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { formatCocktailName } from "@/lib/formatters";

export const WELCOME_COCKTAIL_SLUGS = [
  "french-75",
  "whiskey-sour",
  "espresso-martini",
  "gimlet",
  "daiquiri",
  "margarita",
  "aperol-spritz",
] as const;

export interface FeaturedCocktailForEmail {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  ingredients?: string;
  instructions?: string;
}

function formatIngredients(
  ingredients: unknown
): string | undefined {
  if (!ingredients) return undefined;
  if (typeof ingredients === "string") return ingredients;
  if (!Array.isArray(ingredients)) return undefined;

  const lines = ingredients
    .map((ing) => {
      if (typeof ing === "object" && ing !== null) {
        const row = ing as { amount?: string; name?: string };
        if (row.amount && row.name) return `${row.amount} ${row.name}`;
        if (row.name) return row.name;
      }
      return typeof ing === "string" ? ing : "";
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : undefined;
}

function formatInstructions(instructions: unknown): string | undefined {
  if (!instructions) return undefined;
  if (typeof instructions === "string") return instructions;
  if (!Array.isArray(instructions)) return undefined;

  const lines = instructions
    .map((inst, idx) => {
      if (typeof inst === "object" && inst !== null) {
        const row = inst as { instruction?: string };
        if (row.instruction) return `${idx + 1}. ${row.instruction}`;
      }
      return typeof inst === "string" ? `${idx + 1}. ${inst}` : "";
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : undefined;
}

/**
 * Picks a cocktail for email content. Uses week number for deterministic rotation when seed is provided.
 */
export async function getFeaturedCocktailForEmail(options?: {
  weekSeed?: number;
  preferImages?: boolean;
  slugs?: readonly string[];
}): Promise<FeaturedCocktailForEmail | undefined> {
  const preferImages = options?.preferImages ?? true;

  try {
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
      .from("cocktails")
      .select("name, slug, short_description, image_url, ingredients, instructions")
      .limit(80);

    if (options?.slugs?.length) {
      query = query.in("slug", [...options.slugs]);
    }

    if (preferImages) {
      query = query.not("image_url", "is", null);
    }

    const { data: cocktails, error } = await query;
    if (error) {
      console.error("[Featured Cocktail] Query failed:", error);
      return undefined;
    }

    const pool = cocktails || [];
    if (pool.length === 0) return undefined;

    const index =
      options?.weekSeed !== undefined
        ? options.weekSeed % pool.length
        : Math.floor(Math.random() * pool.length);

    const selected = pool[index];
    if (!selected) return undefined;

    return {
      name: formatCocktailName(selected.name),
      slug: selected.slug,
      description: selected.short_description || undefined,
      imageUrl: selected.image_url || undefined,
      ingredients: formatIngredients(selected.ingredients),
      instructions: formatInstructions(selected.instructions),
    };
  } catch (error) {
    console.error("[Featured Cocktail] Failed to load cocktail:", error);
    return undefined;
  }
}

export function getWeekNumber(date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
}
