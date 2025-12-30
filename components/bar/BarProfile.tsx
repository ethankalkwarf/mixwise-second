import { getMixCocktails } from "@/lib/cocktails.server";
import { CocktailsYouCanMake } from "./CocktailsYouCanMake";
import { InventoryList } from "./InventoryList";
import type { MixCocktail } from "@/lib/mixTypes";

interface BarProfileProps {
  ingredientIds: string[];
  ingredients: Array<{
    ingredient_id: string;
    ingredient_name: string | null;
  }>;
  allCocktails?: MixCocktail[];
  showAllRecipesLink?: boolean;
  isOwner?: boolean;
  title?: string;
  subtitle?: string;
  showAlmostThere?: boolean;
  isPublicView?: boolean;
  userFirstName?: string;
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
}: BarProfileProps) {
  // Fetch cocktails if not provided
  console.log('[BAR PROFILE] Starting with ingredientIds:', ingredientIds.length, 'ingredients:', ingredients.length);
  console.log('[BAR PROFILE] ingredientIds sample:', ingredientIds.slice(0, 10));
  console.log('[BAR PROFILE] Fetching cocktails...');
  const cocktails = allCocktails || await getMixCocktails();
  console.log('[BAR PROFILE] Fetched', cocktails.length, 'cocktails');
  console.log('[BAR PROFILE] First cocktail:', cocktails[0] ? {
    name: cocktails[0].name,
    ingredientsCount: cocktails[0].ingredients?.length || 0
  } : 'no cocktails');

  // Filter out cocktails without valid ingredients
  const validCocktails = cocktails.filter(cocktail => 
    cocktail && 
    cocktail.ingredients && 
    Array.isArray(cocktail.ingredients) && 
    cocktail.ingredients.length > 0
  );

  console.log('[BAR PROFILE] Valid cocktails with ingredients:', validCocktails.length);

  return (
    <div className="space-y-12">
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
          title={isOwner ? "Your Bar Ingredients" : "Their Bar Ingredients"}
          emptyMessage={isOwner ? "Your bar is empty. Add some ingredients!" : "No ingredients in this bar yet."}
        />
      </section>
    </div>
  );
}
