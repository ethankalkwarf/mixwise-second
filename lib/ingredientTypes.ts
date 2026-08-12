export type DirectoryIngredient = {
  id: string;
  name: string;
  slug: string;
  type: string;
  imageUrl: string | null;
  isStaple: boolean;
  cocktailCount: number;
};

export type IngredientCocktail = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  primarySpirit: string | null;
};

export type IngredientDetail = DirectoryIngredient & {
  cocktails: IngredientCocktail[];
};
