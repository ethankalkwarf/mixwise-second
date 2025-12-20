"use client";

import { useState, useEffect } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Step = {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    category?: string;
    icon: string;
  }>;
};

// Priority order for ingredient matching - most basic/generic first
const BASIC_INGREDIENT_PRIORITY = [
  // Spirits - prioritize generic over brands
  { searchTerms: ["vodka"], displayName: "Vodka", category: "Spirit" },
  { searchTerms: ["gin"], displayName: "Gin", category: "Spirit" },
  { searchTerms: ["tequila", "tequila blanco"], displayName: "Tequila", category: "Spirit" },
  { searchTerms: ["rum", "white rum"], displayName: "Rum", category: "Spirit" },
  { searchTerms: ["whiskey", "whisky", "bourbon"], displayName: "Whiskey", category: "Spirit" },

  // Mixers - most basic versions
  { searchTerms: ["club soda", "soda water"], displayName: "Club Soda", category: "Mixer" },
  { searchTerms: ["tonic water", "tonic"], displayName: "Tonic Water", category: "Mixer" },
  { searchTerms: ["simple syrup"], displayName: "Simple Syrup", category: "Syrup" },
  { searchTerms: ["lime juice", "fresh lime juice"], displayName: "Lime Juice", category: "Citrus" },
  { searchTerms: ["lemon juice", "fresh lemon juice"], displayName: "Lemon Juice", category: "Citrus" },

  // Bitters & Vermouth
  { searchTerms: ["angostura bitters"], displayName: "Angostura Bitters", category: "Bitters" },
  { searchTerms: ["dry vermouth"], displayName: "Dry Vermouth", category: "Spirit" },
  { searchTerms: ["sweet vermouth"], displayName: "Sweet Vermouth", category: "Spirit" },
];

const ONBOARDING_STEPS: Step[] = [
  {
    title: "Essential Spirits",
    description: "Start with these core spirits for the most cocktail recipes",
    ingredients: [
      { name: "Vodka", icon: "🥃" },
      { name: "Gin", icon: "🥃" },
      { name: "Tequila", icon: "🥃" },
      { name: "Rum", icon: "🥃" },
      { name: "Whiskey", icon: "🥃" },
    ],
  },
  {
    title: "Essential Mixers",
    description: "These basics unlock hundreds of recipes",
    ingredients: [
      { name: "Club Soda", icon: "🥤" },
      { name: "Tonic Water", icon: "🥤" },
      { name: "Simple Syrup", icon: "🍯" },
      { name: "Lime Juice", icon: "🍋" },
      { name: "Lemon Juice", icon: "🍋" },
    ],
  },
  {
    title: "Bitters & Vermouth",
    description: "Optional but recommended for more complex cocktails",
    ingredients: [
      { name: "Angostura Bitters", icon: "💧" },
      { name: "Dry Vermouth", icon: "🍷" },
      { name: "Sweet Vermouth", icon: "🍷" },
    ],
  },
];

type Props = {
  ingredients: MixIngredient[];
  selectedIds: string[];
  onAddIngredient: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function MixOnboardingDialog({
  ingredients,
  selectedIds,
  onAddIngredient,
  isOpen,
  onClose,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Reset step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  // Find matching ingredients from available data using priority matching
  const getMatchingIngredients = (stepIngredients: typeof step.ingredients) => {
    return stepIngredients
      .map((stepIng) => {
        // Find priority config for this ingredient
        const priorityConfig = BASIC_INGREDIENT_PRIORITY.find(
          config => config.displayName.toLowerCase() === stepIng.name.toLowerCase()
        );

        if (!priorityConfig) return null;

        // Try to find the most basic/generic version of this ingredient
        let bestMatch: MixIngredient | null = null;

        for (const searchTerm of priorityConfig.searchTerms) {
          const matches = ingredients.filter(ing =>
            ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            ing.category === priorityConfig.category
          );

          if (matches.length > 0) {
            // Prefer ingredients without brand names (shorter names are usually more generic)
            bestMatch = matches.reduce((best, current) => {
              // Prefer shorter names (less likely to be brand-specific)
              if (current.name.length < best.name.length) return current;
              return best;
            });
            break;
          }
        }

        return bestMatch ? { ...stepIng, ingredient: bestMatch } : null;
      })
      .filter(Boolean);
  };

  const matchingIngredients = getMatchingIngredients(step.ingredients);

  const handleAddIngredient = (ingredient: MixIngredient) => {
    if (!selectedIds.includes(ingredient.id)) {
      onAddIngredient(ingredient.id);
    }
  };

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const selectedCount = matchingIngredients.filter((item) =>
    item?.ingredient && selectedIds.includes(item.ingredient.id)
  ).length;

  const hasCompletedStep = selectedCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-mist">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold text-forest">
              Let's Stock Your Bar
            </h2>
            <button
              onClick={handleSkip}
              className="p-2 text-sage hover:text-forest transition-colors rounded-full hover:bg-mist"
              aria-label="Skip onboarding"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-4">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index < currentStep
                    ? "bg-olive"
                    : index === currentStep
                    ? "bg-terracotta"
                    : "bg-mist"
                }`}
              />
            ))}
          </div>

          {/* Step Title and Description */}
          <div>
            <h3 className="text-xl font-semibold text-forest mb-2">{step.title}</h3>
            <p className="text-sage">{step.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {matchingIngredients.map((item) => {
              if (!item?.ingredient) return null;

              const isSelected = selectedIds.includes(item.ingredient.id);
              const isCompleted = completedSteps.has(currentStep) && isSelected;

              return (
                <button
                  key={item.ingredient.id}
                  onClick={() => handleAddIngredient(item.ingredient)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-olive bg-olive/5"
                      : "border-mist bg-white hover:border-sage hover:bg-cream"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircleIcon className="w-8 h-8 text-olive" />
                      ) : (
                        <span className="text-3xl">{item.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold ${
                          isSelected ? "text-olive" : "text-forest"
                        }`}
                      >
                        {item.ingredient.name}
                      </div>
                      <div className="text-sm text-sage capitalize">
                        {item.ingredient.category}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {matchingIngredients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sage">These ingredients aren't available yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-mist bg-mist/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-sage">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sage hover:text-forest font-medium transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className={`px-6 py-3 font-bold rounded-2xl transition-all ${
                  hasCompletedStep || currentStep === 0
                    ? "bg-terracotta text-cream hover:bg-terracotta-dark shadow-lg shadow-terracotta/20"
                    : "bg-stone text-mist cursor-not-allowed"
                }`}
                disabled={!hasCompletedStep && currentStep > 0}
              >
                {isLastStep ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
