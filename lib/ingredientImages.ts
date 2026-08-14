/** CocktailDB stores tiny `-Small.png` thumbs. Use the full bottle render. */
export function upgradeIngredientImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/-Small\.(png|jpg|jpeg|webp)$/i, ".$1").replace(/-Medium\.(png|jpg|jpeg|webp)$/i, ".$1");
}

export function isBottleCatalogImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return /thecocktaildb\.com\/images\/ingredients/i.test(url);
}
