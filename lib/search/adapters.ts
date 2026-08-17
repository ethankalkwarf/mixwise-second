import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { CocktailSearchDocument } from "./scoreCocktail";

export function cocktailListItemToSearchDocument(
  item: CocktailListItem
): CocktailSearchDocument & { listItem: CocktailListItem } {
  return {
    id: item.id,
    name: item.name,
    description: item.short_description,
    primarySpirit: item.base_spirit,
    tags: item.tags,
    categories: item.categories_all,
    ingredientNames: item.ingredientNames,
    createdAt: item.created_at,
    listItem: item,
  };
}

export function sanityCocktailToSearchDocument(
  cocktail: SanityCocktail
): CocktailSearchDocument & { cocktail: SanityCocktail } {
  const ingredientNames =
    cocktail.ingredientNames?.length
      ? cocktail.ingredientNames
      : (cocktail.ingredients || [])
          .map((ing) => ing.ingredient?.name)
          .filter((name): name is string => Boolean(name));

  return {
    id: cocktail._id,
    name: cocktail.name,
    description: cocktail.description,
    primarySpirit: cocktail.primarySpirit,
    tags: cocktail.tags,
    categories: cocktail.drinkCategories,
    ingredientNames,
    createdAt: cocktail.createdAt,
    isPopular: cocktail.isPopular,
    isFavorite: cocktail.isFavorite,
    isTrending: cocktail.isTrending,
    cocktail,
  };
}
