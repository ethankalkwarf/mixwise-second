"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import {
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Spirit options for step 1
const SPIRITS = [
  { id: "vodka", name: "Vodka", emoji: "🍸" },
  { id: "gin", name: "Gin", emoji: "🌿" },
  { id: "rum", name: "Rum", emoji: "🥃" },
  { id: "tequila", name: "Tequila", emoji: "🌵" },
  { id: "whiskey", name: "Whiskey", emoji: "🥃" },
  { id: "bourbon", name: "Bourbon", emoji: "🍂" },
  { id: "brandy", name: "Brandy", emoji: "🍇" },
  { id: "mezcal", name: "Mezcal", emoji: "🔥" },
  { id: "cachaca", name: "Cachaça", emoji: "🇧🇷" },
  { id: "aperol", name: "Aperol/Campari", emoji: "🍊" },
  { id: "vermouth", name: "Vermouth", emoji: "🍷" },
  { id: "liqueur", name: "Liqueurs", emoji: "🍬" },
];

// Flavor profiles for step 2
const FLAVOR_PROFILES = [
  { id: "citrus", name: "Citrus", color: "from-yellow-400 to-orange-500" },
  { id: "sweet", name: "Sweet", color: "from-pink-400 to-rose-500" },
  { id: "smoky", name: "Smoky", color: "from-gray-400 to-slate-600" },
  { id: "herbal", name: "Herbal", color: "from-green-400 to-emerald-600" },
  { id: "bitter", name: "Bitter", color: "from-amber-400 to-orange-600" },
  { id: "tropical", name: "Tropical", color: "from-cyan-400 to-teal-500" },
  { id: "spicy", name: "Spicy", color: "from-red-400 to-red-600" },
  { id: "creamy", name: "Creamy", color: "from-amber-100 to-amber-300" },
  { id: "refreshing", name: "Refreshing", color: "from-sky-400 to-blue-500" },
  { id: "boozy", name: "Spirit-forward", color: "from-amber-500 to-amber-700" },
];

// Skill levels for step 3
const SKILL_LEVELS = [
  {
    id: "beginner",
    name: "Beginner",
    description: "New to cocktails. Show me simple recipes with few ingredients.",
    icon: "🌱",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Comfortable with basics. Ready for more complex techniques.",
    icon: "🍸",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Experienced mixologist. Bring on the challenging recipes!",
    icon: "🏆",
  },
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const { user } = useUser();
  const toast = useToast();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedSpirits, setSelectedSpirits] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("beginner");

  const totalSteps = 3;

  const toggleSpirit = (spiritId: string) => {
    setSelectedSpirits((prev) =>
      prev.includes(spiritId)
        ? prev.filter((s) => s !== spiritId)
        : [...prev, spiritId]
    );
  };

  const toggleFlavor = (flavorId: string) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavorId)
        ? prev.filter((f) => f !== flavorId)
        : [...prev, flavorId]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("Please sign in to complete onboarding");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save preferences to database
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        preferred_spirits: selectedSpirits,
        flavor_profiles: selectedFlavors,
        skill_level: selectedSkill,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Award "Home Bartender" badge for completing onboarding
      await supabase.from("user_badges").upsert({
        user_id: user.id,
        badge_id: "home_bartender",
        metadata: { completed_at: new Date().toISOString() },
      });

      toast.success("Welcome to MixWise! 🍸");

      if (onComplete) {
        onComplete();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedSpirits.length > 0;
      case 2:
        return selectedFlavors.length > 0;
      case 3:
        return selectedSkill !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  step < currentStep
                    ? "bg-lime-500 text-slate-900"
                    : step === currentStep
                    ? "bg-lime-500/20 text-lime-400 ring-2 ring-lime-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {step < currentStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Spirits */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-slate-100 mb-3">
                  What spirits do you enjoy?
                </h1>
                <p className="text-slate-400">
                  Select all that apply. We&apos;ll use this to personalize your recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPIRITS.map((spirit) => (
                  <button
                    key={spirit.id}
                    onClick={() => toggleSpirit(spirit.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedSpirits.includes(spirit.id)
                        ? "border-lime-500 bg-lime-500/10"
                        : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{spirit.emoji}</span>
                    <span className="font-medium text-slate-200">{spirit.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Flavors */}
          {currentStep === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-slate-100 mb-3">
                  What flavors appeal to you?
                </h1>
                <p className="text-slate-400">
                  Pick your favorite flavor profiles. You can select multiple.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FLAVOR_PROFILES.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedFlavors.includes(flavor.id)
                        ? "border-lime-500 bg-lime-500/10"
                        : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${flavor.color} mb-2`}
                    />
                    <span className="font-medium text-slate-200">{flavor.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Skill Level */}
          {currentStep === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-slate-100 mb-3">
                  What&apos;s your skill level?
                </h1>
                <p className="text-slate-400">
                  We&apos;ll adjust recipe complexity based on your experience.
                </p>
              </div>

              <div className="space-y-3">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedSkill(level.id)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      selectedSkill === level.id
                        ? "border-lime-500 bg-lime-500/10"
                        : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{level.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">
                          {level.name}
                        </h3>
                        <p className="text-sm text-slate-400">{level.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <div className="pb-8 text-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

