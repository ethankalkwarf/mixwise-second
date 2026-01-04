"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { BrandLogo } from "@/components/common/BrandLogo";
import {
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Spirit options for step 1
const SPIRITS = [
  { id: "vodka", name: "Vodka", emoji: "💎" },
  { id: "gin", name: "Gin", emoji: "🌿" },
  { id: "rum", name: "Rum", emoji: "🌴" },
  { id: "tequila", name: "Tequila", emoji: "🌵" },
  { id: "whiskey", name: "Whiskey", emoji: "🥃" },
  { id: "bourbon", name: "Bourbon", emoji: "🥃" },
  { id: "brandy", name: "Brandy", emoji: "🍇" },
  { id: "mezcal", name: "Mezcal", emoji: "🔥" },
  { id: "cachaca", name: "Cachaça", emoji: "🇧🇷" },
  { id: "aperol", name: "Aperol/Campari", emoji: "🍊" },
  { id: "vermouth", name: "Vermouth", emoji: "🍷" },
  { id: "liqueur", name: "Liqueurs", emoji: "🍬" },
];

// Flavor profiles for step 2
const FLAVOR_PROFILES = [
  { id: "citrus", name: "Citrus", color: "bg-olive/20 text-olive" },
  { id: "sweet", name: "Sweet", color: "bg-terracotta/20 text-terracotta" },
  { id: "smoky", name: "Smoky", color: "bg-forest/20 text-forest" },
  { id: "herbal", name: "Herbal", color: "bg-olive/20 text-olive" },
  { id: "bitter", name: "Bitter", color: "bg-terracotta/20 text-terracotta" },
  { id: "tropical", name: "Tropical", color: "bg-olive/20 text-olive" },
  { id: "spicy", name: "Spicy", color: "bg-terracotta/20 text-terracotta" },
  { id: "creamy", name: "Creamy", color: "bg-stone text-forest" },
  { id: "refreshing", name: "Refreshing", color: "bg-olive/20 text-olive" },
  { id: "boozy", name: "Spirit-forward", color: "bg-forest/20 text-forest" },
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
  const { user, session } = useUser();
  const { supabaseClient: contextSupabase } = useSessionContext();
  const toast = useToast();
  
  const getSupabaseClient = () => {
    if (contextSupabase) {
      return contextSupabase;
    }
    return createClientComponentClient();
  };

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
      const supabase = getSupabaseClient();
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Session expired. Please log in again.");
        router.push("/");
        return;
      }

      const preferencesData = {
        user_id: user.id,
        preferred_spirits: selectedSpirits,
        flavor_profiles: selectedFlavors,
        skill_level: selectedSkill,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      
      const { error: upsertError } = await supabase
        .from("user_preferences")
        .upsert(preferencesData, {
          onConflict: "user_id",
        })
        .select();

      if (upsertError) {
        if (upsertError.code === "42P01") {
          toast.info("Welcome to MixWise!");
          router.replace("/dashboard");
          return;
        }
        
        toast.error(`Failed to save preferences: ${upsertError.message || "Database error"}`);
        return;
      }

      // Award badge
      try {
        await supabase
          .from("user_badges")
          .upsert({
            user_id: user.id,
            badge_id: "home_bartender",
            metadata: { completed_at: new Date().toISOString() },
          }, {
            onConflict: "user_id,badge_id",
          });
      } catch (badgeErr) {
        console.warn("Badge award failed:", badgeErr);
      }

      toast.success("Welcome to MixWise! 🍸");

      if (onComplete) {
        onComplete();
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = async () => {
    if (!user) {
      toast.error("Please sign in to skip onboarding");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast.error("Session expired. Please log in again.");
        router.push("/");
        return;
      }

      // Mark onboarding as complete even when skipping
      const preferencesData = {
        user_id: user.id,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      
      const { error: upsertError } = await supabase
        .from("user_preferences")
        .upsert(preferencesData, {
          onConflict: "user_id",
        });

      if (upsertError && upsertError.code !== "42P01") {
        // Ignore table doesn't exist error, but log others
        console.error("Failed to save skip preference:", upsertError);
      }

      toast.info("Skipping setup for now. You can update preferences later.");
      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error("Skip onboarding error:", err);
      // Continue to dashboard even if save fails
      router.replace("/dashboard");
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
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-mist z-50">
        <div
          className="h-full bg-terracotta transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="pt-8 pb-4 text-center">
        <BrandLogo size="lg" variant="dark" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  step < currentStep
                    ? "bg-olive text-cream"
                    : step === currentStep
                    ? "bg-terracotta/20 text-terracotta ring-2 ring-terracotta"
                    : "bg-mist text-sage"
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
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-3">
                  What spirits do you enjoy?
                </h1>
                <p className="text-sage">
                  Select all that apply. We&apos;ll use this to personalize your recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPIRITS.map((spirit) => (
                  <button
                    key={spirit.id}
                    onClick={() => toggleSpirit(spirit.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedSpirits.includes(spirit.id)
                        ? "border-terracotta bg-terracotta/10"
                        : "border-mist bg-white hover:border-stone"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{spirit.emoji}</span>
                    <span className="font-medium text-forest">{spirit.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Flavors */}
          {currentStep === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-3">
                  What flavors appeal to you?
                </h1>
                <p className="text-sage">
                  Pick your favorite flavor profiles. You can select multiple.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FLAVOR_PROFILES.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedFlavors.includes(flavor.id)
                        ? "border-terracotta bg-terracotta/10"
                        : "border-mist bg-white hover:border-stone"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${flavor.color} mb-2 flex items-center justify-center text-sm font-bold`}>
                      {flavor.name.charAt(0)}
                    </div>
                    <span className="font-medium text-forest">{flavor.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Skill Level */}
          {currentStep === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-3">
                  What&apos;s your skill level?
                </h1>
                <p className="text-sage">
                  We&apos;ll adjust recipe complexity based on your experience.
                </p>
              </div>

              <div className="space-y-3">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedSkill(level.id)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                      selectedSkill === level.id
                        ? "border-terracotta bg-terracotta/10"
                        : "border-mist bg-white hover:border-stone"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{level.icon}</span>
                      <div>
                        <h3 className="text-lg font-display font-bold text-forest">
                          {level.name}
                        </h3>
                        <p className="text-sm text-sage">{level.description}</p>
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
                className="flex items-center gap-2 px-6 py-3 text-sage hover:text-forest transition-colors"
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
                className="flex items-center gap-2 px-8 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-terracotta"
              >
                Continue
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-terracotta"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
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
          onClick={handleSkip}
          className="text-sm text-sage hover:text-forest transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
