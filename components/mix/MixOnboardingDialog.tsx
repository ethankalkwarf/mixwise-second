"use client";

import { useState, useEffect } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { XMarkIcon, ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  highlightElement?: string; // CSS selector for element to highlight
  showClickIndicator?: boolean;
  interactive?: boolean; // Whether user needs to interact to proceed
  autoAdvance?: boolean; // Auto-advance after a delay
  autoAdvanceDelay?: number;
  waitForIngredient?: string; // Ingredient name to wait for being added
};

// Updated onboarding for three-step funnel: Cabinet -> Mixer -> Menu - Slower and more user-friendly
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to MixWise!",
    description: "Let's build your perfect cocktail collection together. We'll take it step by step at your own pace.",
    interactive: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
  },
  {
    id: "cabinet-intro",
    title: "Your Virtual Cabinet",
    description: "This is your 'Cabinet' - where you tell us what ingredients you have at home. You can search or browse by category. Take your time to explore!",
    interactive: false,
    autoAdvance: true,
    autoAdvanceDelay: 4000,
  },
  {
    id: "popular-intro",
    title: "Quick Start with Popular Ingredients",
    description: "These are some of the most common ingredients people have. Click any one to add it to your bar.",
    interactive: true,
  },
  {
    id: "first-ingredient",
    title: "Great! Your first ingredient",
    description: "See how it animated when you added it? That's your bar growing. You now have 1 ingredient in your collection.",
    interactive: false,
    autoAdvance: true,
    autoAdvanceDelay: 4000,
  },
  {
    id: "add-another",
    title: "Let's add one more",
    description: "Try adding another ingredient. You can search for specific items or browse categories.",
    interactive: true,
  },
  {
    id: "see-progress",
    title: "Check your progress",
    description: "Look at the counter in the header above - it shows how many cocktails you can make. As you add more ingredients, this number will grow!",
    interactive: false,
    autoAdvance: true,
    autoAdvanceDelay: 4000,
  },
  {
    id: "mixer-intro",
    title: "Ready to Mix!",
    description: "When you have ingredients, tap the 'Mix' button below to see what cocktails you can make right now.",
    interactive: true,
  },
  {
    id: "menu-intro",
    title: "Your Personal Cocktail Menu",
    description: "Welcome to your menu! Here you'll find all the cocktails you can make with your current ingredients. Scroll through and explore!",
    interactive: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000,
  },
  {
    id: "explore-freely",
    title: "You're all set to explore!",
    description: "Keep adding ingredients to discover more cocktails. Use the bottom tabs to switch between adding ingredients and browsing recipes. Have fun exploring! 🥂",
    interactive: false,
  },
];

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

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Auto-advance for certain steps
  useEffect(() => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step?.autoAdvance) {
      const timer = setTimeout(() => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, step.autoAdvanceDelay || 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Watch for ingredient additions to auto-advance
  useEffect(() => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step?.waitForIngredient && selectedIds.length > 0) {
      const hasIngredient = selectedIds.some(id => {
        const ingredient = ingredients.find(i => i.id === id);
        return ingredient?.name?.toLowerCase().includes(step.waitForIngredient!.toLowerCase());
      });

      if (hasIngredient) {
        setTimeout(() => setCurrentStep(currentStep + 1), 1000);
      }
    }
  }, [selectedIds, currentStep, ingredients]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      try {
        localStorage.setItem('mixwise_mix_onboarding_completed', 'true');
      } catch (e) {
        console.warn('Could not save onboarding completion status');
      }
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('mixwise_mix_onboarding_completed', 'true');
    } catch (e) {
      console.warn('Could not save onboarding completion status');
    }
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Main onboarding card */}
      <div className="fixed bottom-6 left-6 z-50 max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-mist overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-mist">
            <div
              className="h-full bg-terracotta transition-all duration-300"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-terracotta" />
                <span className="text-sm font-bold text-terracotta">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 text-sage hover:text-forest transition-colors rounded-full hover:bg-mist"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-display font-bold text-forest mb-2">
              {step.title}
            </h3>
            <p className="text-sage text-sm leading-relaxed mb-4">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sage hover:text-forest font-medium transition-colors text-sm"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {!step.interactive && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-terracotta text-cream font-bold rounded-xl hover:bg-terracotta-dark transition-all text-sm flex items-center gap-2"
                  >
                    {isLastStep ? "Get Started" : "Next"}
                    {!isLastStep && <ArrowRightIcon className="w-4 h-4" />}
                  </button>
                )}
                {step.interactive && (
                  <div className="text-xs text-sage italic">
                    Click the highlighted item to continue...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
