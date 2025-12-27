"use client";

import { useState } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";

type Props = {
  ingredient: MixIngredient;
  isSelected: boolean;
  onToggle: (id: string) => void;
  className?: string;
};

export function IngredientTile({
  ingredient,
  isSelected,
  onToggle,
  className = "",
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle(ingredient.id);

    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 300);
  };

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

  const icon = categoryIcons[ingredient.category || "Garnish"] || "🍒";

  return (
    <button
      onClick={handleClick}
      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 transform h-full flex flex-col ${
        isSelected
          ? "border-olive bg-olive/5 shadow-lg scale-105"
          : "border-mist bg-white hover:border-sage hover:bg-cream hover:shadow-md"
      } ${isAnimating ? "animate-pulse" : ""} ${className}`}
      data-ingredient={ingredient.name?.toLowerCase().replace(/\s+/g, '-')}
    >
      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-olive/5 rounded-2xl border-2 border-olive" />
      )}

      <div className="relative flex-1 flex flex-col">
        {/* Selection indicator */}
        <div className="flex justify-end mb-3">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-olive border-olive"
                : "bg-white border-stone group-hover:border-sage"
            }`}
          >
            {isSelected ? (
              <CheckCircleIcon className="w-4 h-4 text-cream" />
            ) : (
              <PlusIcon className="w-3 h-3 text-stone opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        {/* Image placeholder or actual image */}
        <div className="aspect-square bg-mist rounded-xl mb-4 flex items-center justify-center overflow-hidden flex-shrink-0">
          {ingredient.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ingredient.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-sage/20 rounded-lg flex items-center justify-center">
              <span className="text-lg">🥃</span>
            </div>
          )}
        </div>

        {/* Name - with consistent height */}
        <div className="flex-1 flex flex-col justify-center mb-3">
          <h3
            className={`text-base font-semibold leading-tight line-clamp-2 ${
              isSelected ? "text-olive" : "text-forest group-hover:text-terracotta"
            }`}
          >
            {ingredient.name}
          </h3>
        </div>

        {/* Action hint */}
        <div className="text-center mt-auto">
          <span
            className={`text-sm font-medium transition-colors ${
              isSelected
                ? "text-olive"
                : "text-sage group-hover:text-terracotta"
            }`}
          >
            {isSelected ? "Selected" : "Add to bar"}
          </span>
        </div>
      </div>
    </button>
  );
}
