"use client";

import { useMemo, useState } from "react";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixIngredient, MixCocktail, MixMatchResult } from "@/lib/mixTypes";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

type Props = {
  inventoryIds: string[];
  allCocktails: MixCocktail[];
  allIngredients: MixIngredient[];
  onAddToInventory: (id: string) => void;
};

export function MixResultsPanel({
  inventoryIds,
  allCocktails,
  allIngredients,
  onAddToInventory
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get staple ingredient IDs
  const stapleIds = useMemo(() => {
    return allIngredients.filter((i) => i.isStaple).map((i) => i.id);
  }, [allIngredients]);

  // Run matching engine
  const { makeNow, almostThere, all } = useMemo(
    () =>
      getMixMatchGroups({
        cocktails: allCocktails,
        ownedIngredientIds: inventoryIds,
        stapleIngredientIds: stapleIds
      }),
    [allCocktails, inventoryIds, stapleIds]
  );

  // Get available categories
  const availableCategories = useMemo(() => {
    const source = searchQuery ? all : makeNow;
    const cats = new Set(source.map((m) => m.cocktail.primarySpirit).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [makeNow, all, searchQuery]);

  // Filter and sort displayed drinks
  const displayedDrinks = useMemo(() => {
    let results = searchQuery ? [...all] : [...makeNow];

    // Filter by search - searches cocktail name and ingredient names
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter((r) => {
        // Match cocktail name
        if (r.cocktail.name.toLowerCase().includes(q)) return true;
        // Match ingredient names
        if (r.cocktail.ingredients.some(ing => ing.name.toLowerCase().includes(q))) return true;
        // Match primary spirit
        if (r.cocktail.primarySpirit?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // Filter by category
    if (activeCategory) {
      results = results.filter((r) => r.cocktail.primarySpirit === activeCategory);
    }

    // Sort: ready first, then popular, then alphabetical
    return results.sort((a, b) => {
      if (searchQuery) {
        const aReady = a.missingIngredientIds.length === 0;
        const bReady = b.missingIngredientIds.length === 0;
        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;
      }
      if (a.cocktail.isPopular && !b.cocktail.isPopular) return -1;
      if (!a.cocktail.isPopular && b.cocktail.isPopular) return 1;
      return a.cocktail.name.localeCompare(b.cocktail.name);
    });
  }, [makeNow, all, searchQuery, activeCategory]);

  // Smart additions (ingredients that unlock the most cocktails)
  const unlockPotential = useMemo(() => {
    const immediateUnlockCounts = new Map<string, { count: number; drinks: string[] }>();
    
    almostThere.forEach((match) => {
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
        return {
          id,
          name: ing?.name || "Unknown",
          category: ing?.category || "Other",
          count: data.count,
          drinks: data.drinks
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [almostThere, allIngredients]);

  return (
    <section className="space-y-12 pb-24">
      {/* Header & Search */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-serif font-bold text-white">
              {searchQuery ? "Search Results" : "Ready to Mix"}
            </h2>
            {displayedDrinks.length > 0 && (
              <div
                className={`px-3 py-0.5 rounded-full text-sm font-bold font-mono border ${
                  searchQuery
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    : "bg-lime-500/10 border-lime-500/20 text-lime-400"
                }`}
              >
                {displayedDrinks.length}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search all recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          </div>
        </div>

        {/* Category Filters - only show when there are results */}
        {displayedDrinks.length > 0 && availableCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === null
                  ? "bg-lime-500 text-slate-900 border-lime-500"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
              }`}
            >
              All
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                  activeCategory === cat
                    ? "bg-lime-500 text-slate-900 border-lime-500"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty State - Show when no ingredients selected or no matches */}
        {displayedDrinks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-700/50 rounded-2xl bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-center min-h-[400px]">
            <div className="text-6xl mb-6 opacity-70">🍹</div>
            <h3 className="text-slate-100 font-serif font-bold mb-3 text-2xl">
              {searchQuery 
                ? "No matches found" 
                : inventoryIds.length === 0 
                ? "What's in your bar?" 
                : "Almost there!"}
            </h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or clear the search to see available drinks."
                : inventoryIds.length === 0
                ? "Select the ingredients you have from the panel on the left. We'll show you all the cocktails you can make."
                : "Add a few more ingredients to unlock your first cocktails. Check the suggestions below!"}
            </p>
            {!searchQuery && inventoryIds.length > 0 && (
              <div className="mt-6 text-xs text-slate-500">
                <span className="text-lime-400 font-bold">{inventoryIds.length}</span> ingredient{inventoryIds.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}

        {/* Cocktail Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedDrinks.map(({ cocktail, missingIngredientIds }) => (
            <CocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              missingCount={missingIngredientIds.length}
            />
          ))}
        </div>
      </div>

      {/* Smart Additions */}
      {!searchQuery && unlockPotential.length > 0 && (
        <div className="border-t border-slate-800/50 pt-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-serif font-bold text-white">Smart Additions</h2>
            <span className="text-sm text-slate-500">Unlocks new recipes</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {unlockPotential.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-lime-500/30 transition-all h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xl font-bold text-lime-400 leading-none">
                      +{item.count}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                      Drinks
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 pt-1">
                    <h4 className="font-bold text-slate-100 text-lg leading-tight break-words">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                      {item.category}
                    </span>
                    {item.drinks.length > 0 && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        Unlocks: {item.drinks.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onAddToInventory(item.id)}
                  className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-lime-500/10 text-lime-400 border border-lime-500/20 hover:bg-lime-500 hover:text-slate-900 hover:border-lime-500 transition-all font-bold text-xs uppercase tracking-wide"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add to Bar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CocktailCard({
  cocktail,
  missingCount
}: {
  cocktail: MixCocktail;
  missingCount: number;
}) {
  const isReady = missingCount === 0;

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className={`cursor-pointer group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isReady
          ? "bg-slate-900 border-slate-800 hover:border-lime-500/40 hover:shadow-xl hover:shadow-lime-900/10"
          : "bg-slate-900/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-700"
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        {cocktail.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cocktail.imageUrl}
              alt={cocktail.name}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                isReady ? "opacity-90 group-hover:opacity-100" : "opacity-60 grayscale-[0.5]"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-4xl">
            🥃
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 items-start">
          {!isReady && (
            <div className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm">
              MISSING {missingCount}
            </div>
          )}
          {cocktail.isPopular && (
            <div className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm tracking-wider">
              ★ FEATURED
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10 -mt-16">
        <div
          className={`backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg flex-1 flex flex-col ${
            isReady ? "bg-slate-950/80" : "bg-slate-950/60"
          }`}
        >
          <div className="mb-2">
            {cocktail.primarySpirit && (
              <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase mb-1">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3
              className={`font-serif font-bold text-xl leading-tight ${
                isReady ? "text-slate-100" : "text-slate-300"
              }`}
            >
              {cocktail.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mt-auto">
            {cocktail.ingredients.map((i) => i.name).join(", ")}
          </p>
        </div>
      </div>
    </Link>
  );
}

