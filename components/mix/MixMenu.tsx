"use client";

import { useMemo, useState } from "react";
import { MixResultsPanel } from "./MixResultsPanel";
import { YourBarPanel } from "./YourBarPanel";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { ArrowPathIcon, LightBulbIcon, SparklesIcon, PlusIcon } from "@heroicons/react/24/outline";
import { MainContainer } from "@/components/layout/MainContainer";

type Props = {
  inventoryIds: string[];
  allCocktails: MixCocktail[];
  allIngredients: MixIngredient[];
  onAddToInventory: (id: string) => void;
  matchCounts: {
    canMake: number;
    almostThere: number;
  };
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
  selectedIngredients,
  onRemoveIngredient,
  onClearAll,
}: Props) {
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  // Get "Almost There" suggestions - cocktails missing only one ingredient
  const almostThereCocktails = useMemo(() => {
    const stapleIds = allIngredients.filter((i) => i.isStaple).map((i) => i.id);

    const results = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: inventoryIds,
      stapleIngredientIds: stapleIds,
      maxMissing: 2
    });

    return results.almostThere
      .filter(match => match.missingIngredientIds.length === 1)
      .slice(0, 6)
      .map(match => {
        const missingIngredient = allIngredients.find(i => i.id === match.missingIngredientIds[0]);
        return {
          cocktail: match.cocktail,
          missingIngredient
        };
      })
      .filter(item => item.missingIngredient);
  }, [allCocktails, allIngredients, inventoryIds]);

  // Random cocktail suggestion
  const randomSuggestion = useMemo(() => {
    if (matchCounts.canMake === 0) return null;

    const stapleIds = allIngredients.filter((i) => i.isStaple).map((i) => i.id);

    const results = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: inventoryIds,
      stapleIngredientIds: stapleIds,
    });

    const randomIndex = Math.floor(Math.random() * results.ready.length);
    return results.ready[randomIndex]?.cocktail || null;
  }, [allCocktails, allIngredients, inventoryIds, matchCounts.canMake]);

  // Ingredient substitution suggestions
  const substitutionSuggestions = useMemo(() => {
    const suggestions = [];

    // Common substitutions based on what user has
    const hasBourbon = selectedIngredients.some(i => i.name?.toLowerCase().includes('bourbon'));
    const hasRye = selectedIngredients.some(i => i.name?.toLowerCase().includes('rye'));
    const hasScotch = selectedIngredients.some(i => i.name?.toLowerCase().includes('scotch'));

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

    const hasGin = selectedIngredients.some(i => i.name?.toLowerCase().includes('gin'));
    const hasVodka = selectedIngredients.some(i => i.name?.toLowerCase().includes('vodka'));

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
    <MainContainer className="py-6">
      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Left Sidebar - Your Bar */}
        <aside className="lg:sticky lg:top-24 space-y-6">
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
            <h3 className="font-semibold text-forest mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-terracotta" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAllRecipes(!showAllRecipes)}
                className="w-full text-left p-3 rounded-xl border border-mist hover:border-olive/30 hover:bg-olive/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-forest text-sm">
                      {showAllRecipes ? "Show My Matches" : "Browse All Recipes"}
                    </div>
                    <div className="text-xs text-sage">
                      {showAllRecipes ? "Filter by your ingredients" : "Explore the full library"}
                    </div>
                  </div>
                  <ArrowPathIcon className="w-4 h-4 text-sage group-hover:text-olive" />
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/mix'}
                className="w-full text-left p-3 rounded-xl border border-mist hover:border-olive/30 hover:bg-olive/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-forest text-sm">
                      Want to Add More Ingredients?
                    </div>
                    <div className="text-xs text-sage">
                      Return to ingredient selector
                    </div>
                  </div>
                  <PlusIcon className="w-4 h-4 text-sage group-hover:text-olive" />
                </div>
              </button>

              {randomSuggestion && (
                <button
                  onClick={() => window.location.href = `/cocktails/${randomSuggestion.slug}`}
                  className="w-full text-left p-3 rounded-xl border border-mist hover:border-terracotta/30 hover:bg-terracotta/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-forest text-sm">
                        Surprise Me! 🍸
                      </div>
                      <div className="text-xs text-sage">
                        {randomSuggestion.name}
                      </div>
                    </div>
                    <LightBulbIcon className="w-4 h-4 text-sage group-hover:text-terracotta" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-8">


          {/* Cocktail Results */}
          <MixResultsPanel
            inventoryIds={inventoryIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={onAddToInventory}
            showAllRecipes={showAllRecipes}
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {almostThereCocktails.map(({ cocktail, missingIngredient }) => (
                  <div
                    key={cocktail.id}
                    className="bg-white border border-mist rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-forest text-lg leading-tight mb-2">
                          {cocktail.name}
                        </h3>
                        <div className="text-sm text-sage mb-3">
                          Missing: <span className="font-medium text-terracotta">{missingIngredient?.name}</span>
                        </div>
                        <button
                          onClick={() => onAddToInventory(missingIngredient!.id)}
                          className="w-full bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-xl py-2 px-4 text-sm font-medium hover:bg-terracotta hover:text-cream transition-all"
                        >
                          Add {missingIngredient?.name} & Unlock
                        </button>
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
                  const ingredient = allIngredients.find(i => i.name?.toLowerCase().includes(itemName.toLowerCase()));
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
