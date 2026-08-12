import { createClient } from "@supabase/supabase-js";
import type { DirectoryIngredient, IngredientCocktail, IngredientDetail } from "@/lib/ingredientTypes";

export type { DirectoryIngredient, IngredientCocktail, IngredientDetail };

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export function slugifyIngredientName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function fetchCocktailCounts(): Promise<Map<string, number>> {
  const supabase = createServerSupabaseClient();
  const counts = new Map<string, number>();

  const { data, error } = await supabase
    .from("cocktail_ingredients_uuid")
    .select("ingredient_id");

  if (error || !data) {
    return counts;
  }

  for (const row of data as Array<{ ingredient_id: string | number }>) {
    const key = String(row.ingredient_id);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function toDirectoryItem(
  row: IngredientRow,
  slug: string,
  cocktailCount: number
): DirectoryIngredient {
  return {
    id: String(row.id),
    name: row.name || "Untitled",
    slug,
    type: row.type || row.category || "other",
    imageUrl: row.image_url || null,
    isStaple: Boolean(row.is_staple),
    cocktailCount,
  };
}

export async function getIngredientsDirectory(): Promise<DirectoryIngredient[]> {
  const [rows, counts] = await Promise.all([fetchIngredientRows(), fetchCocktailCounts()]);
  const named = rows.filter((row) => row.name);
  const slugs = assignSlugs(named.map((row) => ({ id: String(row.id), name: row.name as string })));

  return named
    .map((row) =>
      toDirectoryItem(row, slugs.get(String(row.id)) || slugifyIngredientName(row.name || ""), counts.get(String(row.id)) || 0)
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getIngredientBySlug(slug: string): Promise<IngredientDetail | null> {
  const directory = await getIngredientsDirectory();
  const ingredient = directory.find((item) => item.slug === slug);
  if (!ingredient) return null;

  const supabase = createServerSupabaseClient();
  const { data: links, error: linkError } = await supabase
    .from("cocktail_ingredients_uuid")
    .select("cocktail_id")
    .eq("ingredient_id", ingredient.id);

  let cocktailIds = (links || []).map((row: { cocktail_id: string }) => String(row.cocktail_id));

  if (linkError || cocktailIds.length === 0) {
    const numericId = Number(ingredient.id);
    if (!Number.isNaN(numericId)) {
      const { data: numericLinks } = await supabase
        .from("cocktail_ingredients_uuid")
        .select("cocktail_id")
        .eq("ingredient_id", numericId);
      cocktailIds = (numericLinks || []).map((row: { cocktail_id: string }) => String(row.cocktail_id));
    }
  }

  let cocktails: IngredientCocktail[] = [];
  if (cocktailIds.length > 0) {
    const { data: cocktailRows } = await supabase
      .from("cocktails")
      .select("id, name, slug, image_url, base_spirit")
      .in("id", cocktailIds.slice(0, 24))
      .order("name");

    cocktails = (cocktailRows || []).map((c: {
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      base_spirit: string | null;
    }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url,
      primarySpirit: c.base_spirit,
    }));
  }

  return { ...ingredient, cocktails };
}
