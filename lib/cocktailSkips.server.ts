import { createServerClient, getServerUser } from "@/lib/supabase/server";

export async function getCurrentUserSkippedCocktailIds(): Promise<Set<string>> {
  const user = await getServerUser();
  if (!user) return new Set();
  return getSkippedCocktailIdsForUser(user.id);
}

export async function getSkippedCocktailIdsForUser(
  userId: string
): Promise<Set<string>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("cocktail_skips")
    .select("cocktail_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading cocktail skips:", error);
    return new Set();
  }

  return new Set((data || []).map((row) => row.cocktail_id));
}
