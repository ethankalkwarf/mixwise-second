"use client";

import { useMemo, useState } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { MainContainer } from "@/components/layout/MainContainer";
import { formatIngredientCategory } from "@/lib/formatters";

type Props = {
  allIngredients: MixIngredient[];
  ingredientIds: string[];
  selectedCategory: string | null;
  stapleIds: string[];
  onSelectCategory: (category: string | null) => void;
  onAddIngredient: (id: string) => void;
  onRemoveIngredient: (id: string) => void;
  matchCounts: {
    canMake: number;
    almostThere: number;
  };
  onStepChange: (step: 'cabinet' | 'mixer' | 'menu') => void;
};

const POPULAR_INGREDIENTS = [
  // Prioritize basic spirits first to maximize cocktails quickly
  "Vodka", "Tequila", "Gin", "Whiskey", // Basic spirits - unlock many cocktails
  // Then essential mixers and juices
  "Lime Juice", "Lemon Juice", "Simple Syrup", "Agave Syrup", // Essential mixers/juices
  "Tonic Water", "Club Soda", "Rum", "Angostura Bitters", // Additional versatile ingredients
  "Dry Vermouth", "Sweet Vermouth", "Triple Sec" // Specialized ingredients
];

export function MixCabinet({
  allIngredients,
  ingredientIds,
  selectedCategory,
  stapleIds,
  onSelectCategory,
  onAddIngredient,
  onRemoveIngredient,
  matchCounts,
  onStepChange,
}: Props) {
  const [addedIngredient, setAddedIngredient] = useState<string | null>(null);

  // Filter ingredients for display
  const filteredIngredients = useMemo(() => {
    if (!allIngredients || allIngredients.length === 0) return [];

    let filtered = allIngredients.filter((i) => !stapleIds.includes(i.id));

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((i) => (i.category || "Garnish") === selectedCategory);
    }

    return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [allIngredients, selectedCategory, stapleIds]);

  // Get popular ingredients that aren't already added
  const popularAvailable = useMemo(() => {
    return POPULAR_INGREDIENTS.map(name => {
      // First try exact match, then fallback to includes match
      const exactMatch = allIngredients.find(i =>
        i.name?.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch && !ingredientIds.includes(exactMatch.id)) {
        return exactMatch;
      }

      // Fallback to partial match
      const partialMatch = allIngredients.find(i =>
        i.name?.toLowerCase().includes(name.toLowerCase()) && i.name?.toLowerCase() !== name.toLowerCase()
      );
      return partialMatch && !ingredientIds.includes(partialMatch.id) ? partialMatch : null;
    }).filter(Boolean).slice(0, 8);
  }, [allIngredients, ingredientIds]);

  // Handle ingredient addition with visual feedback
  const handleAddWithFeedback = (id: string) => {
    setAddedIngredient(id);
    onAddIngredient(id);
    setTimeout(() => setAddedIngredient(null), 1000);
  };

  // Ingredient-specific emoji mappings for better accuracy
  const ingredientEmojis: Record<string, string> = {
    // Spirits
    "vodka": "💎", // Crystal/clear like vodka
    "gin": "🌿", // Botanical/herbal like gin
    "rum": "🌴", // Tropical like rum
    "whiskey": "🥃", // Whiskey glass for whiskey
    "bourbon": "🥃", // Whiskey glass for bourbon
    "scotch": "🥃", // Whiskey glass for scotch
    "rye": "🥃", // Whiskey glass for rye
    "tequila": "🌵", // Cactus for tequila
    "mezcal": "🔥", // Smoky/fire for mezcal
    "brandy": "🍇", // Grapes for brandy/cognac
    "cognac": "🍇", // Grapes for cognac
    "cachaca": "🇧🇷", // Brazil flag for cachaça
    "cachaça": "🇧🇷", // Brazil flag for cachaça

    // Liqueurs
    "triple sec": "🍊", // Orange for triple sec
    "cointreau": "🍊", // Orange for Cointreau
    "grand marnier": "🍊", // Orange for Grand Marnier
    "amaretto": "🥜", // Almond for amaretto
    "kahlua": "☕", // Coffee for Kahlúa
    "baileys": "🥛", // Cream for Baileys
    "creme de menthe": "🌿", // Mint for crème de menthe
    "creme de cacao": "🥜", // Chocolate/nut for crème de cacao
    "aperol": "🍊", // Orange for Aperol
    "campari": "🍊", // Orange/red for Campari

    // Mixers
    "cola": "🥤", // Glass for cola
    "tonic": "🥤", // Glass for tonic
    "soda": "🥤", // Glass for soda
    "ginger beer": "🍺", // Beer glass for ginger beer
    "cranberry juice": "🫐", // Berries for cranberry
    "pineapple juice": "🍍", // Pineapple for pineapple juice
    "orange juice": "🍊", // Orange for OJ
    "lime juice": "🍋", // Lime for lime juice
    "lemon juice": "🍋", // Lemon for lemon juice

    // Other common ingredients
    "simple syrup": "🍯", // Honey for syrup
    "honey": "🍯", // Honey
    "maple syrup": "🍁", // Maple leaf for maple syrup
    "agave": "🌵", // Cactus for agave
    "vermouth": "🍷", // Wine glass for vermouth
    "bitters": "💧", // Drop for bitters
  };

  const categoryIcons: Record<string, string> = {
    Spirit: "🥃",
    Liqueur: "🍸",
    Amaro: "🍶",
    "Wine & Beer": "🍷",
    Mixer: "🥤",
    Citrus: "🍋",
    Bitters: "💧",
    Syrup: "🍯",
    Garnish: "🍒",
  };

  // Helper function to get emoji for ingredient
  const getIngredientEmoji = (ingredient: { name?: string; category?: string }) => {
    const ingredientKey = ingredient.name?.toLowerCase().replace(/\s+/g, '');
    return ingredientEmojis[ingredientKey] || categoryIcons[ingredient.category || "Garnish"] || "🍒";
  };

  const categories = [
    { key: "Spirit", label: "Spirits", icon: "🥃", color: "bg-terracotta/20 border-terracotta/30" },
    { key: "Liqueur", label: "Liqueurs", icon: "🍸", color: "bg-forest/20 border-forest/30" },
    { key: "Amaro", label: "Amaro", icon: "🍶", color: "bg-amber/20 border-amber/30" },
    { key: "Wine & Beer", label: "Wine & Beer", icon: "🍷", color: "bg-burgundy/20 border-burgundy/30" },
    { key: "Mixer", label: "Mixers", icon: "🥤", color: "bg-olive/20 border-olive/30" },
    { key: "Citrus", label: "Citrus", icon: "🍋", color: "bg-terracotta/30 border-terracotta/40" },
    { key: "Bitters", label: "Bitters", icon: "💧", color: "bg-sage/30 border-sage/40" },
    { key: "Syrup", label: "Syrups", icon: "🍯", color: "bg-olive/30 border-olive/40" },
  ];

  return (
    <MainContainer className="py-6 pb-24 lg:pb-6">

      {/* Popular Ingredients Quick Add */}
      {popularAvailable.length > 0 && (
        <section className="mb-8">
          <div className="bg-gradient-to-r from-terracotta/5 to-olive/5 border border-terracotta/20 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-forest">Start with the Basics</h2>
                <p className="text-sm text-sage">Add these essentials to unlock your first cocktails</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {popularAvailable.slice(0, 8).map((ingredient) => (
                <button
                  key={ingredient!.id}
                  onClick={() => handleAddWithFeedback(ingredient!.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                    addedIngredient === ingredient!.id
                      ? 'bg-olive text-white border-olive shadow-lg'
                      : 'bg-white border-mist text-forest hover:border-terracotta hover:bg-terracotta/5'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">
                      {getIngredientEmoji(ingredient!)}
                    </div>
                    <div className="font-semibold">{ingredient!.name}</div>
                  </div>
                </button>
              ))}
            </div>
            {popularAvailable.length > 8 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => onSelectCategory(null)}
                  className="text-terracotta hover:text-terracotta-dark text-sm font-medium"
                >
                  See more ingredients →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories or Ingredient Grid */}
      {!selectedCategory ? (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-forest mb-2">Browse by Category</h2>
            <p className="text-sage">Choose a category to explore ingredients within that type</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const count = allIngredients.filter(i =>
                (i.category || "Garnish") === category.key && !stapleIds.includes(i.id)
              ).length;

              return (
                <button
                  key={category.key}
                  onClick={() => onSelectCategory(category.key)}
                  className="p-6 rounded-2xl border-2 bg-white border-mist hover:border-terracotta hover:bg-terracotta/5 transition-all text-left hover:shadow-lg group active:scale-95 cursor-pointer relative"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-forest group-hover:text-terracotta transition-colors truncate">
                        {category.label}
                      </div>
                      <div className="text-sm text-sage">
                        {count} ingredients
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-sage leading-tight mb-2">
                    {category.key === "Spirit" && "Base spirits for your cocktails"}
                    {category.key === "Liqueur" && "Sweet and flavored spirits"}
                    {category.key === "Mixer" && "Non-alcoholic mixers"}
                    {category.key === "Citrus" && "Fresh citrus juices"}
                    {category.key === "Bitters" && "Aromatic bitters and tinctures"}
                    {category.key === "Syrup" && "Sweet syrups and cordials"}
                  </p>
                  <div className="text-xs text-terracotta font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to explore →
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          {/* Category/Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-forest">
                {formatIngredientCategory(selectedCategory)}
              </h2>
              <p className="text-sage">
                {filteredIngredients.length} ingredients available
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => {
                  onSelectCategory(null);
                }}
                className="px-6 py-3 bg-white border-2 border-terracotta/30 rounded-xl text-terracotta hover:bg-terracotta hover:text-cream font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                ← Back to All Categories
              </button>
            )}
          </div>

          {/* Ingredient Grid */}
          {filteredIngredients.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredIngredients.map((ingredient) => {
                const isSelected = ingredientIds.includes(ingredient.id);
                const isJustAdded = addedIngredient === ingredient.id;

                return (
                  <button
                    key={ingredient.id}
                    onClick={() => isSelected
                      ? onRemoveIngredient(ingredient.id)
                      : handleAddWithFeedback(ingredient.id)
                    }
                    className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 group overflow-hidden cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-olive/10 border-olive shadow-lg'
                        : isJustAdded
                        ? 'bg-olive text-cream border-olive animate-pulse'
                        : 'bg-white border-mist hover:border-olive hover:shadow-md'
                    }`}
                  >
                    {/* Visual feedback overlay */}
                    {isJustAdded && (
                      <div className="absolute inset-0 bg-olive/20 rounded-2xl animate-ping" />
                    )}

                    <div className="relative z-10 text-center">
                      <div className="text-3xl mb-2">
                        {categoryIcons[ingredient.category || "Garnish"] || "📦"}
                      </div>
                      <div className={`font-medium text-sm leading-tight ${
                        isSelected || isJustAdded ? 'text-charcoal' : 'text-forest'
                      }`}>
                        {ingredient.name}
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="w-5 h-5 text-olive mx-auto mt-2" />
                      )}
                      {!isSelected && (
                        <PlusIcon className="w-5 h-5 text-sage mx-auto mt-2 group-hover:text-olive transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-sage">
                No ingredients in this category
              </p>
            </div>
          )}
        </section>
      )}

      {/* Empty State for First-Time Users */}
      {ingredientIds.length === 0 && !selectedCategory && (
        <section className="text-center py-12">
          <div className="text-6xl mb-6">🍾</div>
          <h3 className="text-2xl font-display font-bold text-forest mb-3">
            Start Building Your Bar
          </h3>
          <p className="text-sage text-lg max-w-md mx-auto leading-relaxed">
            Add your favorite spirits and ingredients above to discover cocktails you can make right now.
          </p>
        </section>
      )}

      {/* Encouragement for more ingredients */}
      {ingredientIds.length > 0 && matchCounts.canMake < 2 && !selectedCategory && (
        <section className="text-center py-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-display font-bold text-forest mb-2">
              Great Start! Add a Few More
            </h3>
            <p className="text-sage text-sm mb-4">
              Mixers and citrus can unlock many more cocktails. Try lime juice, tonic water, or simple syrup!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                // Most versatile additions for early users (high cocktail count)
                'Lime Juice', 'Simple Syrup', 'Agave Syrup', 'Tonic Water'
              ].map((itemName) => {
                const ingredient = allIngredients.find(i => i.name?.toLowerCase().includes(itemName.toLowerCase()));
                if (!ingredient || ingredientIds.includes(ingredient.id)) return null;
                return (
                  <button
                    key={ingredient.id}
                    onClick={() => handleAddWithFeedback(ingredient.id)}
                    className="px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                  >
                    + {itemName}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </MainContainer>
  );
}
