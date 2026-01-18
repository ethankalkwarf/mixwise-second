"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MainContainer } from "@/components/layout/MainContainer";
import { WeddingQuestionnaire } from "./WeddingQuestionnaire";
import { WeddingRecommendations } from "./WeddingRecommendations";
import { getCocktailsListClient, getCocktailBySlugClient } from "@/lib/cocktails";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { Cocktail } from "@/lib/cocktailTypes";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useUser } from "@/components/auth/UserProvider";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

export type QuestionnaireStep = "intro" | "questions" | "email-gate" | "results";

export interface QuestionnaireAnswers {
  // Flavor preferences
  preferredFlavors: string[]; // sweet, tart, bitter, strong, light
  preferredSpirits: string[]; // vodka, gin, whiskey, rum, tequila, etc.
  
  // Style preferences
  weddingStyle: "classic" | "modern" | "tropical" | "elegant" | "casual";
  
  // Complexity
  complexity: "simple" | "moderate" | "complex" | "any";
}

export interface SelectedCocktails {
  hisCocktail: Cocktail | null;
  herCocktail: Cocktail | null;
}

export function WeddingCocktailFinder() {
  const [step, setStep] = useState<QuestionnaireStep>("intro");
  const { openSignupDialog } = useAuthDialog();
  const { isAuthenticated } = useUser();
  
  // Debug: log step changes
  useEffect(() => {
    console.log("Current step:", step);
  }, [step]);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    preferredFlavors: [],
    preferredSpirits: [],
    weddingStyle: "classic",
    complexity: "any",
  });
  const [allCocktails, setAllCocktails] = useState<CocktailListItem[]>([]);
  const [featuredCocktails, setFeaturedCocktails] = useState<CocktailListItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<CocktailListItem[]>([]);
  const [selectedCocktails, setSelectedCocktails] = useState<SelectedCocktails>({
    hisCocktail: null,
    herCocktail: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [skippedEmail, setSkippedEmail] = useState(false);

  // Load all cocktails when component mounts
  useEffect(() => {
    async function loadCocktails() {
      setIsLoading(true);
      try {
        const cocktails = await getCocktailsListClient({});
        console.log("Loaded cocktails:", cocktails.length);
        setAllCocktails(cocktails || []);
        
        // Get featured cocktails with images for landing page
        const withImages = cocktails.filter(c => c.image_url);
        console.log("Cocktails with images:", withImages.length, "out of", cocktails.length);
        // Shuffle and take 5 for display
        const shuffled = [...withImages].sort(() => Math.random() - 0.5);
        const featured = shuffled.slice(0, 5);
        console.log("Featured cocktails:", featured.map(c => ({ name: c.name, image_url: c.image_url })));
        setFeaturedCocktails(featured);
      } catch (error) {
        console.error("Error loading cocktails:", error);
        setAllCocktails([]);
        setFeaturedCocktails([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCocktails();
  }, []);

  const calculateRecommendations = useCallback(() => {
    if (!allCocktails || allCocktails.length === 0) {
      console.log("No cocktails to score");
      setRecommendations([]);
      return;
    }

    let scored: Array<{ cocktail: CocktailListItem; score: number }> = [];

    allCocktails.forEach((cocktail) => {
      if (!cocktail) return;
      let score = 0;

      // Base spirit matching (highest weight)
      if (answers.preferredSpirits.length > 0) {
        if (cocktail.base_spirit && answers.preferredSpirits.includes(cocktail.base_spirit.toLowerCase())) {
          score += 20;
        }
      }

      // Category matching
      const categories = (cocktail as any).categories_all || [];
      if (answers.weddingStyle === "tropical" && Array.isArray(categories) && categories.includes("tiki")) {
        score += 15;
      }
      if (answers.weddingStyle === "classic" && cocktail.category_primary === "classic") {
        score += 15;
      }
      if (answers.weddingStyle === "elegant" && (cocktail.category_primary === "classic" || cocktail.tags?.includes("elegant"))) {
        score += 15;
      }

      // Difficulty/complexity matching
      if (answers.complexity !== "any") {
        if (answers.complexity === "simple" && cocktail.difficulty === "easy") {
          score += 10;
        } else if (answers.complexity === "moderate" && cocktail.difficulty === "moderate") {
          score += 10;
        } else if (answers.complexity === "complex" && cocktail.difficulty === "advanced") {
          score += 10;
        }
      }

      // Flavor profile matching (if available)
      if (answers.preferredFlavors.includes("sweet") && cocktail.flavor_sweetness && cocktail.flavor_sweetness >= 6) {
        score += 5;
      }
      if (answers.preferredFlavors.includes("tart") && cocktail.flavor_tartness && cocktail.flavor_tartness >= 6) {
        score += 5;
      }
      if (answers.preferredFlavors.includes("strong") && cocktail.flavor_strength && cocktail.flavor_strength >= 7) {
        score += 5;
      }
      if (answers.preferredFlavors.includes("light") && cocktail.flavor_strength && cocktail.flavor_strength <= 4) {
        score += 5;
      }

      // Popular cocktails get a boost
      if (cocktail.tags?.includes("popular") || cocktail.tags?.includes("classic")) {
        score += 3;
      }

      if (score > 0) {
        scored.push({ cocktail, score });
      }
    });

    // Sort by score and take top 12
    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.cocktail);

    setRecommendations(sorted);
  }, [allCocktails, answers]);

  // Calculate recommendations based on answers (before email gate or results)
  useEffect(() => {
    if ((step === "email-gate" || step === "results") && allCocktails.length > 0) {
      calculateRecommendations();
    }
  }, [step, allCocktails.length, calculateRecommendations]);

  // Rotate images every 3 seconds
  useEffect(() => {
    if (featuredCocktails.length > 0 && step === "intro") {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % featuredCocktails.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [featuredCocktails.length, step]);


  const handleStart = () => {
    console.log("Button clicked! Current step:", step);
    setStep("questions");
    console.log("Step updated to: questions");
  };

  const handleStartOver = () => {
    setStep("intro");
    setAnswers({
      preferredFlavors: [],
      preferredSpirits: [],
      weddingStyle: "classic",
      complexity: "any",
    });
    setSelectedCocktails({
      hisCocktail: null,
      herCocktail: null,
    });
    setRecommendations([]);
  };

  const handleAnswerUpdate = (updates: Partial<QuestionnaireAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    setStep("email-gate");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return;
    }
    
    setEmailSubmitted(true);
    
    try {
      // Send email with recommendations
      const response = await fetch("/api/wedding/send-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          recommendations: recommendations.map(r => ({
            name: r.name,
            slug: r.slug,
            base_spirit: r.base_spirit,
            image_url: r.image_url,
          })),
          answers: answers,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      // Continue anyway - don't block user from seeing results
    }
    
    // Proceed to results after a brief delay
    setTimeout(() => {
      setStep("results");
    }, 500);
  };

  const handleSkipEmail = () => {
    setSkippedEmail(true);
    setStep("results");
  };

  const handleSelectCocktail = async (cocktail: CocktailListItem, type: "his" | "her") => {
    try {
      const fullCocktail = await getCocktailBySlugClient(cocktail.slug);
      if (fullCocktail) {
        setSelectedCocktails((prev) => ({
          ...prev,
          [type === "his" ? "hisCocktail" : "herCocktail"]: fullCocktail,
        }));
      }
    } catch (error) {
      console.error("Error fetching cocktail:", error);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-10 sm:py-12">
      <MainContainer>
        {step === "intro" && (
          <div className="max-w-7xl mx-auto">
            {/* Hero Section - Split Layout */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center mb-12">
              {/* Left: Text Content */}
              <div className="relative text-center md:text-left">
                {/* Decorative background elements */}
                <div className="absolute -top-15 -left-20 w-32 h-32 bg-terracotta/5 rounded-full blur-3xl" aria-hidden="true" />
                <div className="absolute -top-8 -right-10 w-24 h-24 bg-sage/5 rounded-full blur-2xl" aria-hidden="true" />
                
                <div className="relative">
                  <div className="inline-block mb-5">
                    <span className="text-sm font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-4 py-2 rounded-full">
                      Wedding Planning
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-forest mb-5 leading-tight">
                    Find Your Perfect
                    <br />
                    <span className="text-terracotta">Wedding Cocktails</span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-sage mb-7 leading-relaxed">
                    Answer a few quick questions and we'll recommend the perfect cocktails for your wedding bar.
                  </p>
                  <button
                    type="button"
                    onClick={handleStart}
                    className="px-10 py-5 bg-terracotta hover:bg-terracotta-dark active:bg-terracotta-dark text-cream font-bold text-xl rounded-full transition-all shadow-lg shadow-terracotta/30 hover:shadow-xl hover:shadow-terracotta/40 hover:-translate-y-1 cursor-pointer transform hover:scale-105"
                    aria-label="Start the wedding cocktail quiz"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>

              {/* Right: Image Carousel */}
              <div className="relative">
                <div className="relative max-w-md mx-auto">
                  {featuredCocktails.length > 0 ? (
                    <>
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-mist shadow-xl">
                        {featuredCocktails.map((cocktail, index) => {
                          const isActive = index === currentImageIndex;
                          return (
                            <div
                              key={cocktail.id}
                              className={`absolute inset-0 transition-opacity duration-1000 ${
                                isActive ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              {cocktail.image_url ? (
                                <>
                                  <Image
                                    src={cocktail.image_url}
                                    alt={cocktail.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                    quality={85}
                                    placeholder="blur"
                                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                  <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-white font-display font-bold text-xl md:text-2xl mb-1 drop-shadow-lg">
                                      {cocktail.name}
                                    </h3>
                                    {cocktail.base_spirit && (
                                      <p className="text-white/90 text-xs uppercase tracking-widest font-semibold">
                                        {cocktail.base_spirit}
                                      </p>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-sage text-5xl">
                                  🍸
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Dots indicator */}
                      <div className="flex justify-center gap-2 mt-4">
                        {featuredCocktails.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "w-6 bg-terracotta"
                                : "w-2 bg-mist hover:bg-sage"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-mist shadow-xl flex items-center justify-center">
                      <div className="text-sage text-5xl">🍸</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="group relative bg-gradient-to-br from-white to-cream border-2 border-mist rounded-3xl p-8 shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-terracotta/5 rounded-full blur-2xl -z-0" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta/10 rounded-2xl mb-6 group-hover:bg-terracotta/20 transition-colors">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="font-display font-bold text-forest text-2xl mb-3">
                    Personalized Recommendations
                  </h3>
                  <p className="text-sage leading-relaxed">
                    Get cocktail suggestions tailored to your wedding style, season, and preferences.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-white to-cream border-2 border-mist rounded-3xl p-8 shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-full blur-2xl -z-0" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-sage/10 rounded-2xl mb-6 group-hover:bg-sage/20 transition-colors">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className="font-display font-bold text-forest text-2xl mb-3">
                    Expert Guidance
                  </h3>
                  <p className="text-sage leading-relaxed">
                    Discover handpicked cocktails that match your wedding's vibe and guest preferences.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-white to-cream border-2 border-mist rounded-3xl p-8 shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-olive/5 rounded-full blur-2xl -z-0" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-olive/10 rounded-2xl mb-6 group-hover:bg-olive/20 transition-colors">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="font-display font-bold text-forest text-2xl mb-3">
                    Curated Collection
                  </h3>
                  <p className="text-sage leading-relaxed">
                    Access our curated collection of handcrafted cocktail recipes from expert mixologists.
                  </p>
                </div>
              </div>
            </div>

            {/* Signup CTA (subtle, non-blocking) */}
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-terracotta/10 to-sage/10 border border-terracotta/20 rounded-3xl p-8 text-center">
                <h3 className="font-display font-bold text-forest text-2xl mb-2">
                  Save Your Selections
                </h3>
                <p className="text-sage mb-6 max-w-2xl mx-auto">
                  Create a free account to save your cocktail selections and get personalized recommendations for your home bar.
                </p>
                <button
                  onClick={() => openSignupDialog({
                    title: "Create Your Free MixWise Account",
                    subtitle: "Save your selections and discover more cocktails"
                  })}
                  className="px-8 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors shadow-lg shadow-terracotta/20"
                >
                  Sign Up Free
                </button>
                <p className="text-xs text-sage mt-4">
                  No credit card required • Takes 30 seconds
                </p>
              </div>
            )}
          </div>
        )}

        {step === "questions" && (
          <>
            <div className="mb-6 flex justify-center">
              <button
                onClick={handleStartOver}
                className="px-6 py-2 text-sage hover:text-forest text-sm font-medium rounded-full border border-mist hover:border-sage transition-colors"
              >
                ← Start Over
              </button>
            </div>
            <WeddingQuestionnaire
              answers={answers}
              onUpdate={handleAnswerUpdate}
              onSubmit={handleSubmit}
            />
          </>
        )}

        {step === "email-gate" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 shadow-soft text-center">
              <div className="text-5xl mb-6">📧</div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-4">
                Get Your {recommendations.length} Wedding Cocktail Recommendations
              </h2>
              <p className="text-base sm:text-lg text-sage mb-8 max-w-md mx-auto">
                Enter your email to receive your personalized cocktail recommendations via email and view them here.
              </p>
              
              {!emailSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-6 py-4 border-2 border-mist rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta text-lg"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-8 py-4 bg-terracotta hover:bg-terracotta-dark text-cream font-bold text-lg rounded-xl transition-colors shadow-lg shadow-terracotta/20"
                    >
                      View My Recommendations
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipEmail}
                      className="px-6 py-4 text-sage hover:text-forest text-sm font-medium rounded-xl border border-mist hover:border-sage transition-colors"
                    >
                      Skip for Now
                    </button>
                  </div>
                  <p className="text-xs text-sage mt-4">
                    We'll email your {recommendations.length} personalized recommendations. No spam, unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-lg text-forest font-medium mb-2">✓ Email submitted!</p>
                  <p className="text-sage">Loading your recommendations...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "results" && (
          <>
            <div className="mb-6 flex justify-center">
              <button
                onClick={handleStartOver}
                className="px-6 py-2 text-sage hover:text-forest text-sm font-medium rounded-full border border-mist hover:border-sage transition-colors"
              >
                ← Start Over
              </button>
            </div>
            <WeddingRecommendations
              recommendations={recommendations}
              selectedCocktails={selectedCocktails}
              onSelectCocktail={handleSelectCocktail}
              answers={answers}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              onSignupClick={() => openSignupDialog({
                title: "Create Your Free Account",
                subtitle: "Sign up to create and save your wedding menu"
              })}
            />
          </>
        )}
      </MainContainer>
    </div>
  );
}

