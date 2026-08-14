export type IngredientGuide = {
  slug: string;
  /** Other ingredient-page slugs that should use this guide's copy. */
  aliases?: string[];
  /** Extra recipe-line names that count as this bottle (synonyms, not generic parents). */
  matchNames?: string[];
  seoTitle: string;
  seoDescription: string;
  dek: string;
  alsoCalled?: string;
  abv?: string;
  origin?: string;
  tastingNotes: string;
  whatItIs: string;
  history: string;
  howToUse: string;
  funFact?: string;
  pairsWith: string[];
  signatureSlugs: string[];
};
