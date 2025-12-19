"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MixInventoryPanel } from "@/components/mix/MixInventoryPanel";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { MixSelectedBar } from "@/components/mix/MixSelectedBar";
import { MixSkeleton } from "@/components/mix/MixSkeleton";
import { getMixDataClient, getUserBarIngredientIdsClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";
import { InformationCircleIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

// Show sign-up prompt after adding this many ingredients
const PROMPT_THRESHOLD = 3;

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const { isAuthenticated, user } = useUser();
  const {
    ingredientIds,
    isLoading: barLoading,
    addIngredient,
    removeIngredient,
    setIngredients,
    clearAll,
    promptToSave,
  } = useBarIngredients();

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
        try {
        const { ingredients, cocktails } = await getMixDataClient();

        // Debug: Check cocktail structure
        if (process.env.NODE_ENV === 'development' && cocktails.length > 0) {
          console.log('[MIX-DEBUG] First cocktail structure:', {
            id: cocktails[0].id,
            name: cocktails[0].name,
            hasIngredients: !!cocktails[0].ingredients,
            ingredientsType: typeof cocktails[0].ingredients,
            ingredientsIsArray: Array.isArray(cocktails[0].ingredients),
            ingredientsLength: cocktails[0].ingredients?.length || 0,
            sampleIngredient: cocktails[0].ingredients?.[0]
          });
        }

        // Guard: Filter out cocktails with missing or empty ingredients arrays
        console.log('[MIX-DEBUG] Filtering cocktails, total:', cocktails.length);
        console.log('[MIX-DEBUG] First cocktail sample:', cocktails[0]);

        const validCocktails = cocktails.filter(cocktail => {
          const isValid = cocktail &&
                         cocktail.ingredients &&
                         Array.isArray(cocktail.ingredients) &&
                         cocktail.ingredients.length > 0;

          if (!isValid) {
            console.log('[MIX-DEBUG] Invalid cocktail:', {
              id: cocktail.id,
              name: cocktail.name,
              hasIngredients: !!cocktail.ingredients,
              ingredientsType: typeof cocktail.ingredients,
              ingredientsIsArray: Array.isArray(cocktail.ingredients),
              ingredientsLength: cocktail.ingredients?.length || 0,
              cocktailKeys: Object.keys(cocktail)
            });
          }

          return isValid;
        });

        console.log('[MIX-DEBUG] After filtering: valid cocktails:', validCocktails.length);

        // Development-only warning for excluded cocktails
        if (process.env.NODE_ENV === 'development') {
          const excludedCount = cocktails.length - validCocktails.length;
          if (excludedCount > 0) {
            console.warn(`[MIX-DEBUG] Excluded ${excludedCount} cocktails with missing/empty ingredients (total: ${cocktails.length}, valid: ${validCocktails.length})`);
          }
        }

        console.log(`[MIX-DEBUG] Setting state: ${ingredients.length} ingredients, ${validCocktails.length} valid cocktails`);
        setAllIngredients(ingredients || []);
        setAllCocktails(validCocktails || []);
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        setDataError(error instanceof Error ? error.message : "Unknown error");
        // Still set empty data to prevent infinite loading
        setAllIngredients([]);
        setAllCocktails([]);
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
    if (!ingredientIds || !allIngredients) return [];
    return ingredientIds
      .map((id) => allIngredients.find((i) => i.id === id))
      .filter((i): i is MixIngredient => i !== undefined);
  }, [ingredientIds, allIngredients]);

  // Get match counts for display - only run when all data is loaded and stable
  const matchCounts = useMemo(() => {
    // CRITICAL: Only run matching when ALL data is loaded and we have cocktails with ingredients
    if (dataLoading || !allCocktails || allCocktails.length === 0 || !allIngredients || allIngredients.length === 0 || !ingredientIds) {
      console.log('[MIX-DEBUG] Skipping matching - data not ready:', {
        dataLoading,
        cocktailsLoaded: allCocktails?.length || 0,
        ingredientsLoaded: allIngredients?.length || 0,
        hasIngredientIds: !!ingredientIds
      });
      return { canMake: 0, almostThere: 0 };
    }

    // Additional check: ensure at least one cocktail has ingredients
    const cocktailsWithIngredients = allCocktails.filter(c => c.ingredients && c.ingredients.length > 0);
    if (cocktailsWithIngredients.length === 0) {
      console.log('[MIX-DEBUG] Skipping matching - no cocktails have ingredients data');
      return { canMake: 0, almostThere: 0 };
    }

    const stapleIds = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);

    // TEMPORARY DEBUG LOGGING - ALWAYS SHOW FOR TROUBLESHOOTING
    console.log('[MIX-DEBUG] 🟢 RUNNING MATCHING LOGIC');
    console.log('[MIX-DEBUG] ownedIngredientIds (first 10):', ingredientIds.slice(0, 10));
    console.log('[MIX-DEBUG] stapleIds (first 10):', stapleIds.slice(0, 10));
    console.log('[MIX-DEBUG] cocktailsLoaded:', allCocktails.length);
    console.log('[MIX-DEBUG] cocktailsWithIngredients:', cocktailsWithIngredients.length);

    if (process.env.NODE_ENV === 'development') {
      console.log('[MIX-DEBUG] ownedIngredientIds:', ingredientIds);
      console.log('[MIX-DEBUG] stapleIds:', stapleIds);
      console.log('[MIX-DEBUG] cocktailsWithIngredients count:', cocktailsWithIngredients.length);

      if (allCocktails && allCocktails.length > 0) {
        console.log('[MIX-DEBUG] first cocktail ingredients (first 3):', allCocktails[0]?.ingredients?.slice(0, 3) || []);
        // Find Margarita specifically
        const margarita = allCocktails.find(c => c.name === 'Margarita');
        if (margarita) {
          console.log('[MIX-DEBUG] Margarita found with ingredients:', margarita.ingredients);
          console.log('[MIX-DEBUG] Margarita ingredient IDs:', margarita.ingredients?.map(i => i.id) || []);
        } else {
          console.log('[MIX-DEBUG] Margarita not found in cocktails');
        }

        // Check if Margarita's ingredients are in owned list
        if (margarita) {
          const margaritaRequired = margarita.ingredients.filter(i => !i.isOptional);
          const margaritaRequiredIds = margaritaRequired.map(i => i.id);
          const ownedSet = new Set(ingredientIds);
          const missingFromMargarita = margaritaRequiredIds.filter(id => !ownedSet.has(id));
          console.log('[MIX-DEBUG] Margarita required IDs:', margaritaRequiredIds);
          console.log('[MIX-DEBUG] Missing from Margarita:', missingFromMargarita);
        }
      }
    }

    const result = getMixMatchGroups({
      cocktails: cocktailsWithIngredients,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });

    return {
      canMake: result.ready.length,
      almostThere: result.almostThere.length,
    };
  }, [allCocktails, allIngredients, ingredientIds, dataLoading]);

  if (dataLoading || barLoading) {
    return <MixSkeleton />;
  }

  if (dataError) {
    return (
      <div className="mix-page flex items-center justify-center min-h-[60vh] bg-cream">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-display font-bold text-forest mb-3">
            Unable to Load Data
          </h2>
          <p className="text-sage text-lg">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-terracotta text-cream rounded-2xl font-bold hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mix-page bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Instructions */}
        <header className="mb-8" role="banner">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest mb-2">
                Mix Tool
              </h1>
              <p className="text-lg text-sage max-w-xl">
                Discover cocktails you can make with ingredients you already have.
              </p>
            </div>
            {ingredientIds.length > 0 && (
              <div className="flex items-center gap-4 text-base">
                <span className="text-sage">
                  <span className="font-bold text-olive text-xl">{matchCounts.canMake}</span>{" "}
                  cocktails ready
                </span>
                {matchCounts.almostThere > 0 && (
                  <span className="text-sage">
                    <span className="font-bold text-terracotta">{matchCounts.almostThere}</span> almost
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Helper Instructions */}
          <div
            className="flex items-start gap-3 p-4 bg-white border border-mist rounded-2xl text-base shadow-soft"
            role="note"
            aria-label="How to use the Mix tool"
          >
            <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-olive" />
            </div>
            <div className="text-sage">
              <span className="font-semibold text-forest">How it works:</span>{" "}
              Select the ingredients you have in your bar from the panel below. We&apos;ll instantly show you
              all the cocktails you can make, plus suggestions for ingredients that unlock the most new recipes.
            </div>
          </div>

          {/* Save Bar Prompt for Anonymous Users */}
          {showSavePrompt && !isAuthenticated && (
            <div className="mt-4 flex items-center justify-between p-4 bg-olive/10 border border-olive/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                  <BookmarkIcon className="w-5 h-5 text-olive" />
                </div>
                <div>
                  <p className="text-forest font-medium">Want to save your bar?</p>
                  <p className="text-sm text-sage">Create a free account so you never lose your ingredient list.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismissPrompt}
                  className="px-3 py-1.5 text-sm text-sage hover:text-forest transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleSavePromptClick}
                  className="px-4 py-2 bg-terracotta text-cream font-bold text-sm rounded-xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
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
    </div>
  );
}
