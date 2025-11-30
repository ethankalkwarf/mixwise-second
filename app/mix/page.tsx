"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MixInventoryPanel } from "@/components/mix/MixInventoryPanel";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { MixSelectedBar } from "@/components/mix/MixSelectedBar";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { fetchMixData } from "@/lib/sanityMixData";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";
import { InformationCircleIcon, BookmarkIcon } from "@heroicons/react/24/outline";

// Show sign-up prompt after adding this many ingredients
const PROMPT_THRESHOLD = 3;

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  
  const { isAuthenticated } = useUser();
  const {
    ingredientIds,
    isLoading: barLoading,
    addIngredient,
    removeIngredient,
    setIngredients,
    clearAll,
    promptToSave,
  } = useBarIngredients();

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

  // Show save prompt for anonymous users after threshold
  useEffect(() => {
    if (
      !isAuthenticated &&
      !promptDismissed &&
      ingredientIds.length >= PROMPT_THRESHOLD
    ) {
      setShowSavePrompt(true);
    }
  }, [isAuthenticated, promptDismissed, ingredientIds.length]);

  // Handle ingredient toggle
  const handleInventoryChange = useCallback(async (newIds: string[]) => {
    await setIngredients(newIds);
  }, [setIngredients]);

  const handleAddToInventory = useCallback(async (id: string) => {
    const ingredient = allIngredients.find(i => i.id === id);
    await addIngredient(id, ingredient?.name);
  }, [addIngredient, allIngredients]);

  const handleRemoveFromInventory = useCallback(async (id: string) => {
    await removeIngredient(id);
  }, [removeIngredient]);

  const handleClearAll = useCallback(async () => {
    await clearAll();
  }, [clearAll]);

  const handleDismissPrompt = () => {
    setShowSavePrompt(false);
    setPromptDismissed(true);
  };

  const handleSavePromptClick = () => {
    setShowSavePrompt(false);
    promptToSave();
  };

  // Get selected ingredient objects
  const selectedIngredients = useMemo(() => {
    return ingredientIds
      .map((id) => allIngredients.find((i) => i.id === id))
      .filter((i): i is MixIngredient => i !== undefined);
  }, [ingredientIds, allIngredients]);

  // Get match counts for display
  const matchCounts = useMemo(() => {
    const stapleIds = allIngredients.filter((i) => i.isStaple).map((i) => i.id);
    const result = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });
    return {
      canMake: result.makeNow.length,
      almostThere: result.almostThere.length,
    };
  }, [allCocktails, allIngredients, ingredientIds]);

  if (dataLoading || barLoading) {
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
          {ingredientIds.length > 0 && (
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

        {/* Save Bar Prompt for Anonymous Users */}
        {showSavePrompt && !isAuthenticated && (
          <div className="mt-4 flex items-center justify-between p-4 bg-lime-500/10 border border-lime-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <BookmarkIcon className="w-6 h-6 text-lime-400" />
              <div>
                <p className="text-slate-200 font-medium">Want to save your bar?</p>
                <p className="text-sm text-slate-400">Create a free account so you never lose your ingredient list.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismissPrompt}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleSavePromptClick}
                className="px-4 py-2 bg-lime-500 text-slate-900 font-bold text-sm rounded-lg hover:bg-lime-400 transition-colors"
              >
                Save my bar
              </button>
            </div>
          </div>
        )}
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
            selectedIds={ingredientIds}
            onChange={handleInventoryChange}
          />
        </aside>

        {/* Results Panel */}
        <main role="main" aria-label="Cocktail results">
          <MixResultsPanel
            inventoryIds={ingredientIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={handleAddToInventory}
          />
        </main>
      </div>
    </div>
  );
}
