"use client";

import { useState } from "react";
import Image from "next/image";
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
    "jagermeister": "🦌", // Stag for Jägermeister
    "jägermeister": "🦌",

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

  // Use ingredient-specific emoji if available, otherwise fall back to category
  const ingredientKey = ingredient.name?.toLowerCase().replace(/\s+/g, '');
  const icon = ingredientEmojis[ingredientKey] || categoryIcons[ingredient.category || "Garnish"] || "🍒";

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
        <div className="aspect-square bg-mist rounded-xl mb-4 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {ingredient.imageUrl ? (
            <Image
              src={ingredient.imageUrl}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
              quality={75}
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
