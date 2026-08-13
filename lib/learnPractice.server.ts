import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { OccasionCocktail } from "@/lib/occasions";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Resolve catalog cocktails for Learn "practice these" grids.
 * Preserves requested order; skips missing slugs quietly.
 */
export async function getPracticeCocktails(slugs: string[]): Promise<OccasionCocktail[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return [];

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("cocktails")
      .select(
        "id, slug, name, short_description, base_spirit, category_primary, tags, categories_all, image_url, image_alt, created_at"
      )
      .in("slug", unique);

    if (error || !data) {
      console.error("[getPracticeCocktails]", error?.message);
      return [];
    }

    const bySlug = new Map(data.map((row) => [row.slug as string, row as OccasionCocktail]));
    return unique.map((slug) => bySlug.get(slug)).filter((c): c is OccasionCocktail => Boolean(c));
  } catch (err) {
    console.error("[getPracticeCocktails]", err);
    return [];
  }
}
