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
  const cocktails = allCocktails || await getMixCocktails();

  // Filter out cocktails without valid ingredients
  const validCocktails = cocktails.filter(cocktail => 
    cocktail && 
    cocktail.ingredients && 
    Array.isArray(cocktail.ingredients) && 
    cocktail.ingredients.length > 0
  );

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
