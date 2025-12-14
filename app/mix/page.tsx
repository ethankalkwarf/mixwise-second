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
  const [numericIngredientIds, setNumericIngredientIds] = useState<number[]>([]);

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
        setAllIngredients(ingredients);
        setAllCocktails(cocktails);
      } catch (error) {
        console.error("Failed to load data from Supabase:", error);
        setDataError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  // Convert all selected ingredient IDs to numeric IDs for cocktail matching
  const convertSelectedIngredientsToNumeric = useCallback(async (selectedIds: string[]): Promise<number[]> => {
    if (selectedIds.length === 0) return [];

    try {
      // Fetch ingredients list for mapping
      const supabase = createClient();
      const { data: allIngredients, error } = await supabase
        .from('ingredients')
        .select('id, name');

      if (error || !allIngredients) {
        console.error('Error fetching ingredients for mapping:', error);
        return [];
      }

      // Create mapping from lowercased name to ID
      const nameToIdMap = new Map<string, number>();
      allIngredients.forEach(ing => {
        if (ing.name) {
          nameToIdMap.set(ing.name.toLowerCase(), ing.id);
        }
      });

      // Convert function (same logic as in the helpers)
      const convertToNumericId = (stringId: string): number | null => {
        // First try to parse as integer
        let parsed = parseInt(stringId, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }

        // Handle ingredient- prefixed IDs
        if (stringId.startsWith('ingredient-')) {
          const idPart = stringId.substring('ingredient-'.length);
          parsed = parseInt(idPart, 10);
          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }

        // Create synonym mapping for brand-specific names
        const createSynonyms = (input: string): string[] => {
          const synonyms = [input.toLowerCase()];

          // Remove common brand prefixes/suffixes
          const brandPatterns = [
            /\b(absolut|grey goose|smirnoff|ketel one|tito's)\s+/gi, // Vodka brands
            /\b(bombay|beefeater|tanqueray|hendrick's|plymouth)\s+/gi, // Gin brands
            /\b(jameson|jack daniel's|jim beam|crown royal)\s+/gi, // Whiskey brands
            /\b(jose cuervo|patron|clase azul)\s+/gi, // Tequila brands
            /\b(baileys|kahlua|tia maria)\s+/gi, // Liqueur brands
            /\b(cointreau|grand marnier|triple sec)\s+/gi, // Triple sec brands
            /\b(campbell|fee brothers|angostura)\s+/gi, // Bitters brands
            /\s+(vodka|gin|rum|whiskey|bourbon|scotch|tequila|brandy|cognac|liqueur|wine|beer|juice|soda|syrup|bitters|vermouth|amaro)\b/gi, // Generic terms
          ];

          brandPatterns.forEach(pattern => {
            const cleaned = input.replace(pattern, '').trim();
            if (cleaned && cleaned !== input.toLowerCase()) {
              synonyms.push(cleaned.toLowerCase());
            }
          });

          // Split on common separators and try base terms
          const parts = input.toLowerCase().split(/\s+|\-|_/);
          if (parts.length > 1) {
            // Try the last part (often the generic term)
            synonyms.push(parts[parts.length - 1]);
            // Try the first part
            synonyms.push(parts[0]);
          }

          return [...new Set(synonyms)]; // Remove duplicates
        };

        // Try to find by name variations
        const lookupNames = createSynonyms(stringId);

        for (const lookupName of lookupNames) {
          const found = nameToIdMap.get(lookupName);
          if (found) {
            return found;
          }
        }

        return null;
      };

      // Convert all selected IDs
      const numericIds: number[] = [];
      for (const stringId of selectedIds) {
        const numericId = convertToNumericId(stringId);
        if (numericId) {
          numericIds.push(numericId);
        }
      }

      return numericIds;
    } catch (error) {
      console.error('Error converting ingredient IDs:', error);
      return [];
    }
  }, []);

  // Update numeric IDs whenever selected ingredients change
  useEffect(() => {
    convertSelectedIngredientsToNumeric(ingredientIds).then(setNumericIngredientIds);
  }, [ingredientIds, convertSelectedIngredientsToNumeric]);

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
      ownedIngredientIds: numericIngredientIds,
      stapleIngredientIds: stapleIds,
    });
    return {
      canMake: result.makeNow.length,
      almostThere: result.almostThere.length,
    };
  }, [allCocktails, allIngredients, numericIngredientIds]);

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
              inventoryIds={numericIngredientIds}
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
