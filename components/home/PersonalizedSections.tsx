"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useCocktailSkips } from "@/hooks/useCocktailSkips";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getCocktailImageUrls } from "@/lib/cocktails.client";
import { getImageUrl, COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { PlusCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import type { SanityCocktail, SanityImage } from "@/lib/sanityTypes";

interface MixCocktail {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImage;
  externalImageUrl?: string;
  primarySpirit?: string;
  createdAt?: string;
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
  const { skipIds } = useCocktailSkips();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const [favoriteImageUrls, setFavoriteImageUrls] = useState<Map<string, string | null>>(new Map());
  const [recentImageUrls, setRecentImageUrls] = useState<Map<string, string | null>>(new Map());

  // Only show loading state AFTER auth is confirmed
  const dataLoading = barLoading || favsLoading || recentLoading;

  // Calculate cocktails user can make
  const { readyToMake, oneAway } = useMemo(() => {
    if (ingredientIds.length === 0) {
      return { readyToMake: [], oneAway: [] };
    }

    const ingredientSet = new Set(ingredientIds);
    const readyToMake: MixCocktail[] = [];
    const oneAway: Array<{ cocktail: MixCocktail; missingIngredient: { id: string; name: string } }> = [];

    allCocktails.forEach((cocktail) => {
      if (skipIds.has(cocktail._id)) return;
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
  }, [allCocktails, ingredientIds, skipIds]);

  // Fetch image URLs from Sanity for favorites
  useEffect(() => {
    async function fetchFavoriteImages() {
      if (favorites.length === 0) {
        setFavoriteImageUrls(new Map());
        return;
      }

      try {
        const cocktailIds = favorites.map(fav => fav.cocktail_id);
        const imageUrls = await getCocktailImageUrls(cocktailIds);
        setFavoriteImageUrls(imageUrls);
      } catch (error) {
        console.error("Error fetching favorite images:", error);
      }
    }

    if (!favsLoading && favorites.length > 0) {
      fetchFavoriteImages();
    }
  }, [favorites, favsLoading]);

  // Fetch image URLs from Sanity for recently viewed
  useEffect(() => {
    async function fetchRecentImages() {
      if (recentlyViewed.length === 0) {
        setRecentImageUrls(new Map());
        return;
      }

      try {
        const cocktailIds = recentlyViewed.map(item => item.cocktail_id);
        const imageUrls = await getCocktailImageUrls(cocktailIds);
        setRecentImageUrls(imageUrls);
      } catch (error) {
        console.error("Error fetching recent images:", error);
      }
    }

    if (!recentLoading && recentlyViewed.length > 0) {
      fetchRecentImages();
    }
  }, [recentlyViewed, recentLoading]);

  // IMPORTANT: Don't show anything if auth is still loading or user is not authenticated
  // This prevents skeleton states from showing for anonymous users
  if (authLoading || !isAuthenticated) {
    return null;
  }

  // Only show skeleton if we're DEFINITELY authenticated but data is loading
  if (dataLoading) {
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
    return (
      <section className="bg-cream py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-3xl border border-mist bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-2">
                Your bar
              </p>
              <h2 className="font-display text-2xl font-bold text-forest mb-2">
                Add what&apos;s on your shelf
              </h2>
              <p className="text-sage text-sm leading-relaxed">
                Once your cabinet is saved, we&apos;ll show drinks you can make tonight, plus your favorites, notes, and recents.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:shrink-0">
              <Link
                href="/mix"
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta-dark transition-colors"
              >
                Open Mix
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-mist bg-cream px-6 py-3 text-sm font-semibold text-forest hover:border-terracotta/40 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
      {/* Cocktails You Can Make */}
      {hasBar && readyToMake.length > 0 && (
        <section aria-labelledby="canmake-title">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Cocktails You Can Make" id="canmake-title" />
            <Link
              href="/mix"
              className="text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors flex items-center gap-1"
            >
              View all in Mix <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" role="list">
            {readyToMake.map((cocktail) => (
              <SmallCocktailCard key={cocktail._id} cocktail={cocktail} badge="Ready!" badgeColor="bg-olive" />
            ))}
          </div>
        </section>
      )}

      {/* One Ingredient Away */}
      {oneAway.length > 0 && (
        <section aria-labelledby="oneaway-title">
          <SectionHeader title="Just One Ingredient Away" id="oneaway-title" />
          <p className="text-sage text-sm mb-6">Add one ingredient to unlock these recipes!</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
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
              className="text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors flex items-center gap-1"
            >
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" role="list">
            {favorites.slice(0, 8).map((fav) => {
              // Try to get image URL from Supabase cocktails table first, fallback to stored URL
              // Handle both null and empty string cases
              const supabaseImageUrl = favoriteImageUrls.get(fav.cocktail_id);
              const storedImageUrl = fav.cocktail_image_url;
              // Prioritize Supabase URL, then stored URL, ensuring non-empty strings
              const imageUrl = 
                (supabaseImageUrl && supabaseImageUrl.trim() && supabaseImageUrl.trim().length > 0 ? supabaseImageUrl.trim() : null) ||
                (storedImageUrl && storedImageUrl.trim() && storedImageUrl.trim().length > 0 ? storedImageUrl.trim() : null) ||
                undefined;
              
              return (
                <SmallCocktailCard
                  key={fav.cocktail_id}
                  cocktail={{
                    _id: fav.cocktail_id,
                    name: fav.cocktail_name || "Cocktail",
                    slug: { current: fav.cocktail_slug || "" },
                    externalImageUrl: imageUrl,
                  }}
                  badge={undefined}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Continue Exploring */}
      {hasRecent && recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-title">
          <SectionHeader title="Continue Exploring" id="recent-title" />
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin" role="list">
            {recentlyViewed.slice(0, 8).map((item) => {
              // Try to get image URL from Supabase cocktails table first, fallback to stored URL
              // Handle both null and empty string cases
              const supabaseImageUrl = recentImageUrls.get(item.cocktail_id);
              const storedImageUrl = item.cocktail_image_url;
              const imageUrl = (supabaseImageUrl && supabaseImageUrl.trim()) || (storedImageUrl && storedImageUrl.trim()) || undefined;
              
              return (
                <SmallCocktailCard
                  key={item.cocktail_id}
                  cocktail={{
                    _id: item.cocktail_id,
                    name: item.cocktail_name || "Cocktail",
                    slug: { current: item.cocktail_slug || "" },
                    externalImageUrl: imageUrl,
                  }}
                  compact
                />
              );
            })}
          </div>
        </section>
      )}
        </div>
      </div>
    </section>
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
    createdAt?: string;
  };
  badge?: string;
  badgeColor?: string;
  compact?: boolean;
}

function SmallCocktailCard({ cocktail, badge, badgeColor = "bg-olive", compact }: SmallCocktailCardProps) {
  // Prioritize externalImageUrl (from Supabase) over Sanity image for favorites/recent
  const sanityImageUrl = getImageUrl(cocktail.image, { width: 600, height: 400, quality: 90 });
  const imageUrl = cocktail.externalImageUrl || sanityImageUrl || null;
  const showNew = isNewCocktail(cocktail.createdAt);

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover ${compact ? "flex-shrink-0 w-48" : ""}`}
      role="listitem"
    >
      <div className={`relative ${compact ? "h-28" : "h-36"} w-full overflow-hidden bg-mist`}>
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes={compact ? "192px" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
              quality={90}
              placeholder="blur"
              blurDataURL={COCKTAIL_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-4xl" aria-hidden="true">
            🍸
          </div>
        )}
        {(badge || showNew) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[85%] z-10">
            {showNew && (
              <span className="bg-terracotta text-cream text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                NEW
              </span>
            )}
            {badge && (
              <span className={`${badgeColor} text-cream text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`${compact ? "p-3" : "p-4"} flex-1`}>
        <h3 className={`font-display font-bold ${compact ? "text-sm" : "text-base"} text-forest group-hover:text-terracotta transition-colors line-clamp-2`}>
          {formatCocktailName(cocktail.name)}
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
  // Prioritize externalImageUrl (from Supabase) over Sanity image
  const sanityImageUrl = getImageUrl(cocktail.image, { width: 320, height: 240, quality: 90 });
  const imageUrl = cocktail.externalImageUrl || sanityImageUrl || null;

  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-mist bg-white hover:shadow-soft transition-all">
      <Link
        href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
        className="flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden bg-mist relative"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover mix-blend-multiply"
            quality={85}
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-2xl" aria-hidden="true">
            🍸
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}>
          <h4 className="font-display font-bold text-base text-forest hover:text-terracotta transition-colors truncate">
            {cocktail.name}
          </h4>
        </Link>
        <p className="text-sm text-sage mt-1">
          Missing: <span className="text-forest">{missingIngredient.name}</span>
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddIngredient();
          }}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-terracotta hover:text-terracotta-dark transition-colors"
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
      <div className="h-7 bg-mist rounded-2xl w-48 mb-6" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-mist bg-white overflow-hidden">
            <div className="h-36 bg-mist" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-mist rounded w-3/4" />
              <div className="h-3 bg-mist rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
