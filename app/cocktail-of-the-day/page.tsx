import { redirect } from "next/navigation";
import { getDailyIndexFromCount } from "@/lib/dailyCocktail";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

export default async function CocktailOfTheDayPage() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      redirect("/cocktails");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Count only cocktails that have a non-null slug so redirects never point to nowhere.
    const { count, error: countError } = await supabase
      .from("cocktails")
      .select("id", { count: "exact", head: true })
      .not("slug", "is", null);

    if (countError || !count || count <= 0) {
      redirect("/cocktails");
    }

    const index = getDailyIndexFromCount(count, new Date());

    // Deterministic ordering by slug ensures index mapping is stable.
    const { data, error } = await supabase
      .from("cocktails")
      .select("slug")
      .not("slug", "is", null)
      .order("slug", { ascending: true })
      .range(index, index);

    const slug = data?.[0]?.slug ?? null;

    if (error || !slug) {
      redirect("/cocktails");
    }

    redirect(`/cocktails/${encodeURIComponent(String(slug))}?daily=true`);
  } catch (error) {
    console.error("Error determining daily cocktail:", error);
    redirect("/cocktails");
  }
}
