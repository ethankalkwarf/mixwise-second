"use client";

import { useMemo, useState } from "react";
import { MixResultsPanel } from "./MixResultsPanel";
import { YourBarPanel } from "./YourBarPanel";
import type { MixIngredient, MixCocktail, MixMatchGroups } from "@/lib/mixTypes";
import { ArrowPathIcon, LightBulbIcon, PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { MainContainer } from "@/components/layout/MainContainer";
import { useShoppingList } from "@/hooks/useShoppingList";
import { lookupIngredient, nameHasToken } from "@/lib/ingredientMatching";

type Props = {
  inventoryIds: string[];
  allCocktails: MixCocktail[];
  allIngredients: MixIngredient[];
  onAddToInventory: (id: string) => void;
  matchCounts: {
    canMake: number;
    almostThere: number;
  };
  matchGroups: MixMatchGroups;
  selectedIngredients: MixIngredient[];
  onRemoveIngredient: (id: string) => void;
  onClearAll: () => void;
};

export function MixMenu({
  inventoryIds,
  allCocktails,
  allIngredients,
  onAddToInventory,
  matchCounts,
  matchGroups,
  selectedIngredients,
  onRemoveIngredient,
  onClearAll,
}: Props) {
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const { addItem, isLoading: shoppingLoading } = useShoppingList();

  const almostThereCocktails = useMemo(() => {
    return matchGroups.almostThere
      .filter((match) => match.missingIngredientIds.length === 1)
      .slice(0, 6)
      .map((match) => {
        const missingIngredient = allIngredients.find((i) => i.id === match.missingIngredientIds[0]);
        return {
          cocktail: match.cocktail,
          missingIngredient
        };
      })
      .filter((item) => item.missingIngredient);
  }, [matchGroups.almostThere, allIngredients]);

  const randomSuggestion = useMemo(() => {
    if (matchCounts.canMake === 0 || matchGroups.ready.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * matchGroups.ready.length);
    return matchGroups.ready[randomIndex]?.cocktail || null;
  }, [matchGroups.ready, matchCounts.canMake]);

  // Ingredient substitution suggestions
  const substitutionSuggestions = useMemo(() => {
    const suggestions = [];

    // Common substitutions based on what user has
    const hasBourbon = selectedIngredients.some((i) => nameHasToken(i.name, "bourbon"));
    const hasRye = selectedIngredients.some((i) => nameHasToken(i.name, "rye"));
    const hasScotch = selectedIngredients.some((i) => nameHasToken(i.name, "scotch"));

    if (hasBourbon && !hasRye) {
      suggestions.push({
        from: 'Bourbon',
        to: 'Rye Whiskey',
        cocktails: ['Manhattan', 'Old Fashioned', 'Whiskey Sour'],
        reason: 'Rye adds spice and complexity to classic whiskey cocktails'
      });
    }

    if (hasRye && !hasBourbon) {
      suggestions.push({
        from: 'Rye Whiskey',
        to: 'Bourbon',
        cocktails: ['Manhattan', 'Old Fashioned', 'Whiskey Sour'],
        reason: 'Bourbon offers sweeter, smoother flavor profile'
      });
    }

    const hasGin = selectedIngredients.some((i) => nameHasToken(i.name, "gin"));
    const hasVodka = selectedIngredients.some((i) => nameHasToken(i.name, "vodka"));

    if (hasGin && !hasVodka) {
      suggestions.push({
        from: 'Gin',
        to: 'Vodka',
        cocktails: ['Martini', 'Cosmopolitan', 'Moscow Mule'],
        reason: 'Vodka creates cleaner, less botanical-forward versions'
      });
    }

    return suggestions;
  }, [selectedIngredients]);

  return (
    <MainContainer className="py-6 pb-24 md:pb-6 overflow-x-hidden">
      <div className="grid md:grid-cols-[300px_minmax(0,1fr)] gap-8">
        {/* Left Sidebar - Your Bar */}
        <aside className="md:sticky md:top-24 space-y-6 min-w-0">
        <YourBarPanel
          selectedIngredients={selectedIngredients}
          onRemove={onRemoveIngredient}
          onClearAll={onClearAll}
          matchCounts={matchCounts}
          allIngredients={allIngredients}
          onAddIngredient={onAddToInventory}
        />

          {/* Quick Actions */}
          <div className="bg-white border border-mist rounded-3xl p-6">
            <h3 className="font-semibold text-forest mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAllRecipes(!showAllRecipes)}
                className="w-full text-left p-3 rounded-xl border border-mist hover:border-olive/30 hover:bg-olive/5 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <div className="font-medium text-forest text-sm">
                      {showAllRecipes ? "Show My Matches" : "Browse All Recipes"}
                    </div>
                    <div className="text-xs text-sage">
                      {showAllRecipes ? "Filter by your ingredients" : "Explore the full library"}
                    </div>
                  </div>
                  <ArrowPathIcon className="w-4 h-4 text-sage group-hover:text-olive flex-shrink-0" />
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/mix'}
                className="w-full text-left p-3 rounded-xl border border-mist hover:border-olive/30 hover:bg-olive/5 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <div className="font-medium text-forest text-sm">
                      Add more ingredients
                    </div>
                    <div className="text-xs text-sage">
                      Return to ingredient selector
                    </div>
                  </div>
                  <PlusIcon className="w-4 h-4 text-sage group-hover:text-olive flex-shrink-0" />
                </div>
              </button>

              {randomSuggestion && (
                <button
                  onClick={() => window.location.href = `/cocktails/${randomSuggestion.slug}`}
                  className="w-full text-left p-3 rounded-xl border border-mist hover:border-terracotta/30 hover:bg-terracotta/5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="font-medium text-forest text-sm">
                        Surprise Me! 🍸
                      </div>
                      <div className="text-xs text-sage truncate">
                        {randomSuggestion.name}
                      </div>
                    </div>
                    <LightBulbIcon className="w-4 h-4 text-sage group-hover:text-terracotta flex-shrink-0" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content — min-w-0 prevents Ready to Mix grid from overflowing the page */}
        <main className="space-y-8 min-w-0 overflow-x-hidden">


          {/* Cocktail Results */}
          <MixResultsPanel
            inventoryIds={inventoryIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={onAddToInventory}
            showAllRecipes={showAllRecipes}
            matchGroups={matchGroups}
          />


          {/* Easy Ingredient Addition - Always visible in step 3 */}

          {/* Almost There Section - After cocktail results */}
          {!showAllRecipes && almostThereCocktails.length > 0 && (
            <section className="bg-gradient-to-r from-terracotta/5 to-olive/5 border border-terracotta/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-terracotta/20 rounded-2xl flex items-center justify-center">
                  <LightBulbIcon className="w-6 h-6 text-terracotta" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-forest">
                    So Close! Add One More Ingredient
                  </h2>
                  <p className="text-sage">Unlock these cocktails with a single addition</p>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 min-w-0">
                {almostThereCocktails.map(({ cocktail, missingIngredient }) => (
                  <div
                    key={cocktail.id}
                    className="bg-white border border-mist rounded-2xl p-4 hover:shadow-md transition-shadow min-w-0 overflow-hidden"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-forest text-lg leading-tight mb-2 break-words">
                          {cocktail.name}
                        </h3>
                        <div className="text-sm text-sage mb-3 break-words">
                          Missing: <span className="font-medium text-terracotta">{missingIngredient?.name}</span>
                        </div>
                        <div className="flex gap-2 min-w-0">
                          <button
                            onClick={() => onAddToInventory(missingIngredient!.id)}
                            className="flex-1 min-w-0 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-xl py-2 px-3 text-sm font-medium hover:bg-terracotta hover:text-cream transition-all truncate"
                          >
                            Add {missingIngredient?.name} & Unlock
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem({
                                id: missingIngredient!.id,
                                name: missingIngredient!.name,
                                category: missingIngredient!.category,
                              });
                            }}
                            disabled={shoppingLoading}
                            className="flex-shrink-0 px-3 py-2 bg-olive/10 hover:bg-olive/20 text-olive border border-olive/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add to shopping list"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {cocktail.imageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 bg-mist rounded-lg overflow-hidden">
                          <img
                            src={cocktail.imageUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Encourage More Ingredients */}
          {matchCounts.canMake > 0 && matchCounts.canMake < 5 && !showAllRecipes && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">➕</span>
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-forest">
                    Unlock More Cocktails
                  </h3>
                  <p className="text-sm text-sage">
                    Add common ingredients like club soda, cola, or extra citrus to discover more recipes
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  // Most versatile ingredients that unlock many cocktails
                  'Lime Juice', 'Simple Syrup', 'Agave Syrup', 'Club Soda',
                  'Tonic Water', 'Lemon Juice', 'Orange Juice', 'Cola'
                ].map((itemName) => {
                  const ingredient = lookupIngredient(itemName, allIngredients);
                  if (!ingredient || inventoryIds.includes(ingredient.id)) return null;
                  return (
                    <button
                      key={ingredient.id}
                      onClick={() => onAddToInventory(ingredient.id)}
                      className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      + {itemName}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.history.back()}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Back to Add More Ingredients
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {matchCounts.canMake === 0 && !showAllRecipes && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🍹</div>
              <h3 className="text-2xl font-display font-bold text-forest mb-4">
                No Cocktails Yet
              </h3>
              <p className="text-sage text-lg max-w-md mx-auto mb-6">
                Add more ingredients to your bar to discover cocktails you can make.
              </p>
              <button
                onClick={() => setShowAllRecipes(true)}
                className="bg-terracotta text-cream px-6 py-3 rounded-2xl font-bold hover:bg-terracotta-dark transition-all"
              >
                Browse All Recipes
              </button>
            </div>
          )}
        </main>
      </div>
    </MainContainer>
  );
}
