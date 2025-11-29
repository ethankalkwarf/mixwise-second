/**
 * Fetch cocktails and ingredients from Sanity for the Mix tool
 */

import { sanityClient } from "./sanityClient";
import { getImageUrl } from "./sanityImage";
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

// GROQ query to fetch all cocktails with their ingredients
const COCKTAILS_QUERY = `*[_type == "cocktail"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  image,
  externalImageUrl,
  glass,
  method,
  primarySpirit,
  difficulty,
  isPopular,
  garnish,
  "instructions": pt::text(instructions),
  "ingredients": ingredients[] {
    _key,
    amount,
    isOptional,
    notes,
    "ingredientId": ingredient->_id,
    "ingredientName": ingredient->name
  }
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
 * Fetch all cocktails from Sanity
 */
export async function fetchMixCocktails(): Promise<MixCocktail[]> {
  const data = await sanityClient.fetch(COCKTAILS_QUERY);
  
  return data.map((item: any) => ({
    id: item._id,
    name: item.name,
    slug: item.slug || item._id,
    description: item.description || null,
    instructions: item.instructions || null,
    category: item.primarySpirit || null,
    imageUrl: getImageUrl(item.image, { width: 600, height: 400 }) || item.externalImageUrl || null,
    glass: item.glass || null,
    method: item.method || null,
    primarySpirit: item.primarySpirit || null,
    difficulty: item.difficulty || null,
    isPopular: item.isPopular || false,
    garnish: item.garnish || null,
    ingredients: (item.ingredients || [])
      .filter((ing: any) => ing.ingredientId) // Filter out null references
      .map((ing: any) => ({
        id: ing.ingredientId,
        name: ing.ingredientName || "Unknown",
        amount: ing.amount || null,
        isOptional: ing.isOptional || false,
        notes: ing.notes || null
      }))
  }));
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

