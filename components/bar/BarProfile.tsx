import { getMixCocktails } from "@/lib/cocktails.server";
import { getStapleIngredientIds, getUserFavorites } from "@/lib/cocktails.server";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { CocktailsYouCanMake } from "./CocktailsYouCanMake";
import { InventoryList } from "./InventoryList";
import { PublicBarBrowse } from "./PublicBarBrowse";
import type { MixCocktail } from "@/lib/mixTypes";
import { debugLog } from "@/lib/debugLog";

interface BarProfileProps {
  ingredientIds: string[];
  ingredients: Array<{
    ingredient_id: string;
    ingredient_name: string | null;
    ingredient_category?: string | null;
  }>;
  allCocktails?: MixCocktail[];
  showAllRecipesLink?: boolean;
  isOwner?: boolean;
  title?: string;
  subtitle?: string;
  showAlmostThere?: boolean;
  isPublicView?: boolean;
  userFirstName?: string;
  userId?: string;
}

export async function BarProfile({
  ingredientIds,
  ingredients,
  allCocktails,
  showAllRecipesLink = false,
  isOwner = false,
  showAlmostThere = true,
  isPublicView = false,
  userFirstName,
  userId,
}: BarProfileProps) {
  const cocktails = allCocktails || (await getMixCocktails());

  const validCocktails = cocktails.filter(
    (cocktail) =>
      cocktail &&
      cocktail.ingredients &&
      Array.isArray(cocktail.ingredients) &&
      cocktail.ingredients.length > 0
  );

  const possessive = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Their";
    return trimmed.toLowerCase().endsWith("s") ? `${trimmed}’` : `${trimmed}’s`;
  };

  let favoriteReady: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }> = [];
  let makeableCount = 0;

  if (isPublicView && userId) {
    const [stapleIds, favorites] = await Promise.all([
      getStapleIngredientIds(),
      getUserFavorites(userId),
    ]);

    const favoriteIdSet = new Set(favorites.map((f) => f.cocktail_id).filter(Boolean));
    const favoriteSlugSet = new Set(
      favorites.map((f) => f.cocktail_slug).filter(Boolean) as string[]
    );

    const { ready } = getMixMatchGroups({
      cocktails: validCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });
    makeableCount = ready.length;

    const makeableFavorites = ready
      .map((m) => m.cocktail)
      .filter((c) => favoriteSlugSet.has(c.slug) || favoriteIdSet.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl || null,
      }));

    const unmatchableFavorites = favorites
      .filter((f) => {
        const isInMakeable = makeableFavorites.some(
          (mf) => mf.id === f.cocktail_id || mf.slug === f.cocktail_slug
        );
        return !isInMakeable;
      })
      .map((f) => {
        const cocktail = validCocktails.find(
          (c) => c.id === f.cocktail_id || c.slug === f.cocktail_slug
        );
        if (cocktail) {
          return {
            id: cocktail.id,
            name: cocktail.name || f.cocktail_name || "Unknown",
            slug: cocktail.slug || f.cocktail_slug || "",
            imageUrl: cocktail.imageUrl || f.cocktail_image_url || null,
          };
        }
        return {
          id: f.cocktail_id,
          name: f.cocktail_name || "Unknown",
          slug: f.cocktail_slug || "",
          imageUrl: f.cocktail_image_url || null,
        };
      })
      .filter((f) => f.id && f.name !== "Unknown");

    favoriteReady = [...makeableFavorites, ...unmatchableFavorites];

    debugLog("[BAR PROFILE] Final favorites:", {
      makeableCount: makeableFavorites.length,
      unmatchableCount: unmatchableFavorites.length,
      totalFavoriteReady: favoriteReady.length,
      readyCocktails: makeableCount,
    });
  }

  const cocktailsSection = (
    <CocktailsYouCanMake
      ingredientIds={ingredientIds}
      allCocktails={validCocktails}
      showAllRecipesLink={showAllRecipesLink}
      showAlmostThere={showAlmostThere}
      isPublicView={isPublicView}
      userFirstName={userFirstName}
    />
  );

  // Public bars: tabbed browse so 200+ drinks don't become one endless scroll
  if (isPublicView && userId) {
    return (
      <PublicBarBrowse
        userId={userId}
        userFirstName={userFirstName}
        favorites={favoriteReady}
        cocktailCount={makeableCount}
        cocktailsSlot={cocktailsSection}
        ingredients={ingredients}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="card p-6 sm:p-8">{cocktailsSection}</section>
      <section className="card p-6 sm:p-8">
        <InventoryList
          ingredients={ingredients}
          title={
            isOwner
              ? "Your Bar Ingredients"
              : `${possessive(userFirstName || "Their")} Bar Ingredients`
          }
          emptyMessage={
            isOwner ? "Your bar is empty. Add some ingredients!" : "No ingredients in this bar yet."
          }
        />
      </section>
    </div>
  );
}
