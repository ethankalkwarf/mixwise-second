import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { DirectoryIngredient, IngredientCocktail, IngredientDetail } from "@/lib/ingredientTypes";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { getCocktailsList } from "@/lib/cocktails.server";
import { getIngredientGuide } from "@/lib/ingredientContent";
import { cocktailUsesIngredient, isSpiritType } from "@/lib/ingredientCocktailMatch";
import { upgradeIngredientImageUrl } from "@/lib/ingredientImages";
import type { CocktailListItem } from "@/lib/cocktailTypes";

export type { DirectoryIngredient, IngredientCocktail, IngredientDetail };
export { slugifyIngredientName };

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function assignSlugs(rows: Array<{ id: string; name: string }>): Map<string, string> {
  const used = new Set<string>();
  const slugs = new Map<string, string>();

  for (const row of rows) {
    let slug = slugifyIngredientName(row.name) || row.id.slice(0, 8);
    if (used.has(slug)) {
      slug = `${slug}-${row.id.replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase()}`;
    }
    used.add(slug);
    slugs.set(row.id, slug);
  }

  return slugs;
}

type IngredientRow = {
  id: string | number;
  name: string | null;
  category?: string | null;
  type?: string | null;
  image_url?: string | null;
  is_staple?: boolean | null;
};

async function fetchIngredientRows(): Promise<IngredientRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, category, image_url, is_staple");

  if (error) {
    console.error("[ingredients] Failed to fetch ingredients:", error.message);
    return [];
  }

  return (data || []) as IngredientRow[];
}

const getCocktailsForIngredientPages = cache(async () => {
  return getCocktailsList({ includeIngredients: true });
});

function extraNamesForIngredient(ingredient: DirectoryIngredient): string[] {
  return getIngredientGuide(ingredient.slug)?.matchNames || [];
}

function cocktailsUsingIngredient(
  ingredient: DirectoryIngredient,
  cocktails: CocktailListItem[],
  extraNames: string[]
): CocktailListItem[] {
  const guide = getIngredientGuide(ingredient.slug);
  const signature = new Set(guide?.signatureSlugs || []);
  const matchBaseSpirit = isSpiritType(ingredient.type);
  const matched: CocktailListItem[] = [];
  const pinned: CocktailListItem[] = [];
  const seen = new Set<string>();

  for (const cocktail of cocktails) {
    const uses = cocktailUsesIngredient({
      ingredientName: ingredient.name,
      extraNames,
      matchBaseSpirit,
      ingredientNames: cocktail.ingredientNames || [],
      baseSpirit: cocktail.base_spirit,
    });
    const isSignature = signature.has(cocktail.slug);
    if (!uses && !isSignature) continue;
    if (seen.has(cocktail.id)) continue;
    seen.add(cocktail.id);
    if (isSignature) pinned.push(cocktail);
    else matched.push(cocktail);
  }

  matched.sort((a, b) => a.name.localeCompare(b.name));
  return [...pinned, ...matched];
}

function toDirectoryItem(row: IngredientRow, slug: string, cocktailCount: number): DirectoryIngredient {
  const guide = getIngredientGuide(slug);
  return {
    id: String(row.id),
    name: row.name || "Untitled",
    slug,
    type: row.type || row.category || "other",
    imageUrl: upgradeIngredientImageUrl(row.image_url) || row.image_url || null,
    isStaple: Boolean(row.is_staple),
    cocktailCount,
    hasGuide: Boolean(guide && guide.slug === slug),
    dek: guide?.dek,
  };
}

function toIngredientCocktail(cocktail: CocktailListItem): IngredientCocktail {
  return {
    id: cocktail.id,
    name: cocktail.name,
    slug: cocktail.slug,
    imageUrl: cocktail.image_url || null,
    imageAlt: cocktail.image_alt || cocktail.name,
    primarySpirit: cocktail.base_spirit || null,
    shortDescription: cocktail.short_description || null,
    category: cocktail.category_primary || null,
    createdAt: cocktail.created_at || null,
  };
}

export const getIngredientsDirectory = cache(async (): Promise<DirectoryIngredient[]> => {
  const [rows, cocktails] = await Promise.all([fetchIngredientRows(), getCocktailsForIngredientPages()]);
  const named = rows.filter((row) => row.name);
  const slugs = assignSlugs(named.map((row) => ({ id: String(row.id), name: row.name as string })));

  const draft: DirectoryIngredient[] = named.map((row) =>
    toDirectoryItem(row, slugs.get(String(row.id)) || slugifyIngredientName(row.name || ""), 0)
  );

  return draft
    .map((item) => {
      const extraNames = extraNamesForIngredient(item);
      const count = cocktailsUsingIngredient(item, cocktails, extraNames).length;
      return { ...item, cocktailCount: count };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

export const getIngredientBySlug = cache(async (slug: string): Promise<IngredientDetail | null> => {
  const [directory, cocktails] = await Promise.all([
    getIngredientsDirectory(),
    getCocktailsForIngredientPages(),
  ]);
  const ingredient = directory.find((item) => item.slug === slug);
  if (!ingredient) return null;

  const extraNames = extraNamesForIngredient(ingredient);
  const matched = cocktailsUsingIngredient(ingredient, cocktails, extraNames).map(toIngredientCocktail);
  const guide = getIngredientGuide(slug);
  const related = (guide?.pairsWith || [])
    .map((pairSlug) => directory.find((item) => item.slug === pairSlug))
    .filter(
      (item): item is DirectoryIngredient =>
        !!item && item.slug !== slug && Boolean(item.hasGuide)
    );

  return {
    ...ingredient,
    cocktailCount: matched.length,
    cocktails: matched,
    related,
    heroImageUrl: ingredient.imageUrl,
    heroImageAlt: `${ingredient.name} bottle used in cocktails`,
    heroIsCocktailPhoto: false,
  };
});
