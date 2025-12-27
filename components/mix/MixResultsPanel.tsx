"use client";

import { useMemo, useState } from "react";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixIngredient, MixCocktail, MixMatchResult } from "@/lib/mixTypes";
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import Image from "next/image";

type Props = {
  inventoryIds: string[];
  allCocktails: MixCocktail[];
  allIngredients: MixIngredient[];
  onAddToInventory: (id: string) => void;
  showAllRecipes?: boolean;
};

export function MixResultsPanel({
  inventoryIds,
  allCocktails,
  allIngredients,
  onAddToInventory,
  showAllRecipes = false
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get staple ingredient IDs
  const stapleIds = useMemo(() => {
    return allIngredients.filter((i) => i.isStaple).map((i) => i.id);
  }, [allIngredients]);

  // Run matching engine
  const { ready, almostThere, far } = useMemo(
    () =>
      getMixMatchGroups({
        cocktails: allCocktails,
        ownedIngredientIds: inventoryIds,
        stapleIngredientIds: stapleIds,
        maxMissing: 2 // Default max missing ingredients for "almost there"
      }),
    [allCocktails, inventoryIds, stapleIds]
  );

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
  }, [ready, activeCategory]);

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
          count: data.count,
          drinks: data.drinks
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => (b?.count || 0) - (a?.count || 0))
      .slice(0, 6);
  }, [almostThere, allIngredients]);

  return (
    <section className="space-y-10 pb-24" aria-label="Cocktail results">
      {/* Header & Search */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest">
              {showAllRecipes ? "All Recipes" : "Ready to Mix"}
            </h2>
            {displayedDrinks.length > 0 && (
              <span
                className={`px-3 py-1 rounded-full text-base font-bold font-mono border ${
                  showAllRecipes
                    ? "bg-sage/10 border-sage/20 text-sage"
                    : "bg-olive/10 border-olive/20 text-olive"
                }`}
                aria-label={`${displayedDrinks.length} cocktails`}
              >
                {displayedDrinks.length}
              </span>
            )}
          </div>

        </div>

        {/* Category Filters */}
        {displayedDrinks.length > 0 && availableCategories.length > 0 && (
          <div 
            className="flex gap-2 overflow-x-auto scrollbar-none pb-4 -mx-1 px-1"
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
            className="flex flex-col items-center justify-center p-12 sm:p-16 border border-dashed border-mist rounded-3xl bg-white text-center min-h-[350px]"
            role="status"
          >
            <div className="text-7xl mb-6 opacity-70" aria-hidden="true">🍹</div>
            <h3 className="text-forest font-display font-bold mb-4 text-2xl sm:text-3xl">
              {showAllRecipes
                ? "No recipes available"
                : inventoryIds.length === 0
                ? "What's in your bar?"
                : "Almost there!"}
            </h3>
            <p className="text-sage text-base sm:text-lg max-w-md leading-relaxed mx-auto">
              {showAllRecipes
                ? "There are no cocktail recipes available at the moment."
                : inventoryIds.length === 0
                ? "Select the ingredients you have from the cabinet. We'll show you all the cocktails you can make."
                : "Add a few more ingredients to unlock your first cocktails. Check the suggestions below!"}
            </p>
            {!showAllRecipes && inventoryIds.length > 0 && (
              <div className="mt-6 text-base text-sage">
                <span className="text-olive font-bold">{inventoryIds.length}</span>{" "}
                ingredient{inventoryIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* Cocktail Grid */}
        {displayedDrinks.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list">
            {displayedDrinks.map(({ cocktail, missingIngredientIds, missingIngredientNames }) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                missingCount={missingIngredientIds.length}
                missingNames={missingIngredientNames}
              />
            ))}
          </div>
        )}
      </div>


      {/* Smart Additions - Enhanced Recipe Boosters */}
      {!showAllRecipes && unlockPotential.length > 0 && (
        <div className="border-t border-mist pt-12" aria-labelledby="smart-additions-title">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-terracotta/20 rounded-2xl flex items-center justify-center border border-terracotta/30">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h2 id="smart-additions-title" className="text-2xl sm:text-3xl font-display font-bold text-forest">
                  Strategic Acquisitions
                </h2>
                <p className="text-base text-sage">Curated additions to unlock new realms of possibility</p>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-terracotta/5 to-olive/5 border border-terracotta/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-terracotta font-bold">+{unlockPotential.reduce((sum, item) => sum + (item?.count || 0), 0)}</span>
                  <span className="text-sage">additional masterpieces</span>
                </div>
                <div className="text-sage">•</div>
                <div className="flex items-center gap-2">
                  <span className="text-olive font-bold">{unlockPotential.length}</span>
                  <span className="text-sage">curated selections</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
            {unlockPotential.slice(0, 9).map((item, index) => (
              item && (
              <div
                key={item.id}
                className={`group flex flex-col p-5 rounded-3xl bg-white border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${
                  index === 0
                    ? "border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent shadow-lg"
                    : "border-mist hover:border-terracotta/30"
                }`}
                role="listitem"
              >
                {/* Priority badge for top recommendation */}
                {index === 0 && (
                  <div className="flex justify-end mb-2">
                    <div className="bg-terracotta text-cream text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ TOP PICK
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-20 h-16 bg-terracotta/10 rounded-2xl flex flex-col items-center justify-center border border-terracotta/20 px-2">
                    <span className="text-xl font-bold text-terracotta leading-none">
                      +{item.count}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-sage uppercase mt-1 tracking-wide text-center leading-tight">
                      More Drinks
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 pt-1 flex-1">
                    <h4 className="font-bold text-forest text-lg leading-tight break-words">
                      {item.name}
                    </h4>
                    <span className="font-mono text-xs font-bold text-sage uppercase tracking-wider mt-1">
                      {item.category}
                    </span>
                    {item.drinks.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-sage uppercase tracking-wider mb-1">
                          Unlocks these drinks:
                        </p>
                        <p className="text-sm text-forest font-medium line-clamp-2">
                          {item.drinks.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onAddToInventory(item.id)}
                  className={`mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all font-bold text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-terracotta/50 ${
                    index === 0
                      ? "bg-terracotta text-cream border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark shadow-lg shadow-terracotta/20"
                      : "bg-terracotta/10 text-terracotta border-terracotta/20 hover:bg-terracotta hover:text-cream hover:border-terracotta"
                  }`}
                  aria-label={`Add ${item.name} to unlock ${item.count} more cocktails`}
                >
                  <PlusIcon className="w-5 h-5" aria-hidden="true" />
                  Add & Unlock {item.count} More
                </button>
              </div>
              )
            ))}
          </div>

          {unlockPotential.length > 9 && (
            <div className="text-center mt-6">
              <p className="text-sm text-sage">
                Plus {unlockPotential.length - 9} additional selections waiting to elevate your repertoire...
              </p>
            </div>
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
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta/50 ${
        isReady
          ? "bg-white border-mist hover:border-olive/40 hover:shadow-card-hover hover:-translate-y-2"
          : "bg-cream/50 border-mist/60 opacity-80 hover:opacity-100 hover:border-mist"
      }`}
      role="listitem"
      aria-label={`${cocktail.name}${isReady ? ", ready to make" : `, missing ${missingCount} ingredient${missingCount > 1 ? "s" : ""}`}`}
    >
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-mist">
        {cocktail.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cocktail.imageUrl}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply ${
                isReady ? "opacity-90 group-hover:opacity-100" : "opacity-60 grayscale-[0.5]"
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-5xl" aria-hidden="true">
            🥃
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 items-start">
          {isReady && (
            <div className="bg-olive text-cream text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              ✓ READY
            </div>
          )}
          {cocktail.isPopular && (
            <div className="bg-terracotta text-cream text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm tracking-wider">
              ★ FEATURED
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10 -mt-14">
        <div
          className={`backdrop-blur-md rounded-2xl p-4 border border-mist/50 shadow-soft flex-1 flex flex-col ${
            isReady ? "bg-white/90" : "bg-cream/80"
          }`}
        >
          <div className="mb-3">
            {cocktail.primarySpirit && (
              <p className="font-mono text-xs text-terracotta font-bold tracking-widest uppercase mb-1.5">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3
              className={`font-display font-bold text-xl leading-tight ${
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-terracotta/10 text-terracotta text-xs font-medium rounded-full"
                >
                  <XMarkIcon className="w-3 h-3" />
                  {name}
                </span>
              ))}
              {missingNames.length > 3 && (
                <span className="text-xs text-sage">+{missingNames.length - 3} more</span>
              )}
            </div>
          )}
          
          <p className="text-sm text-sage line-clamp-2 mt-auto leading-relaxed">
            {cocktail.ingredients.map((i) => i.name).join(", ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
