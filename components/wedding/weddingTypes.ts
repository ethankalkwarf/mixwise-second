import type { Cocktail } from "@/lib/cocktailTypes";

export type MenuTheme = "classic" | "chalkboard";

export interface WeddingMenuData {
  coupleNames: string;
  weddingDate: string;
  hisCocktail: Cocktail | null;
  herCocktail: Cocktail | null;
  theme: MenuTheme;
}

