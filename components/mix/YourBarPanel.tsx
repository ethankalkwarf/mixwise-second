"use client";

import { useMemo } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { XMarkIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  selectedIngredients: MixIngredient[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  matchCounts?: {
    canMake: number;
    almostThere: number;
  };
  className?: string;
};

export function YourBarPanel({
  selectedIngredients,
  onRemove,
  onClearAll,
  matchCounts,
  className = "",
}: Props) {
  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups = new Map<string, MixIngredient[]>();

    selectedIngredients.forEach((ingredient) => {
      const category = ingredient.category || "Other";
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
    Other: "📦",
  };

  if (selectedIngredients.length === 0) {
    return (
      <div className={`bg-white border border-mist rounded-3xl p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🍾</div>
          <h3 className="text-lg font-semibold text-forest mb-2">Your bar is empty</h3>
          <p className="text-sage text-sm">
            Select ingredients from the categories to start building your bar
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
            <h2 className="text-xl font-display font-bold text-forest">Your Bar</h2>
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
              <span className="text-sm text-sage">Cocktails ready</span>
              <span className="font-bold text-olive">{matchCounts.canMake}</span>
            </div>
            {matchCounts.almostThere > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sage">Almost ready</span>
                  <span className="font-bold text-terracotta">{matchCounts.almostThere}</span>
                </div>
                <p className="text-xs text-sage leading-relaxed">
                  Add just a few more ingredients to unlock these recipes
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
      </div>
    </div>
  );
}
