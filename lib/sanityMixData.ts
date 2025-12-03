/**
 * Fetch cocktails from Supabase and ingredients from Sanity for the Mix tool
 */

import { sanityClient } from "./sanityClient";
import { getImageUrl } from "./sanityImage";
import { createClient } from "@/lib/supabase/client";
import type { CocktailRow } from "@/lib/supabase/database.types";
import { normalizeCocktail } from "@/lib/cocktailTypes";
import type { MixIngredient, MixCocktail } from "./mixTypes";

// GROQ query to fetch all ingredients
const INGREDIENTS_QUERY = `*[_type == "ingredient"] | order(name asc) {
  _id,
  name,
  "type": type,
  image,
  externalImageUrl,
  isStaple
}`;

// Map Sanity ingredient type to display category
const TYPE_TO_CATEGORY: Record<string, string> = {
  spirit: "Spirit",
  liqueur: "Liqueur",
  wine: "Wine",
  beer: "Beer",
  mixer: "Mixer",
  citrus: "Citrus",
  syrup: "Syrup",
  bitters: "Bitters",
  garnish: "Garnish",
  other: "Other"
};

/**
 * Fetch all ingredients from Sanity
 */
export async function fetchMixIngredients(): Promise<MixIngredient[]> {
  const data = await sanityClient.fetch(INGREDIENTS_QUERY);
  
  return data.map((item: any) => ({
    id: item._id,
    name: item.name,
    category: TYPE_TO_CATEGORY[item.type] || "Other",
    imageUrl: getImageUrl(item.image, { width: 100, height: 100 }) || item.externalImageUrl || null,
    isStaple: item.isStaple || false
  }));
}

/**
 * Fetch all cocktails from Supabase
 */
export async function fetchMixCocktails(): Promise<MixCocktail[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load cocktails for Mix tool", error);
    return [];
  }

  return (data || []).map((row) => mapCocktailToMix(normalizeCocktail(row as CocktailRow)));
}

/**
 * Fetch both ingredients and cocktails
 */
export async function fetchMixData(): Promise<{
  ingredients: MixIngredient[];
  cocktails: MixCocktail[];
}> {
  const [ingredients, cocktails] = await Promise.all([
    fetchMixIngredients(),
    fetchMixCocktails()
  ]);
  
  return { ingredients, cocktails };
}

function mapCocktailToMix(cocktail: ReturnType<typeof normalizeCocktail>): MixCocktail {
  return {
    id: cocktail.id,
    name: cocktail.name,
    slug: cocktail.slug,
    description: cocktail.description,
    instructions: cocktail.instructions?.join("\n") || null,
    category: cocktail.baseSpirit,
    imageUrl: cocktail.imageUrl,
    glass: cocktail.glass,
    method: cocktail.method,
    primarySpirit: cocktail.baseSpirit,
    difficulty: cocktail.difficulty,
    isPopular: cocktail.isPopular,
    isFavorite: cocktail.isFavorite,
    isTrending: cocktail.isTrending,
    drinkCategories: cocktail.categories,
    tags: cocktail.tags,
    garnish: cocktail.garnish,
    ingredients: cocktail.ingredients.map((ingredient) => ({
      id: ingredient.id || slugify(ingredient.name || ""),
      name: ingredient.name || "Ingredient",
      amount: ingredient.amount || null,
      isOptional: ingredient.isOptional || false,
      notes: ingredient.notes || null,
    })),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

