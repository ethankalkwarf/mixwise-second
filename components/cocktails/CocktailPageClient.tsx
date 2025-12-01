"use client";

import { RatingStars } from "./RatingStars";
import { IngredientAvailability } from "./IngredientAvailability";
import { ShareButtons } from "./ShareButtons";
import { SITE_CONFIG } from "@/lib/seo";

interface Ingredient {
  _key?: string;
  amount?: string;
  isOptional?: boolean;
  ingredient?: {
    _id: string;
    name: string;
    type?: string;
  } | null;
}

interface CocktailPageClientProps {
  cocktailId: string;
  cocktailName: string;
  cocktailSlug: string;
  cocktailDescription?: string;
  ingredients: Ingredient[];
}

export function CocktailPageClient({
  cocktailId,
  cocktailName,
  cocktailSlug,
  cocktailDescription,
  ingredients,
}: CocktailPageClientProps) {
  const cocktailUrl = `${SITE_CONFIG.url}/cocktails/${cocktailSlug}`;

  return (
    <div className="space-y-6">
      {/* Rating */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-3">Rate this cocktail</h3>
        <RatingStars cocktailId={cocktailId} size="lg" showCount />
      </div>

      {/* Ingredient Availability */}
      <IngredientAvailability ingredients={ingredients} />

      {/* Share */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-3">Share this recipe</h3>
        <ShareButtons 
          url={cocktailUrl}
          title={`${cocktailName} Cocktail Recipe`}
          description={cocktailDescription}
        />
      </div>
    </div>
  );
}




