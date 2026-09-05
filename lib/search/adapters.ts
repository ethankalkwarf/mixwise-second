import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { SanityCocktail } from "@/lib/sanityTypes";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";
import type { MixIngredient } from "@/lib/mixTypes";
import { slugifyIngredientName } from "@/lib/ingredientSlug";
import { getIngredientGuide } from "@/lib/ingredientContent";
import {
  LEARN_GUIDES,
  LEARN_LIBRARY_METHODS,
  type LearnGuide,
  type LearnMethod,
} from "@/lib/learnLibrary";
import { getAllTechniqueLearnEntries, formatTechniqueLabel } from "@/lib/cocktailTechniqueGlossary";
import { getTechniqueLessonLayers } from "@/lib/learnTechniques";
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

export function mixIngredientToSearchDocument(
  ingredient: MixIngredient
): CocktailSearchDocument & { ingredient: MixIngredient } {
  const guide = getIngredientGuide(slugifyIngredientName(ingredient.name));
  return {
    id: ingredient.id,
    name: ingredient.name,
    description: null,
    tags: ingredient.category ? [ingredient.category] : [],
    aliases: [...(guide?.aliases || []), ...(guide?.matchNames || [])],
    ingredient,
  };
}

export function directoryIngredientToSearchDocument(
  ingredient: DirectoryIngredient
): CocktailSearchDocument & { ingredient: DirectoryIngredient } {
  const guide = getIngredientGuide(ingredient.slug);
  return {
    id: ingredient.id,
    name: ingredient.name,
    description: ingredient.dek,
    tags: [ingredient.type],
    aliases: [...(guide?.aliases || []), ...(guide?.matchNames || [])],
    ingredient,
  };
}

export type LearnSearchItem = {
  id: string;
  kind: "guide" | "method" | "technique";
  title: string;
  summary: string;
  href: string;
};

export function learnGuideToSearchDocument(
  guide: LearnGuide
): CocktailSearchDocument & { learn: LearnSearchItem } {
  return {
    id: `guide:${guide.slug}`,
    name: guide.title,
    description: guide.summary,
    tags: guide.topics,
    aliases: [guide.eyebrow, ...(guide.keyTakeaways ?? []).slice(0, 3)],
    learn: {
      id: guide.slug,
      kind: "guide",
      title: guide.title,
      summary: guide.summary,
      href: `/learn/guides/${guide.slug}`,
    },
  };
}

export function learnMethodToSearchDocument(
  method: LearnMethod
): CocktailSearchDocument & { learn: LearnSearchItem } {
  return {
    id: `method:${method.slug}`,
    name: method.label,
    description: method.summary,
    tags: method.techniqueKeys,
    aliases: [method.cue, method.tip],
    learn: {
      id: method.slug,
      kind: "method",
      title: method.label,
      summary: method.summary,
      href: `/learn/methods/${method.slug}`,
    },
  };
}

export function learnTechniqueToSearchDocument(
  technique: ReturnType<typeof getAllTechniqueLearnEntries>[number]
): CocktailSearchDocument & { learn: LearnSearchItem } {
  const layers = getTechniqueLessonLayers(technique.slug);
  return {
    id: `technique:${technique.slug}`,
    name: formatTechniqueLabel(technique.label),
    description: layers?.bigIdea ?? technique.explanation,
    tags: technique.patterns,
    aliases: [
      technique.explanation,
      ...(technique.why ? [technique.why] : []),
      ...(layers?.keyTakeaways ?? []),
    ],
    learn: {
      id: technique.slug,
      kind: "technique",
      title: formatTechniqueLabel(technique.label),
      summary: technique.explanation,
      href: technique.learnPath || `/learn/techniques/${technique.slug}`,
    },
  };
}

export function buildLearnSearchCorpus(): Array<
  CocktailSearchDocument & { learn: LearnSearchItem }
> {
  return [
    ...LEARN_GUIDES.map(learnGuideToSearchDocument),
    ...LEARN_LIBRARY_METHODS.map(learnMethodToSearchDocument),
    ...getAllTechniqueLearnEntries().map(learnTechniqueToSearchDocument),
  ];
}
