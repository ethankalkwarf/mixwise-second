/**
 * Helpers for weekly digest personalization.
 * Recipe links live in cocktail_ingredients_uuid (UUID cocktail_id + numeric ingredient_id).
 */

export type DigestCocktail = {
  id: number | string;
  slug: string;
  name: string;
  short_description?: string | null;
  image_url?: string | null;
};

export type DigestCocktailCard = {
  name: string;
  slug: string;
  imageUrl?: string;
};

/**
 * Build cocktail_id → required ingredient_id[] from cocktail_ingredients rows.
 */
export function buildCocktailIngredientMap(
  rows: Array<{ cocktail_id: number | string; ingredient_id: number | string }>
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const cocktailKey = String(row.cocktail_id);
    const ingredientKey = String(row.ingredient_id);
    const existing = map.get(cocktailKey) || [];
    existing.push(ingredientKey);
    map.set(cocktailKey, existing);
  }
  return map;
}

/**
 * Return cocktails the user can make with their bar (all required ingredients present).
 */
export function cocktailsUserCanMakeFromBar(
  cocktails: DigestCocktail[],
  ownedIngredientIds: string[],
  ingredientsByCocktail: Map<string, string[]>
): DigestCocktailCard[] {
  const owned = new Set(ownedIngredientIds.map(String));
  const ready: DigestCocktailCard[] = [];

  for (const cocktail of cocktails) {
    const required = ingredientsByCocktail.get(String(cocktail.id));
    if (!required?.length) continue;

    const hasAll = required.every((id) => owned.has(id));
    if (!hasAll) continue;

    ready.push({
      name: cocktail.name,
      slug: cocktail.slug,
      imageUrl: cocktail.image_url || undefined,
    });
  }

  return ready;
}
