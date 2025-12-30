import { getMixCocktails } from "@/lib/cocktails.server";
import { getStapleIngredientIds, getUserFavorites } from "@/lib/cocktails.server";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { formatCocktailName } from "@/lib/formatters";
import { CocktailsYouCanMake } from "./CocktailsYouCanMake";
import { InventoryList } from "./InventoryList";
import type { MixCocktail } from "@/lib/mixTypes";
import Link from "next/link";
import Image from "next/image";

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
  title,
  subtitle,
  showAlmostThere = true,
  isPublicView = false,
  userFirstName,
  userId,
}: BarProfileProps) {
  // Fetch cocktails if not provided
  const cocktails = allCocktails || await getMixCocktails();

  // Filter out cocktails without valid ingredients
  const validCocktails = cocktails.filter(cocktail => 
    cocktail && 
    cocktail.ingredients && 
    Array.isArray(cocktail.ingredients) && 
    cocktail.ingredients.length > 0
  );

  // Possessive helper for section titles (e.g., "James’" vs "Ethan’s")
  const possessive = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Their";
    return trimmed.toLowerCase().endsWith("s") ? `${trimmed}’` : `${trimmed}’s`;
  };

  // Public profile favorites intersection (favorites ∩ makeable)
  let favoriteReady: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }> = [];

  if (isPublicView && userId) {
    const [stapleIds, favorites] = await Promise.all([
      getStapleIngredientIds(),
      getUserFavorites(userId),
    ]);

    const favoriteIdSet = new Set(favorites.map((f) => f.cocktail_id).filter(Boolean));
    const favoriteSlugSet = new Set(favorites.map((f) => f.cocktail_slug).filter(Boolean) as string[]);

    const { ready } = getMixMatchGroups({
      cocktails: validCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });

    favoriteReady = ready
      .map((m) => m.cocktail)
      .filter((c) => favoriteSlugSet.has(c.slug) || favoriteIdSet.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl || null,
      }));
  }

  return (
    <div className="space-y-12">
      {/* Favorites (Public Bar only) */}
      {isPublicView && userId && (
        <section className="card p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-forest">
              {possessive(userFirstName || "Their")} Favorite Cocktails
            </h3>
          </div>

          {favoriteReady.length === 0 ? (
            <p className="text-sage">
              No favorite cocktails are currently makeable with this bar.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteReady.map((c) => (
                <Link
                  key={c.id}
                  href={c.slug ? `/cocktails/${encodeURIComponent(c.slug)}` : "/cocktails"}
                  className="block p-4 bg-cream/50 rounded-xl hover:bg-cream transition-colors border border-mist group"
                >
                  <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-mist flex items-center justify-center">
                    {c.imageUrl && c.imageUrl.startsWith("http") ? (
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="text-4xl flex items-center justify-center">🍸</div>
                    )}
                  </div>
                  <h4 className="font-semibold text-forest text-sm line-clamp-2 mb-1">
                    {formatCocktailName(c.name)}
                  </h4>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cocktails Section - Always First */}
      <section className="card p-8">
        <CocktailsYouCanMake
          ingredientIds={ingredientIds}
          allCocktails={validCocktails}
          showAllRecipesLink={showAllRecipesLink}
          showAlmostThere={showAlmostThere}
          isPublicView={isPublicView}
          userFirstName={userFirstName}
        />
      </section>

      {/* Ingredients Inventory - Always Second */}
      <section className="card p-8">
        <InventoryList
          ingredients={ingredients}
          title={
            isOwner
              ? "Your Bar Ingredients"
              : `${possessive(userFirstName || "Their")} Bar Ingredients`
          }
          emptyMessage={isOwner ? "Your bar is empty. Add some ingredients!" : "No ingredients in this bar yet."}
        />
      </section>
    </div>
  );
}
