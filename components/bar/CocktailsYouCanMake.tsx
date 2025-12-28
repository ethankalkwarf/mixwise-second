"use client";

import Link from "next/link";
import Image from "next/image";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixCocktail, MixMatchResult } from "@/lib/mixTypes";

interface CocktailsYouCanMakeProps {
  ingredientIds: string[];
  allCocktails: MixCocktail[];
  stapleIngredientIds?: string[];
  maxResults?: number;
  showAllRecipesLink?: boolean;
}

export function CocktailsYouCanMake({
  ingredientIds,
  allCocktails,
  stapleIngredientIds = ["ice", "water", "salt", "simple-syrup"],
  maxResults = 12,
  showAllRecipesLink = false,
}: CocktailsYouCanMakeProps) {
  // Run cocktail matching
  const { ready, almostThere } = getMixMatchGroups({
    cocktails: allCocktails,
    ownedIngredientIds: ingredientIds,
    stapleIngredientIds,
    maxMissing: 2
  });

  if (ready.length === 0 && almostThere.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🍸</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-forest mb-2">
          No Cocktails Yet
        </h3>
        <p className="text-sage">
          Add some ingredients to see what cocktails you can make!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ready to Make */}
      {ready.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-forest">
              🍸 Cocktails You Can Make ({ready.length})
            </h3>
            {showAllRecipesLink && (
              <Link
                href="/mix"
                className="text-terracotta hover:text-terracotta-dark text-sm font-medium"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ready.slice(0, maxResults).map((match) => (
              <CocktailCard key={match.cocktail.id} match={match} />
            ))}
          </div>
          {ready.length > maxResults && (
            <p className="text-sage text-sm mt-4">
              And {ready.length - maxResults} more cocktails...
            </p>
          )}
        </section>
      )}

      {/* Almost There */}
      {almostThere.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-forest">
              🔄 Almost There ({almostThere.length})
            </h3>
            {showAllRecipesLink && (
              <Link
                href="/mix"
                className="text-terracotta hover:text-terracotta-dark text-sm font-medium"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {almostThere.slice(0, Math.min(6, maxResults)).map((match) => (
              <CocktailCard key={match.cocktail.id} match={match} isAlmostThere />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface CocktailCardProps {
  match: MixMatchResult;
  isAlmostThere?: boolean;
}

function CocktailCard({ match, isAlmostThere }: CocktailCardProps) {
  const { cocktail } = match;

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className={`block p-4 bg-cream/50 rounded-xl hover:bg-cream transition-colors border border-mist group ${
        isAlmostThere ? 'opacity-75' : ''
      }`}
    >
      <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-mist flex items-center justify-center">
        {cocktail.imageUrl && cocktail.imageUrl.startsWith('http') ? (
          <Image
            src={cocktail.imageUrl}
            alt={cocktail.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Hide broken images and show fallback
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.image-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }
            }}
            onLoad={() => {
              // Hide fallback when image loads successfully
              const parent = document.querySelector(`[data-cocktail="${cocktail.id}"]`);
              if (parent) {
                const fallback = parent.querySelector('.image-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'none';
              }
            }}
          />
        ) : null}
        {/* Fallback icon - shown when no image or image fails */}
        <div
          className="image-fallback text-4xl flex items-center justify-center"
          style={{ display: cocktail.imageUrl && cocktail.imageUrl.startsWith('http') ? 'none' : 'flex' }}
        >
          🍸
        </div>
      </div>
      <h4 className="font-semibold text-forest text-sm line-clamp-2 mb-1">
        {cocktail.name}
      </h4>
      <p className="text-sage text-xs mb-2">
        {cocktail.primarySpirit}
      </p>
      {isAlmostThere && (
        <p className="text-terracotta text-xs">
          Missing: {match.missingIngredientNames.slice(0, 2).join(", ")}
          {match.missingIngredientNames.length > 2 && ` +${match.missingIngredientNames.length - 2} more`}
        </p>
      )}
    </Link>
  );
}
