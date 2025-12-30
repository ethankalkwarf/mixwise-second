import { getCocktailsList } from "./cocktails.server";

interface CocktailSimilarity {
  cocktail: any;
  score: number;
}

/**
 * Finds similar cocktails based on base spirit, tags, and categories
 * Returns up to 6 similar cocktails, excluding the current one
 */
export async function getSimilarRecipes(
  currentCocktailId: string,
  baseSpirit?: string | null,
  tags?: string[] | null,
  categories?: string[] | null,
  limit = 6
): Promise<any[]> {
  const allCocktails = await getCocktailsList();

  // Filter out the current cocktail
  const otherCocktails = allCocktails.filter(
    cocktail => cocktail.id !== currentCocktailId
  );

  const similarities: CocktailSimilarity[] = otherCocktails.map(cocktail => {
    let score = 0;

    // Same base spirit gets highest score
    if (baseSpirit && cocktail.base_spirit === baseSpirit) {
      score += 10;
    }

    // Shared tags get points
    if (tags && cocktail.tags) {
      const sharedTags = tags.filter(tag => cocktail.tags?.includes(tag));
      score += sharedTags.length * 3;
    }

    // Shared categories get points
    if (categories && cocktail.categories_all) {
      const sharedCategories = categories.filter(cat => cocktail.categories_all?.includes(cat));
      score += sharedCategories.length * 2;
    }

    // Same category_primary gets points
    if (cocktail.category_primary && categories?.includes(cocktail.category_primary)) {
      score += 4;
    }

    return {
      cocktail,
      score
    };
  });

  // Sort by score descending and return top results
  return similarities
    .filter(item => item.score > 0) // Only include cocktails with some similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.cocktail);
}


