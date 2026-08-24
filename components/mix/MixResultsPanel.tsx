"use client";

import { useEffect, useMemo, useState } from "react";
import type { MixIngredient, MixCocktail, MixMatchGroups } from "@/lib/mixTypes";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { HostNightStoriesShare } from "@/components/share/HostNightStoriesShare";
import { HardNavLink } from "@/components/layout/HardNavLink";
import Image from "next/image";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { formatIngredientName, isNewCocktail } from "@/lib/formatters";
import { useInfiniteVisibleCount } from "@/hooks/useInfiniteVisibleCount";
import { trackEmptyStateSeen, trackMixResultClicked } from "@/lib/analytics";
import { markChecklistMade } from "@/lib/onboardingChecklist";

type Props = {
  inventoryIds: string[];
  allCocktails: MixCocktail[];
  allIngredients: MixIngredient[];
  onAddToInventory: (id: string) => void;
  showAllRecipes?: boolean;
  matchGroups: MixMatchGroups;
};

export function MixResultsPanel({
  inventoryIds,
  allCocktails,
  allIngredients,
  onAddToInventory,
  showAllRecipes = false,
  matchGroups
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { ready, almostThere } = matchGroups;

  useEffect(() => {
    if (ready.length > 0) {
      markChecklistMade();
    }
  }, [ready.length]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const source = ready;
    const cats = new Set(source.map((m) => m.cocktail.primarySpirit).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [ready]);

  // Filter and sort displayed drinks
  const displayedDrinks = useMemo(() => {
    let results;
    if (showAllRecipes) {
      results = allCocktails.map(c => ({
        cocktail: c,
        missingIngredientIds: [], // We'll calculate this if needed
        missingIngredientNames: []
      }));
    } else {
      results = [...ready];
    }

    // Filter by category
    if (activeCategory) {
      results = results.filter((r) => r.cocktail.primarySpirit === activeCategory);
    }

    // Sort
    return results.sort((a, b) => {
      if (a.cocktail.isPopular && !b.cocktail.isPopular) return -1;
      if (!a.cocktail.isPopular && b.cocktail.isPopular) return 1;
      return a.cocktail.name.localeCompare(b.cocktail.name);
    });
  }, [ready, activeCategory, showAllRecipes, allCocktails]);

  const { visibleItems: visibleDrinks, hasMore, loadMoreRef } = useInfiniteVisibleCount(displayedDrinks);

  useEffect(() => {
    if (displayedDrinks.length === 0 && !showAllRecipes) {
      void trackEmptyStateSeen("mix_results", {
        inventory_count: inventoryIds.length,
      });
    }
  }, [displayedDrinks.length, showAllRecipes, inventoryIds.length]);

  // Smart additions
  const unlockPotential = useMemo(() => {
    const immediateUnlockCounts = new Map<string, { count: number; drinks: string[] }>();

    almostThere.forEach((match) => {
      // Safety check: ensure missingIngredientIds exists and has elements
      if (!match.missingIngredientIds || match.missingIngredientIds.length === 0) {
        return; // Skip cocktails that don't have missing required ingredients
      }

      const missingId = match.missingIngredientIds[0];
      if (!missingId) return;
      const current = immediateUnlockCounts.get(missingId) || { count: 0, drinks: [] };
      current.count += 1;
      if (current.drinks.length < 3) current.drinks.push(match.cocktail.name);
      immediateUnlockCounts.set(missingId, current);
    });

    return Array.from(immediateUnlockCounts.entries())
      .map(([id, data]) => {
        const ing = allIngredients.find((i) => i.id === id);

        // Skip ingredients that can't be found in the ingredients list
        // This prevents showing "Unknown Ingredient" for data integrity issues
        if (!ing) {
          console.warn('[MIX-WARN] Skipping unknown ingredient ID:', id, '- not found in ingredients list');
          return null;
        }

        return {
          id,
          name: ing.name,
          category: ing.category,
          imageUrl: ing.imageUrl,
          count: data.count,
          drinks: data.drinks
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => (b?.count || 0) - (a?.count || 0))
      .slice(0, 6);
  }, [almostThere, allIngredients]);

  const unlockTotal = useMemo(
    () => unlockPotential.reduce((sum, item) => sum + (item?.count || 0), 0),
    [unlockPotential]
  );

  return (
    <section className="space-y-10 pb-24 min-w-0" aria-label="Cocktail results">
      {/* Header & Search */}
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest truncate">
              {showAllRecipes ? "All Recipes" : "Ready to Mix"}
            </h2>
            {displayedDrinks.length > 0 && (
              <span
                className={`flex-shrink-0 px-3 py-1 rounded-full text-base font-bold font-mono border ${
                  showAllRecipes
                    ? "bg-sage/10 border-sage/20 text-sage"
                    : "bg-olive/10 border-olive/20 text-olive"
                }`}
                aria-label={`${displayedDrinks.length} cocktails`}
              >
                {displayedDrinks.length}
              </span>
            )}
            {!showAllRecipes && inventoryIds.length > 0 && ready.length > 0 && (
              <ShareBarButton
                variant="inline"
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:text-terracotta-dark"
                stats={{
                  ingredientCount: inventoryIds.length,
                  makeableCount: ready.length,
                }}
              />
            )}
          </div>
        </div>
        {!showAllRecipes && ready.length > 0 && (
          <HostNightStoriesShare
            className="mb-4"
            drinks={ready.slice(0, 5).map((m) => ({
              name: m.cocktail.name,
              slug: m.cocktail.slug,
            }))}
          />
        )}
        {!showAllRecipes && ready.length === 0 && unlockPotential[0] && (
          <HostNightStoriesShare
            className="mb-4"
            missingBottle={unlockPotential[0].name}
            drinks={(unlockPotential[0].drinks || []).map((name) => ({ name }))}
          />
        )}

        {/* Category Filters */}
        {displayedDrinks.length > 0 && availableCategories.length > 0 && (
          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-4 max-w-full"
            role="tablist"
            aria-label="Filter by spirit"
          >
            <button
              onClick={() => setActiveCategory(null)}
              role="tab"
              aria-selected={activeCategory === null}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                activeCategory === null
                  ? "bg-terracotta text-cream border-terracotta"
                  : "bg-white border-mist text-sage hover:bg-mist"
              }`}
            >
              All
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-all capitalize ${
                  activeCategory === cat
                    ? "bg-terracotta text-cream border-terracotta"
                    : "bg-white border-mist text-sage hover:bg-mist"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {displayedDrinks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center p-8 sm:p-10 border border-dashed border-mist rounded-3xl bg-white text-center min-h-[240px] sm:min-h-[280px] w-full max-w-full box-border"
            role="status"
          >
            <div className="text-5xl sm:text-6xl mb-4 opacity-70" aria-hidden="true">🍹</div>
            <h3 className="text-forest font-display font-bold mb-3 text-xl sm:text-2xl">
              {showAllRecipes
                ? "No recipes available"
                : inventoryIds.length === 0
                ? "What's in your bar?"
                : "Almost there!"}
            </h3>
            <p className="text-sage text-sm sm:text-base max-w-md leading-relaxed mx-auto">
              {showAllRecipes
                ? "There are no cocktail recipes available at the moment."
                : inventoryIds.length === 0
                ? "Select the ingredients you have from the cabinet. We'll show you all the cocktails you can make."
                : "Add a few more ingredients to unlock your first cocktails. Check the suggestions below!"}
            </p>
            {!showAllRecipes && inventoryIds.length > 0 && (
              <div className="mt-4 text-sm sm:text-base text-sage">
                <span className="text-olive font-bold">{inventoryIds.length}</span>{" "}
                ingredient{inventoryIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* Cocktail Grid — minmax(0,1fr) via min-w-0 on cards keeps previews inside the page */}
        {displayedDrinks.length > 0 && (
          <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 min-w-0" role="list">
            {visibleDrinks.map(({ cocktail, missingIngredientIds, missingIngredientNames }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                missingCount={missingIngredientIds.length}
                missingNames={missingIngredientNames}
              />
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8 text-sage text-sm">
              Loading more recipes...
            </div>
          )}
          </>
        )}
      </div>


      {/* Smart additions — one bottle away */}
      {!showAllRecipes && unlockPotential.length > 0 && (
        <div className="border-t border-mist pt-12 min-w-0" aria-labelledby="smart-additions-title">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 min-w-0">
              <h2
                id="smart-additions-title"
                className="text-2xl sm:text-3xl font-display font-bold text-forest truncate"
              >
                Worth adding
              </h2>
              {unlockTotal > 0 && (
                <span
                  className="flex-shrink-0 px-3 py-1 rounded-full text-base font-bold font-mono border bg-terracotta/10 border-terracotta/20 text-terracotta"
                  aria-label={`${unlockTotal} cocktails within reach`}
                >
                  +{unlockTotal}
                </span>
              )}
            </div>
            <p className="text-sage text-sm sm:text-base leading-relaxed max-w-xl">
              One more bottle unlocks drinks you&apos;re already close to making.
            </p>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 min-w-0" role="list">
            {unlockPotential.slice(0, 9).map(
              (item, index) =>
                item && (
                  <div
                    key={item.id}
                    className={`group flex gap-4 p-4 rounded-2xl border bg-white transition-all min-w-0 overflow-hidden ${
                      index === 0
                        ? "border-terracotta/35 hover:border-terracotta/50 hover:shadow-soft"
                        : "border-mist hover:border-terracotta/30 hover:shadow-soft"
                    }`}
                    role="listitem"
                  >
                    <div className="relative flex-shrink-0 h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-mist">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                          quality={75}
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-terracotta/5 px-2">
                          <span className="font-display text-xl font-bold leading-none text-terracotta">
                            +{item.count}
                          </span>
                          <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wide text-sage">
                            drinks
                          </span>
                        </div>
                      )}
                      {item.imageUrl && (
                        <div className="absolute bottom-1.5 left-1.5 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[10px] font-bold text-terracotta shadow-sm">
                          +{item.count}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                      {index === 0 && (
                        <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta">
                          Best unlock
                        </p>
                      )}
                      {item.category && (
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sage">
                          {item.category}
                        </p>
                      )}
                      <h3 className="font-display text-lg font-bold leading-tight text-forest break-words">
                        {formatIngredientName(item.name)}
                      </h3>
                      {item.drinks.length > 0 && (
                        <p className="mt-1 text-sm leading-relaxed text-sage line-clamp-2">
                          Unlocks {item.drinks.join(", ")}
                          {item.count > item.drinks.length ? ` +${item.count - item.drinks.length} more` : ""}
                        </p>
                      )}
                      <button
                        onClick={() => onAddToInventory(item.id)}
                        className="mt-2.5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded-lg"
                        aria-label={`Add ${item.name} to unlock ${item.count} more cocktails`}
                      >
                        <PlusIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        Add to bar
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>

          {unlockPotential.length > 9 && (
            <p className="mt-5 text-center text-sm text-sage">
              Plus {unlockPotential.length - 9} more bottles that unlock additional drinks
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function CocktailCard({
  cocktail,
  missingCount,
  missingNames = []
}: {
  cocktail: MixCocktail;
  missingCount: number;
  missingNames?: string[];
}) {
  const isReady = missingCount === 0;

  return (
    <HardNavLink
      href={`/cocktails/${cocktail.slug}?from=mix`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void trackMixResultClicked(cocktail.slug, isReady ? "ready" : "almost");
      }}
      className={`group relative flex flex-col min-w-0 w-full overflow-hidden rounded-3xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta/50 ${
        isReady
          ? "bg-white border-mist hover:border-olive/40 hover:shadow-card-hover hover:-translate-y-1"
          : "bg-cream/50 border-mist/60 opacity-80 hover:opacity-100 hover:border-mist"
      }`}
      role="listitem"
      aria-label={`${cocktail.name}${isReady ? ", ready to make" : `, missing ${missingCount} ingredient${missingCount > 1 ? "s" : ""}`}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
        {cocktail.imageUrl ? (
          <>
            <Image
              src={cocktail.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply ${
                isReady ? "opacity-90 group-hover:opacity-100" : "opacity-60 grayscale-[0.5]"
              }`}
              quality={75}
              placeholder="blur"
              blurDataURL={COCKTAIL_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <ComingSoonCocktailImage name={cocktail.name} size="card" />
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 items-start">
          {isReady && (
            <div className="bg-olive text-cream text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              ✓ READY
            </div>
          )}
          {isNewCocktail(cocktail.createdAt) && (
            <div className="bg-terracotta text-cream text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm tracking-wider">
              NEW
            </div>
          )}
          {cocktail.isPopular && (
            <div className="bg-terracotta text-cream text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm tracking-wider">
              ★ FEATURED
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10 -mt-12 min-w-0">
        <div
          className={`backdrop-blur-md rounded-2xl p-4 border border-mist/50 shadow-soft flex-1 flex flex-col min-w-0 ${
            isReady ? "bg-white/90" : "bg-cream/80"
          }`}
        >
          <div className="mb-3 min-w-0">
            {cocktail.primarySpirit && (
              <p className="font-mono text-xs text-terracotta font-bold tracking-widest uppercase mb-1.5 truncate">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3
              className={`font-display font-bold text-xl leading-tight break-words ${
                isReady ? "text-forest" : "text-sage"
              }`}
            >
              {cocktail.name}
            </h3>
          </div>
          
          {/* Show missing ingredients if not ready */}
          {!isReady && missingNames.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {missingNames.slice(0, 3).map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-terracotta/10 text-terracotta text-xs font-medium rounded-full max-w-full"
                >
                  <XMarkIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatIngredientName(name)}</span>
                </span>
              ))}
              {missingNames.length > 3 && (
                <span className="text-xs text-sage">+{missingNames.length - 3} more</span>
              )}
            </div>
          )}
          
          <p className="text-sm text-sage line-clamp-2 mt-auto leading-relaxed break-words">
            {cocktail.ingredients.map((i) => formatIngredientName(i.name)).join(", ")}
          </p>
        </div>
      </div>
    </HardNavLink>
  );
}
