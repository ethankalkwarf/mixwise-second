"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getImageUrl } from "@/lib/sanityImage";
import { PlusCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import type { SanityCocktail, SanityImage } from "@/lib/sanityTypes";

interface MixCocktail {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImage;
  externalImageUrl?: string;
  primarySpirit?: string;
  ingredients?: Array<{
    ingredient?: { _id: string; name: string } | null;
  }>;
}

interface PersonalizedSectionsProps {
  allCocktails: MixCocktail[];
  featuredCocktails: SanityCocktail[];
}

export function PersonalizedSections({ allCocktails, featuredCocktails }: PersonalizedSectionsProps) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading, addIngredient } = useBarIngredients();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();

  const isLoading = authLoading || barLoading || favsLoading || recentLoading;

  // Calculate cocktails user can make
  const { readyToMake, oneAway } = useMemo(() => {
    if (ingredientIds.length === 0) {
      return { readyToMake: [], oneAway: [] };
    }

    const ingredientSet = new Set(ingredientIds);
    const readyToMake: MixCocktail[] = [];
    const oneAway: Array<{ cocktail: MixCocktail; missingIngredient: { id: string; name: string } }> = [];

    allCocktails.forEach((cocktail) => {
      const requiredIngredients = cocktail.ingredients?.filter(i => i.ingredient) || [];
      if (requiredIngredients.length === 0) return;

      const missing = requiredIngredients.filter(i => 
        i.ingredient && !ingredientSet.has(i.ingredient._id)
      );

      if (missing.length === 0) {
        readyToMake.push(cocktail);
      } else if (missing.length === 1 && missing[0].ingredient) {
        oneAway.push({
          cocktail,
          missingIngredient: {
            id: missing[0].ingredient._id,
            name: missing[0].ingredient.name,
          },
        });
      }
    });

    return {
      readyToMake: readyToMake.slice(0, 6),
      oneAway: oneAway.slice(0, 4),
    };
  }, [allCocktails, ingredientIds]);

  // If not authenticated or loading, show nothing (parent will show featured)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-12">
        <PersonalizedSectionSkeleton />
      </div>
    );
  }

  const hasBar = ingredientIds.length > 0;
  const hasFavorites = favorites.length > 0;
  const hasRecent = recentlyViewed.length > 0;
  const hasPersonalizedContent = hasBar || hasFavorites || hasRecent;

  if (!hasPersonalizedContent) {
    return null;
  }

  return (
    <div className="space-y-16">
      {/* Cocktails You Can Make */}
      {hasBar && readyToMake.length > 0 && (
        <section aria-labelledby="canmake-title">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Cocktails You Can Make" id="canmake-title" />
            <Link
              href="/mix"
              className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1"
            >
              View all in Mix <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {readyToMake.map((cocktail) => (
              <SmallCocktailCard key={cocktail._id} cocktail={cocktail} badge="Ready!" badgeColor="bg-lime-500" />
            ))}
          </div>
        </section>
      )}

      {/* One Ingredient Away */}
      {oneAway.length > 0 && (
        <section aria-labelledby="oneaway-title">
          <SectionHeader title="Just One Ingredient Away" id="oneaway-title" />
          <p className="text-slate-400 text-sm mb-6">Add one ingredient to unlock these recipes!</p>
          <div className="grid gap-5 sm:grid-cols-2" role="list">
            {oneAway.map(({ cocktail, missingIngredient }) => (
              <OneAwayCard
                key={cocktail._id}
                cocktail={cocktail}
                missingIngredient={missingIngredient}
                onAddIngredient={() => addIngredient(missingIngredient.id, missingIngredient.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Your Favorites */}
      {hasFavorites && (
        <section aria-labelledby="favorites-title">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Your Favorites" id="favorites-title" />
            <Link
              href="/account"
              className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {favorites.slice(0, 6).map((fav) => (
              <SmallCocktailCard
                key={fav.cocktail_id}
                cocktail={{
                  _id: fav.cocktail_id,
                  name: fav.cocktail_name || "Cocktail",
                  slug: { current: fav.cocktail_slug || "" },
                  externalImageUrl: fav.cocktail_image_url || undefined,
                }}
                badge="❤️"
                badgeColor="bg-pink-500"
              />
            ))}
          </div>
        </section>
      )}

      {/* Continue Exploring */}
      {hasRecent && recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title">
          <SectionHeader title="Continue Exploring" id="recent-title" />
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600" role="list">
            {recentlyViewed.slice(0, 8).map((item) => (
              <SmallCocktailCard
                key={item.cocktail_id}
                cocktail={{
                  _id: item.cocktail_id,
                  name: item.cocktail_name || "Cocktail",
                  slug: { current: item.cocktail_slug || "" },
                  externalImageUrl: item.cocktail_image_url || undefined,
                }}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface SmallCocktailCardProps {
  cocktail: {
    _id: string;
    name: string;
    slug: { current: string };
    image?: SanityImage;
    externalImageUrl?: string;
    primarySpirit?: string;
  };
  badge?: string;
  badgeColor?: string;
  compact?: boolean;
}

function SmallCocktailCard({ cocktail, badge, badgeColor = "bg-lime-500", compact }: SmallCocktailCardProps) {
  const imageUrl = getImageUrl(cocktail.image, { width: 300, height: 200 }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-lg hover:shadow-lime-900/10 ${compact ? "flex-shrink-0 w-48" : ""}`}
      role="listitem"
    >
      <div className={`relative ${compact ? "h-28" : "h-36"} w-full overflow-hidden bg-slate-800`}>
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-4xl" aria-hidden="true">
            🍸
          </div>
        )}
        {badge && (
          <span className={`absolute top-2 left-2 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded shadow-lg`}>
            {badge}
          </span>
        )}
      </div>
      <div className={`${compact ? "p-3" : "p-4"} flex-1`}>
        <h3 className={`font-serif font-bold ${compact ? "text-sm" : "text-base"} text-slate-100 group-hover:text-lime-400 transition-colors line-clamp-2`}>
          {cocktail.name}
        </h3>
      </div>
    </Link>
  );
}

interface OneAwayCardProps {
  cocktail: MixCocktail;
  missingIngredient: { id: string; name: string };
  onAddIngredient: () => void;
}

function OneAwayCard({ cocktail, missingIngredient, onAddIngredient }: OneAwayCardProps) {
  const imageUrl = getImageUrl(cocktail.image, { width: 300, height: 200 }) || cocktail.externalImageUrl;

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
      <Link
        href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
        className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-slate-800"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-2xl" aria-hidden="true">
            🍸
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}>
          <h4 className="font-serif font-bold text-base text-slate-100 hover:text-lime-400 transition-colors truncate">
            {cocktail.name}
          </h4>
        </Link>
        <p className="text-sm text-slate-400 mt-1">
          Missing: <span className="text-slate-300">{missingIngredient.name}</span>
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddIngredient();
          }}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-lime-400 hover:text-lime-300 transition-colors"
        >
          <PlusCircleIcon className="w-4 h-4" />
          Add to bar
        </button>
      </div>
    </div>
  );
}

function PersonalizedSectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-slate-800 rounded w-48 mb-6" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="h-36 bg-slate-800" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

