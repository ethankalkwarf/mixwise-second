export type DirectoryIngredient = {
  id: string;
  name: string;
  slug: string;
  type: string;
  imageUrl: string | null;
  isStaple: boolean;
  cocktailCount: number;
  hasGuide?: boolean;
  dek?: string;
};

export type IngredientCocktail = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imageAlt?: string | null;
  primarySpirit: string | null;
  shortDescription?: string | null;
  category?: string | null;
  createdAt?: string | null;
};

export type IngredientDetail = DirectoryIngredient & {
  cocktails: IngredientCocktail[];
  related: DirectoryIngredient[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  heroIsCocktailPhoto: boolean;
};
