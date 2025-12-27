"use client";

import { useMemo, useState } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { XMarkIcon, TrashIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

type Props = {
  selectedIngredients: MixIngredient[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  matchCounts?: {
    canMake: number;
    almostThere: number;
  };
  allIngredients?: MixIngredient[];
  onAddIngredient?: (id: string) => void;
  className?: string;
};

export function YourBarPanel({
  selectedIngredients,
  onRemove,
  onClearAll,
  matchCounts,
  allIngredients = [],
  onAddIngredient,
  className = "",
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups = new Map<string, MixIngredient[]>();

    selectedIngredients.forEach((ingredient) => {
      const category = ingredient.category || "Garnish";
      const list = groups.get(category) || [];
      list.push(ingredient);
      groups.set(category, list);
    });

    // Sort categories and ingredients within each category
    const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
      // Sort by count descending, then alphabetically
      const aCount = groups.get(a)?.length || 0;
      const bCount = groups.get(b)?.length || 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.localeCompare(b);
    });

    return sortedGroups.map(([category, ingredients]) => ({
      category,
      ingredients: ingredients.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [selectedIngredients]);

  // Filter ingredients for the add more section
  const filteredIngredients = useMemo(() => {
    if (!allIngredients || allIngredients.length === 0) return [];

    let filtered = allIngredients.filter((i) => !selectedIngredients.some(si => si.id === i.id));

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((i) => (i.category || "Garnish") === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((i) =>
        i.name?.toLowerCase().includes(query) ||
        i.category?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [allIngredients, selectedIngredients, selectedCategory, searchQuery]);

  const categoryIcons: Record<string, string> = {
    Spirit: "🥃",
    Liqueur: "🍸",
    Mixer: "🥤",
    Citrus: "🍋",
    Bitters: "💧",
    Wine: "🍷",
    Beer: "🍺",
    Syrup: "🍯",
    Garnish: "🍒",
  };

  if (selectedIngredients.length === 0) {
    return (
      <div className={`bg-white border border-mist rounded-3xl p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🍾</div>
          <h3 className="text-lg font-semibold text-forest mb-2">Your cellar awaits</h3>
          <p className="text-sage text-sm">
            Begin curating your collection by selecting ingredients from our categories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-mist rounded-3xl shadow-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-mist">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-forest">Your Cabinet</h2>
            <span className="text-sm font-bold text-cream bg-terracotta px-2.5 py-1 rounded-full">
              {selectedIngredients.length}
            </span>
          </div>
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="p-2 text-sage hover:text-terracotta transition-colors rounded-lg hover:bg-terracotta/10"
              aria-label="Clear all ingredients"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Recipe counts */}
        {matchCounts && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage">Ready to make</span>
              <span className="font-bold text-olive">{matchCounts.canMake}</span>
            </div>
            {matchCounts.almostThere > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sage">Within reach</span>
                  <span className="font-bold text-terracotta">{matchCounts.almostThere}</span>
                </div>
                <p className="text-xs text-sage leading-relaxed">
                  Strategic additions will unlock these masterpieces
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-6 space-y-6">
          {groupedIngredients.map(({ category, ingredients }) => (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{categoryIcons[category] || "📦"}</span>
                <h3 className="font-semibold text-forest">
                  {category} ({ingredients.length})
                </h3>
              </div>

              {/* Ingredient chips */}
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 bg-olive/5 border border-olive/20 rounded-xl"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-olive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-forest text-sm">
                        {ingredient.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemove(ingredient.id)}
                      className="p-1 text-sage hover:text-terracotta transition-colors rounded hover:bg-terracotta/10"
                      aria-label={`Remove ${ingredient.name}`}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add More Ingredients Section */}
        {onAddIngredient && (
          <div className="mt-6 pt-6 border-t border-mist">
            <h3 className="text-lg font-display font-bold text-forest mb-4 flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add More Ingredients
            </h3>

            {/* Search and Category Filter */}
            <div className="space-y-4 mb-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-mist rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Spirit', 'Liqueur', 'Mixer', 'Citrus', 'Syrup', 'Bitters', 'Garnish'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === (category === 'All' ? null : category)
                        ? 'bg-terracotta text-cream'
                        : 'bg-mist text-sage hover:bg-terracotta/20 hover:text-terracotta'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredient List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => onAddIngredient(ingredient.id)}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-mist rounded-xl hover:border-olive hover:bg-olive/5 transition-all text-left group"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-olive/10 rounded-lg flex items-center justify-center group-hover:bg-olive/20">
                    <PlusIcon className="w-4 h-4 text-olive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-forest text-sm">
                      {ingredient.name}
                    </span>
                    <span className="text-xs text-sage ml-2">
                      {ingredient.category}
                    </span>
                  </div>
                  <div className="text-xs text-olive font-medium">
                    Add
                  </div>
                </button>
              ))}
              {filteredIngredients.length === 0 && (
                <div className="text-center py-8 text-sage text-sm">
                  No ingredients found matching your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
