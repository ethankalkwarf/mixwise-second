"use client";

import { useEffect, useState } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { MainContainer } from "@/components/layout/MainContainer";

type Props = {
  ingredientIds: string[];
  selectedIngredients: MixIngredient[];
  matchCounts: {
    canMake: number;
    almostThere: number;
  };
  isProcessing: boolean;
  onComplete: () => void;
};

export function MixMixer({
  ingredientIds,
  selectedIngredients,
  matchCounts,
  isProcessing,
  onComplete,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

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
    const ingredientKey = ingredient.name?.toLowerCase().replace(/\s+/g, "");
    if (ingredientKey && ingredientEmojis[ingredientKey]) {
      return ingredientEmojis[ingredientKey];
    }
    return categoryIcons[ingredient.category || "Garnish"] || "🍒";
  };

  const processingSteps = [
    "Analyzing your ingredients...",
    "Checking cocktail recipes...",
    "Finding perfect matches...",
    "Almost ready!"
  ];

  useEffect(() => {
    if (isProcessing) {
      setCurrentStep(0);
      setShowResults(false);

      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setShowResults(true);
              setTimeout(onComplete, 1500);
            }, 500);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isProcessing, onComplete]);

  if (showResults) {
    return (
      <MainContainer className="py-12">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-3xl font-display font-bold text-forest mb-4">
            Your Menu is Ready!
          </h2>
          <p className="text-sage text-lg mb-8">
            Found {matchCounts.canMake} cocktails you can make right now
            {matchCounts.almostThere > 0 && ` and ${matchCounts.almostThere} almost there`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {selectedIngredients.slice(0, 6).map((ingredient, index) => (
              <div
                key={ingredient.id}
                className="bg-white border border-mist rounded-2xl p-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl mb-2">
                  {getIngredientEmoji(ingredient)}
                  {ingredient.category === "Syrup" && "🍯"}
                  {!["Spirit", "Liqueur", "Mixer", "Citrus", "Bitters", "Syrup"].includes(ingredient.category || "") && "📦"}
                </div>
                <div className="font-medium text-forest text-sm">{ingredient.name}</div>
              </div>
            ))}
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer className="py-12">
      <div className="text-center">
        {/* Animated mixing visualization */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-white border-4 border-mist rounded-full flex items-center justify-center shadow-lg">
            <div className="text-4xl animate-spin">🥃</div>
          </div>

          {/* Floating ingredient icons */}
          <div className="absolute inset-0">
            {selectedIngredients.slice(0, 4).map((ingredient, index) => (
              <div
                key={ingredient.id}
                className="absolute animate-float"
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${10 + (index % 2) * 40}%`,
                  animationDelay: `${index * 200}ms`,
                  animationDuration: '3s'
                }}
              >
                <div className="text-2xl opacity-70">
                  {getIngredientEmoji(ingredient)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-forest mb-4">
          Crafting Your Perfect Menu
        </h2>

        <div className="text-sage text-lg mb-8">
          {processingSteps[currentStep]}
        </div>

        {/* Progress indicator */}
        <div className="max-w-xs mx-auto mb-8">
          <div className="flex justify-between text-xs text-sage mb-2">
            <span>Analyzing</span>
            <span>Complete</span>
          </div>
          <div className="w-full bg-mist rounded-full h-2">
            <div
              className="bg-gradient-to-r from-olive to-terracotta h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current ingredients being processed */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {selectedIngredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className={`bg-white border border-mist rounded-xl p-3 transition-all ${
                index <= currentStep ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center gap-2">
                {index <= currentStep ? (
                  <CheckCircleIcon className="w-4 h-4 text-olive flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-mist rounded-full flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-forest truncate">
                  {ingredient.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-sage">
            <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
            Processing {ingredientIds.length} ingredients
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
