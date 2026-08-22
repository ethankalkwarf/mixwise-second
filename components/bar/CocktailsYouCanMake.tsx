"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { getMixIngredients } from "@/lib/cocktails";
import { formatCocktailName, formatIngredientName, isNewCocktail } from "@/lib/formatters";
import type { MixCocktail, MixMatchResult, MixIngredient } from "@/lib/mixTypes";
import { debugLog } from "@/lib/debugLog";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";

interface CocktailsYouCanMakeProps {
  ingredientIds: string[];
  allCocktails: MixCocktail[];
  stapleIngredientIds?: string[];
  maxResults?: number;
  showAllRecipesLink?: boolean;
  showAlmostThere?: boolean;
  isPublicView?: boolean;
  userFirstName?: string;
}

export function CocktailsYouCanMake({
  ingredientIds,
  allCocktails,
  stapleIngredientIds: providedStapleIds,
  maxResults,
  showAllRecipesLink = false,
  showAlmostThere = true,
  isPublicView = false,
  userFirstName,
}: CocktailsYouCanMakeProps) {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReady, setShowAllReady] = useState(false);
  const { skipIds } = useCocktailSkips();

  // Default cap on public bars so 200+ drinks don't dump onto the page
  const publicCap = 12;
  const effectiveMax =
    typeof maxResults === "number"
      ? maxResults
      : isPublicView && !showAllReady
        ? publicCap
        : undefined;

  // Fetch ingredients to calculate staple IDs (same logic as mix wizard)
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const ingredients = await getMixIngredients();
        setAllIngredients(ingredients);
      } catch (error) {
        console.error("Error fetching ingredients for staple calculation:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchIngredients();
  }, []);

  // Calculate staple IDs (same logic as mix wizard)
  const stapleIngredientIds = providedStapleIds || (() => {
    if (loading || allIngredients.length === 0) {
      debugLog('[BAR DEBUG] Still loading ingredients or no ingredients found, using default staples');
      return ["ice", "water"]; // Default while loading
    }

    const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
    const manualStaples = ['ice', 'water']; // Only truly universal basics
    const calculatedStaples = [...new Set([...dbStaples, ...manualStaples])];

    debugLog('[BAR DEBUG] Staple calculation:', {
      allIngredientsCount: allIngredients.length,
      dbStaples: dbStaples,
      manualStaples: manualStaples,
      calculatedStaples: calculatedStaples,
      ingredientIds: ingredientIds.slice(0, 5)
    });

    return calculatedStaples;
  })();

  // Run cocktail matching
  const { ready, almostThere } = getMixMatchGroups({
    cocktails: allCocktails,
    ownedIngredientIds: ingredientIds,
    stapleIngredientIds,
    maxMissing: 2,
    excludeCocktailIds: isPublicView ? undefined : skipIds,
  });

  // Debug logging (dev only)
  if (process.env.NODE_ENV === "development") {
    debugLog("[CocktailsYouCanMake] Matching results:", {
      totalCocktails: allCocktails.length,
      cocktailsWithIngredients: allCocktails.filter((c) => c.ingredients && c.ingredients.length > 0).length,
      ingredientIdsCount: ingredientIds.length,
      stapleIngredientIds,
      readyCount: ready.length,
      almostThereCount: almostThere.length,
      readySample: ready.slice(0, 5).map((c) => c.cocktail.name),
    });
  }

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
            <h3 className={`font-serif font-bold text-forest ${isPublicView ? "text-base" : "text-xl"}`}>
              {isPublicView
                ? `${ready.length} ready`
                : `Cocktails You Can Make (${ready.length})`}
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
            {(typeof effectiveMax === "number" ? ready.slice(0, effectiveMax) : ready).map((match) => (
              <CocktailCard
                key={match.cocktail.id}
                match={match}
                openInNewTab={isPublicView}
              />
            ))}
          </div>
          {typeof effectiveMax === "number" && ready.length > effectiveMax && (
            <button
              type="button"
              onClick={() => setShowAllReady(true)}
              className="mt-4 text-sm font-medium text-olive hover:text-olive-dark"
            >
              Show all {ready.length} cocktails
            </button>
          )}
          {isPublicView && showAllReady && ready.length > publicCap && (
            <button
              type="button"
              onClick={() => setShowAllReady(false)}
              className="mt-4 ml-4 text-sm font-medium text-sage hover:text-forest"
            >
              Show less
            </button>
          )}
        </section>
      )}

      {/* Almost There - Only show for owner views */}
      {almostThere.length > 0 && showAlmostThere && (
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
            {(typeof maxResults === "number"
              ? almostThere.slice(0, Math.min(6, maxResults))
              : almostThere.slice(0, 6)
            ).map((match) => (
              <CocktailCard
                key={match.cocktail.id}
                match={match}
                isAlmostThere
                openInNewTab={isPublicView}
              />
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
  openInNewTab?: boolean;
}

function CocktailCard({ match, isAlmostThere, openInNewTab }: CocktailCardProps) {
  const { cocktail } = match;
  // Use same slug format as browse page: slug or id as fallback
  const slug = cocktail.slug || cocktail.id;
  const href = slug ? `/cocktails/${encodeURIComponent(slug)}` : "/cocktails";

  debugLog('[COCKTAIL CARD] Cocktail:', cocktail.name, 'slug:', cocktail.slug, 'id:', cocktail.id, 'href:', href);

  return (
    <Link
      href={href}
      {...(openInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={`native-card-link flex flex-col p-4 bg-cream/50 rounded-xl hover:bg-cream transition-colors border border-mist group ${
        isAlmostThere ? "opacity-75" : ""
      }`}
    >
      <div className="aspect-square relative mb-3 w-full shrink-0 rounded-lg overflow-hidden bg-mist flex items-center justify-center">
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
        {isNewCocktail(cocktail.createdAt) && (
          <span className="absolute top-2 left-2 z-10 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            NEW
          </span>
        )}
      </div>
      <h4 className="font-semibold text-forest text-sm leading-snug line-clamp-2 mb-1">
        {formatCocktailName(cocktail.name)}
      </h4>
      {cocktail.primarySpirit ? (
        <p className="text-sage text-xs mb-2">
          {formatCocktailName(cocktail.primarySpirit)}
        </p>
      ) : null}
      {isAlmostThere && (
        <p className="text-terracotta text-xs">
          Missing: {match.missingIngredientNames.slice(0, 2).map(formatIngredientName).join(", ")}
          {match.missingIngredientNames.length > 2 && ` +${match.missingIngredientNames.length - 2} more`}
        </p>
      )}
    </Link>
  );
}
