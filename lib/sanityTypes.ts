/**
 * TypeScript types for Sanity document schemas
 */

export type SanityImage = {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
};

export type SanitySlug = {
  _type: "slug";
  current: string;
};

export type SanityBlock = {
  _type: "block";
  _key: string;
  style?: string;
  children: Array<{
    _type: string;
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    href?: string;
  }>;
};

// Sanity Ingredient document
export type SanityIngredient = {
  _id: string;
  _type: "ingredient";
  name: string;
  slug: SanitySlug;
  type: "spirit" | "liqueur" | "wine" | "beer" | "mixer" | "citrus" | "syrup" | "bitters" | "garnish" | "other";
  image?: SanityImage;
  description?: string;
  abv?: number;
  origin?: string;
  flavorProfile?: string[];
  isStaple?: boolean;
};

// Cocktail ingredient (embedded in cocktail)
export type SanityCocktailIngredient = {
  _key: string;
  ingredient: SanityIngredient | null;
  amount?: string;
  isOptional?: boolean;
  notes?: string;
};

// Sanity Cocktail document
export type SanityCocktail = {
  _id: string;
  _type: "cocktail";
  name: string;
  slug: SanitySlug;
  description?: string;
  image?: SanityImage;
  glass?: string;
  method?: "shaken" | "stirred" | "built" | "blended" | "muddled" | "layered";
  instructions?: SanityBlock[];
  ingredients?: SanityCocktailIngredient[];
  garnish?: string;
  tags?: string[];
  primarySpirit?: string;
  difficulty?: "easy" | "moderate" | "advanced";
  isPopular?: boolean;
  history?: SanityBlock[];
  tips?: SanityBlock[];
};

// Category document
export type SanityCategory = {
  _id: string;
  _type: "category";
  title: string;
  slug: SanitySlug;
  categoryType?: "cocktail" | "article" | "education" | "general";
  description?: string;
  color?: string;
  icon?: string;
};

