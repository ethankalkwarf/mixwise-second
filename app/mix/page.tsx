"use client";

import { useEffect, useState, useMemo } from "react";
import { MixInventoryPanel } from "@/components/mix/MixInventoryPanel";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { MixSelectedBar } from "@/components/mix/MixSelectedBar";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { fetchMixData } from "@/lib/sanityMixData";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "mixwise-bar-inventory";

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data from Sanity
  useEffect(() => {
    async function loadData() {
      try {
        const { ingredients, cocktails } = await fetchMixData();
        setAllIngredients(ingredients);
        setAllCocktails(cocktails);
      } catch (error) {
        console.error("Failed to load data from Sanity:", error);
        setDataError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  // Load inventory from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInventoryIds(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load inventory from localStorage:", error);
    }
  }, []);

  // Save inventory to localStorage
  const handleInventoryChange = (newIds: string[]) => {
    setInventoryIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch (error) {
      console.error("Failed to save inventory to localStorage:", error);
    }
  };

  const handleAddToInventory = (id: string) => {
    if (!inventoryIds.includes(id)) {
      handleInventoryChange([...inventoryIds, id]);
    }
  };

  const handleRemoveFromInventory = (id: string) => {
    handleInventoryChange(inventoryIds.filter((i) => i !== id));
  };

  const handleClearAll = () => {
    handleInventoryChange([]);
  };

  // Get selected ingredient objects
  const selectedIngredients = useMemo(() => {
    return inventoryIds
      .map((id) => allIngredients.find((i) => i.id === id))
      .filter((i): i is MixIngredient => i !== undefined);
  }, [inventoryIds, allIngredients]);

  // Get match counts for display
  const matchCounts = useMemo(() => {
    const stapleIds = allIngredients.filter((i) => i.isStaple).map((i) => i.id);
    const result = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: inventoryIds,
      stapleIngredientIds: stapleIds,
    });
    return {
      canMake: result.makeNow.length,
      almostThere: result.almostThere.length,
    };
  }, [allCocktails, allIngredients, inventoryIds]);

  if (dataLoading) {
    return <MixSkeleton />;
  }

  if (dataError) {
    return (
      <div className="mix-page flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 mb-3">
            Unable to Load Data
          </h2>
          <p className="text-slate-400 text-lg">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-lime-500 text-slate-900 rounded-xl font-bold hover:bg-lime-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mix-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header with Instructions */}
      <header className="mb-8" role="banner">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 mb-2">
              Mix Tool
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Discover cocktails you can make with ingredients you already have.
            </p>
          </div>
          {inventoryIds.length > 0 && (
            <div className="flex items-center gap-4 text-base">
              <span className="text-slate-400">
                <span className="font-bold text-lime-400 text-xl">{matchCounts.canMake}</span>{" "}
                cocktails ready
              </span>
              {matchCounts.almostThere > 0 && (
                <span className="text-slate-500">
                  <span className="font-bold text-amber-400">{matchCounts.almostThere}</span> almost
                </span>
              )}
            </div>
          )}
        </div>

        {/* Helper Instructions */}
        <div
          className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-base"
          role="note"
          aria-label="How to use the Mix tool"
        >
          <InformationCircleIcon className="w-6 h-6 text-lime-400 flex-shrink-0 mt-0.5" />
          <div className="text-slate-400">
            <span className="font-semibold text-slate-300">How it works:</span>{" "}
            Select the ingredients you have in your bar from the panel below. We&apos;ll instantly show you
            all the cocktails you can make, plus suggestions for ingredients that unlock the most new recipes.
          </div>
        </div>
      </header>

      {/* Selected Ingredients Bar */}
      {selectedIngredients.length > 0 && (
        <MixSelectedBar
          selectedIngredients={selectedIngredients}
          onRemove={handleRemoveFromInventory}
          onClearAll={handleClearAll}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Inventory Panel */}
        <aside className="lg:sticky lg:top-24" role="complementary" aria-label="Ingredient selection">
          <MixInventoryPanel
            ingredients={allIngredients}
            selectedIds={inventoryIds}
            onChange={handleInventoryChange}
          />
        </aside>

        {/* Results Panel */}
        <main role="main" aria-label="Cocktail results">
          <MixResultsPanel
            inventoryIds={inventoryIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={handleAddToInventory}
          />
        </main>
      </div>
    </div>
  );
}
