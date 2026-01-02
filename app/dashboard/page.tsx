"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { getCocktailsWithIngredientsClient, getMixDataClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { createClient } from "@/lib/supabase/client";
import { formatCocktailName } from "@/lib/formatters";
import Image from "next/image";
import type { MixIngredient } from "@/lib/mixTypes";
import type { BadgeDefinition } from "@/lib/badges";
import { RARITY_COLORS } from "@/lib/badges";
import {
  BeakerIcon,
  HeartIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ShareIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface RecommendedCocktail {
  _id: string;
  name: string;
  slug: { current: string };
  externalImageUrl?: string;
  primarySpirit?: string;
  matchScore?: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const { openAuthDialog } = useAuthDialog();
  const { ingredientIds, isLoading: barLoading, removeIngredient } = useBarIngredients();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { preferences, isLoading: preferencesLoading, needsOnboarding } = useUserPreferences();

  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedCocktail[]>([]);
  const [almostThereCocktails, setAlmostThereCocktails] = useState<Array<{
    _id: string;
    name: string;
    slug: { current: string };
    externalImageUrl?: string;
    missingIngredientNames: string[];
  }>>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const DASHBOARD_READY_LIMIT = 10;

  // DEBUG: Track what causes re-renders (only log when key values change)
  const renderCount = useRef(0);
  const prevValues = useRef<{
    authLoading: boolean;
    isAuthenticated: boolean;
    hasUser: boolean;
    hasProfile: boolean;
    barLoading: boolean;
    ingredientCount: number;
    preferencesLoading: boolean;
    loadingRecs: boolean;
  } | null>(null);
  
  useEffect(() => {
    const currentValues = {
      authLoading,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      barLoading,
      ingredientCount: ingredientIds.length,
      preferencesLoading,
      loadingRecs,
    };
    
    // Only log if values actually changed
    if (!prevValues.current || 
        prevValues.current.authLoading !== currentValues.authLoading ||
        prevValues.current.isAuthenticated !== currentValues.isAuthenticated ||
        prevValues.current.hasUser !== currentValues.hasUser ||
        prevValues.current.hasProfile !== currentValues.hasProfile ||
        prevValues.current.barLoading !== currentValues.barLoading ||
        prevValues.current.ingredientCount !== currentValues.ingredientCount ||
        prevValues.current.preferencesLoading !== currentValues.preferencesLoading ||
        prevValues.current.loadingRecs !== currentValues.loadingRecs) {
      renderCount.current += 1;
      console.log(`🔄 Dashboard Render #${renderCount.current}:`, {
        ...currentValues,
        profileName: profile?.display_name,
        hasPreferences: !!preferences,
        recCount: recommendations.length
      });
      prevValues.current = currentValues;
    }
  }, [authLoading, isAuthenticated, user?.id, profile?.id, barLoading, ingredientIds.length, preferencesLoading, loadingRecs, preferences?.public_bar_enabled, recommendations.length]);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!authLoading && isAuthenticated && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [authLoading, isAuthenticated, needsOnboarding, router]);

  // Note: No conversion needed anymore - ingredientIds are already in canonical UUID format
  // This is guaranteed by useBarIngredients which normalizes all IDs

  // Show auth dialog if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthDialog({
        mode: "login",
        title: "Sign in to view your dashboard",
        subtitle: "Log in or create a free account to track your progress and get recommendations.",
      });
    }
  }, [authLoading, isAuthenticated, openAuthDialog]);

  // Fetch recommendations and cocktail data
  useEffect(() => {
    async function fetchData() {
      try {
        setDataLoadError(null);
        // Fetch ingredients and cocktails data (same as mix wizard)
        const { ingredients, cocktails } = await getMixDataClient();
        setAllIngredients(ingredients || []);
        setAllCocktails(cocktails || []);
      } catch (error) {
        console.error("Error fetching mix data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";
        setDataLoadError(errorMessage);
        // Still clear loading state so UI shows error instead of hanging
        setLoadingRecs(false);
      }
    }

    fetchData();
  }, []);

  // Fetch recommendations using same logic as mix wizard
  useEffect(() => {
    async function fetchRecommendations() {
      if (!isAuthenticated || ingredientIds.length === 0 || allCocktails.length === 0 || allIngredients.length === 0) {
        setRecommendations([]);
        setLoadingRecs(false);
        return;
      }

      try {
        // Calculate staple IDs (same logic as mix wizard)
        const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
        const manualStaples = ['ice', 'water']; // Only truly universal basics
        const stapleIds = [...new Set([...dbStaples, ...manualStaples])];

        // Use same matching logic as mix wizard
        const result = getMixMatchGroups({
          cocktails: allCocktails,
          ownedIngredientIds: ingredientIds,
          stapleIngredientIds: stapleIds,
        });

        if (process.env.NODE_ENV === "development") {
          console.log("[DASHBOARD DEBUG] Matching results:", {
            totalCocktails: allCocktails.length,
            ingredientIdsCount: ingredientIds.length,
            stapleIds,
            readyCount: result.ready.length,
            almostThereCount: result.almostThere.length,
            farCount: result.far.length,
            readySample: result.ready.slice(0, 3).map((c) => c.cocktail.name),
          });
        }

        // Convert ready cocktails to expected format
        const formattedCocktails: RecommendedCocktail[] = result.ready.map(match => ({
          _id: match.cocktail.id,
          name: match.cocktail.name,
          slug: { current: match.cocktail.slug },
          externalImageUrl: match.cocktail.imageUrl || undefined,
          primarySpirit: match.cocktail.primarySpirit || undefined,
          ingredientIds: match.cocktail.ingredients?.map(ing => ing.id) || []
        }));

        // Convert almost-there cocktails (missing up to 2 required ingredients per mix engine default)
        const formattedAlmostThere = result.almostThere.map(match => ({
          _id: match.cocktail.id,
          name: match.cocktail.name,
          slug: { current: match.cocktail.slug },
          externalImageUrl: match.cocktail.imageUrl || undefined,
          missingIngredientNames: match.missingIngredientNames || [],
        }));

        setRecommendations(formattedCocktails);
        setAlmostThereCocktails(formattedAlmostThere);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecs(false);
      }
    }

    fetchRecommendations();
  }, [isAuthenticated, ingredientIds, allCocktails, allIngredients]);

  // Note: Ingredients are already fetched by getMixDataClient() above
  // No need for duplicate fetch - this was causing race conditions and flickering

  // Fallback ingredients
  function getFallbackIngredients() {
    return [
      { id: 'whiskey', name: 'Whiskey', category: 'spirit' },
      { id: 'vodka', name: 'Vodka', category: 'spirit' },
      { id: 'gin', name: 'Gin', category: 'spirit' },
      { id: 'rum', name: 'Rum', category: 'spirit' },
      { id: 'tequila', name: 'Tequila', category: 'spirit' },
      { id: 'lime-juice', name: 'Lime Juice', category: 'citrus' },
      { id: 'lemon-juice', name: 'Lemon Juice', category: 'citrus' },
      { id: 'simple-syrup', name: 'Simple Syrup', category: 'syrup' },
      { id: 'bitters', name: 'Bitters', category: 'bitters' },
    ];
  }

  // Fetch user badges
  useEffect(() => {
    async function fetchBadges() {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      if (!error && data) {
        setUserBadges(data);
      }
    }

    fetchBadges();
  }, [user, supabase]);

  // Separate loading states - don't block entire dashboard on bar/favorites loading
  const isAuthLoading = authLoading;
  const isContentLoading = barLoading || favsLoading || recentLoading;

  // Stable greeting that never causes re-render
  const [greeting, setGreeting] = useState<string>("Welcome back");
  const greetingInitialized = useRef(false);

  // Initialize greeting only once
  useEffect(() => {
    if (greetingInitialized.current) return;
    
    const greetingKey = 'mixwise-dashboard-greeting';
    
    try {
      const storedGreeting = localStorage.getItem(greetingKey);
      if (storedGreeting) {
        setGreeting(storedGreeting);
        greetingInitialized.current = true;
        return;
      }
    } catch (e) {
      // localStorage not available
    }

    // Wait for profile or user to be available
    if (!profile && !user) return;

    // Generate greeting once we have user data
    let stableName = "Bartender";
    if (profile?.display_name) {
      stableName = profile.display_name;
    } else if (user?.email) {
      stableName = user.email.split("@")[0];
    }

    const firstName = stableName.split(" ")[0];
    const hour = new Date().getHours();
    const nameHash = firstName.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
    const greetingIndex = nameHash % 3;

    let newGreeting: string;
    if (hour < 12) {
      const greetings = [
        `Good morning, ${firstName}. Ready to start shaking things up?`,
        `Morning, ${firstName}. The bar is open, metaphorically.`,
        `Rise and shine, ${firstName}. Time to mix something great.`,
      ];
      newGreeting = greetings[greetingIndex];
    } else if (hour < 18) {
      const greetings = [
        `Good afternoon, ${firstName}. Feeling inspired?`,
        `Hey ${firstName}, it's cocktail o'clock somewhere.`,
        `Afternoon, ${firstName}. Your bar awaits.`,
      ];
      newGreeting = greetings[greetingIndex];
    } else {
      const greetings = [
        `Good evening, ${firstName}. Let's make something smooth.`,
        `Evening, ${firstName}. Perfect time for a drink.`,
        `Welcome back, ${firstName}. What's on the menu tonight?`,
      ];
      newGreeting = greetings[greetingIndex];
    }

    setGreeting(newGreeting);
    greetingInitialized.current = true;
    
    // Cache for next time
    try {
      localStorage.setItem(greetingKey, newGreeting);
    } catch (e) {
      // localStorage not available
    }
  }, [profile, user]); // Only run when profile or user changes

  const handleRemoveFromInventory = useCallback(async (id: string) => {
    await removeIngredient(id);
  }, [removeIngredient]);

  // Only show loading skeleton during initial auth check
  if (isAuthLoading) {
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-mist rounded-2xl w-64" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-mist rounded-3xl" />
              ))}
            </div>
            <div className="h-64 bg-mist rounded-3xl" />
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mx-auto mb-6">
              <TrophyIcon className="w-10 h-10 text-sage" />
            </div>
            <h1 className="text-3xl font-display font-bold text-forest mb-3">
              Your Personal Dashboard
            </h1>
            <p className="text-sage mb-8 max-w-md mx-auto">
              Sign in to track your bar inventory, favorites, recommendations, and badges.
            </p>
            <button
              onClick={() => openAuthDialog()}
              className="px-8 py-4 bg-terracotta text-cream font-bold rounded-2xl hover:bg-terracotta-dark transition-all shadow-lg shadow-terracotta/20"
            >
              Create Free Account
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  // Add error boundary for debugging
  try {
    return (
      <div className="py-8 sm:py-12 bg-cream min-h-screen">
        <MainContainer>
          {/* Dynamic Header - Key is critical to prevent re-render flickering */}
          <div 
            key="dashboard-header"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-display font-bold text-forest">
                {greeting}
              </h1>
              <p className="text-sage mt-1">
                Track your bar, favorites, and progress
              </p>
            </div>
          {/* Share buttons - show placeholder to prevent layout shift */}
          {ingredientIds.length > 0 && user?.id && (
            <div className="min-w-[160px]">
              {preferencesLoading ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-mist rounded-2xl text-sm font-medium">
                  <ShareIcon className="w-4 h-4 text-sage" />
                  <span className="text-sage">Loading...</span>
                </div>
              ) : preferences?.public_bar_enabled ? (
                <Link
                  href={`/bar/${profile?.username || profile?.public_slug || user.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-mist hover:border-stone text-forest rounded-2xl transition-all text-sm font-medium shadow-soft"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share My Bar
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-olive hover:bg-olive-dark text-cream rounded-2xl transition-all text-sm font-medium shadow-soft"
                >
                  <ShareIcon className="w-4 h-4" />
                  Enable Public Bar
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What You Can Make - 100% matches */}
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-mist">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-olive" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">
                      What You Can Make
                    </h2>
                    <span className="text-sm text-sage block min-h-[1.25rem]">
                      {loadingRecs ? "Loading..." : recommendations.length > 0 ? `${recommendations.length} cocktail${recommendations.length !== 1 ? "s" : ""} ready` : ""}
                    </span>
                  </div>
                </div>
                <Link
                  href="/mix?step=menu"
                  className="text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium"
                >
                  View all →
                </Link>
              </div>
              <div className="p-6">
                {dataLoadError ? (
                  <div className="text-center py-8">
                    <p className="text-terracotta mb-4">
                      {dataLoadError}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-2 text-forest hover:text-terracotta font-medium"
                    >
                      Refresh Page
                    </button>
                  </div>
                ) : loadingRecs ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-mist rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendations.slice(0, DASHBOARD_READY_LIMIT).map((cocktail) => (
                      <Link
                        key={cocktail._id}
                        href={`/cocktails/${cocktail.slug?.current}`}
                        className="flex items-center gap-4 p-3 bg-cream hover:bg-mist rounded-2xl transition-all group"
                      >
                        <Image
                          src={cocktail.externalImageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjI4IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4="}
                          alt={cocktail.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjI4IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4=";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-forest group-hover:text-terracotta truncate transition-colors">
                            {formatCocktailName(cocktail.name)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sage mb-4">
                      Add ingredients to your bar to see cocktails you can make.
                    </p>
                    <Link
                      href="/mix"
                      className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      <PlusCircleIcon className="w-5 h-5" />
                      Build Your Bar
                    </Link>
                  </div>
                )}

                {!loadingRecs && recommendations.length > DASHBOARD_READY_LIMIT && (
                  <div className="mt-4 text-sm text-sage">
                    Showing {DASHBOARD_READY_LIMIT} of {recommendations.length}.{" "}
                    <Link
                      href="/mix?step=menu"
                      className="text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      View all
                    </Link>
                    .
                  </div>
                )}
              </div>
            </section>

            {/* Almost There - Reserve space to prevent layout shift */}
            {loadingRecs ? (
              <div className="card overflow-hidden opacity-0">
                <div className="flex items-center justify-between p-6 border-b border-mist">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                      <BeakerIcon className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        Almost There
                      </h2>
                      <span className="text-sm text-sage block min-h-[1.25rem]">Loading...</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-cream rounded-2xl animate-pulse">
                        <div className="w-14 h-14 bg-mist rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-mist rounded mb-1" />
                          <div className="h-3 bg-mist rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : almostThereCocktails.length > 0 ? (
              <section className="card overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-mist">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-terracotta/20 rounded-xl flex items-center justify-center">
                      <BeakerIcon className="w-5 h-5 text-terracotta" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-forest">
                        Almost There
                      </h2>
                      <span className="text-sm text-sage block min-h-[1.25rem]">
                        {almostThereCocktails.length} cocktail{almostThereCocktails.length !== 1 ? "s" : ""} close to ready
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/mix"
                    className="text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium"
                  >
                    Add ingredients →
                  </Link>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {almostThereCocktails.slice(0, 6).map((cocktail) => (
                      <Link
                        key={cocktail._id}
                        href={`/cocktails/${cocktail.slug?.current}`}
                        className="flex items-center gap-4 p-3 bg-cream hover:bg-mist rounded-2xl transition-all group"
                      >
                        <Image
                          src={cocktail.externalImageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjI4IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4="}
                          alt={cocktail.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjI4IiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4=";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-forest group-hover:text-terracotta truncate transition-colors">
                            {formatCocktailName(cocktail.name)}
                          </p>
                          {cocktail.missingIngredientNames.length > 0 && (
                            <p className="text-sm text-sage truncate">
                              Missing: {cocktail.missingIngredientNames.slice(0, 2).join(", ")}
                              {cocktail.missingIngredientNames.length > 2 ? "…" : ""}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Recent Activity - Favorites + Recently Viewed */}
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-mist">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-forest" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-forest">
                    Recent Activity
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Favorites */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-forest flex items-center gap-2">
                      <HeartIcon className="w-5 h-5 text-terracotta" />
                      Favorites
                    </h3>
                    <Link
                      href="/cocktails"
                      className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Browse →
                    </Link>
                  </div>
                  <div className="min-h-[7rem] flex items-center">
                    {favsLoading ? (
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="flex-shrink-0 w-32">
                            <div className="w-32 h-24 bg-mist rounded-2xl mb-2 animate-pulse" />
                            <div className="h-4 bg-mist rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {favorites.slice(0, 6).map((fav) => (
                          <Link
                            key={fav.id}
                            href={`/cocktails/${fav.cocktail_slug}`}
                            className="flex-shrink-0 w-32 group"
                          >
                            <Image
                              src={fav.cocktail_image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDEyOCA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSI5NiIgZmlsbD0iI0U2RUI0NCIvPgo8dGV4dCB4PSI2NCIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzVGNkY1RiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+44Gjwpc8L3RleHQ+Cjwvc3ZnPg=="}
                              alt={fav.cocktail_name || "Cocktail"}
                              width={128}
                              height={96}
                              className="w-32 h-24 rounded-2xl object-cover mb-2"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSI5NiIgZmlsbD0iI0U2RUI0NCIvPgo8dGV4dCB4PSI2NCIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzVGNkY1RiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+44Gjwpc8L3RleHQ+Cjwvc3ZnPg==";
                              }}
                            />
                            <p className="text-sm text-forest group-hover:text-terracotta truncate transition-colors">
                              {fav.cocktail_name}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sage text-sm">
                        Save cocktails to favorites to see them here.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recently Viewed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-forest flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-sage" />
                      Recently Viewed
                    </h3>
                  </div>
                  {recentLoading ? (
                    <div className="flex gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-shrink-0 w-32">
                          <div className="w-32 h-24 bg-mist rounded-2xl mb-2 animate-pulse" />
                          <div className="h-4 bg-mist rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : recentlyViewed.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                      {recentlyViewed.slice(0, 6).map((item) => (
                        <Link
                          key={item.id}
                          href={`/cocktails/${item.cocktail_slug}`}
                          className="flex-shrink-0 w-32 group"
                        >
                          <Image
                            src={item.cocktail_image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4="}
                            alt={item.cocktail_name || "Cocktail"}
                            width={128}
                            height={96}
                            className="w-32 h-24 rounded-2xl object-cover mb-2"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRTZFQkU0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNUY2RjVFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn424PC90ZXh0Pgo8L3N2Zz4=";
                            }}
                          />
                          <p className="text-sm text-forest group-hover:text-terracotta truncate transition-colors">
                            {item.cocktail_name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sage text-sm">
                      Start exploring cocktails to build your history.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - My Bar Sidebar */}
          <div className="space-y-6">
            {/* My Bar */}
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-mist">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive/20 rounded-xl flex items-center justify-center">
                    <BeakerIcon className="w-5 h-5 text-olive" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">
                      My Bar
                    </h2>
                    <span className="text-sm text-sage block min-h-[1.25rem]">
                      {barLoading ? "Loading..." : `${ingredientIds.length} ingredient${ingredientIds.length !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
                <Link
                  href="/mix"
                  className="px-4 py-2 text-sm text-terracotta hover:text-terracotta-dark hover:bg-terracotta/10 rounded-xl transition-colors font-medium"
                >
                  Add
                </Link>
              </div>
              <div className="p-6">
                {barLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-xl animate-pulse">
                        <div className="w-8 h-8 bg-mist rounded-lg" />
                        <div className="flex-1 h-4 bg-mist rounded" />
                      </div>
                    ))}
                  </div>
                ) : ingredientIds.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-mist rounded-full flex items-center justify-center mx-auto mb-4">
                      <BeakerIcon className="w-8 h-8 text-sage" />
                    </div>
                    <p className="text-sage mb-4">Your bar is empty.</p>
                    <Link
                      href="/mix"
                      className="text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Add your first ingredient →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                    {ingredientIds.map((id) => {
                      // Find the ingredient object for display
                      // Convert both IDs to strings for comparison
                      const ingredient = allIngredients.find(i => String(i.id) === String(id));

                      // Debug logging
                      if (process.env.NODE_ENV === 'development') {
                        console.log(`[DASHBOARD] Looking for ingredient ID ${id} (type: ${typeof id})`);
                        console.log(`[DASHBOARD] Found ingredient:`, ingredient ? `${ingredient.name} (${ingredient.id})` : 'NOT FOUND');
                        console.log(`[DASHBOARD] allIngredients sample:`, allIngredients.slice(0, 3).map(i => `${i.name} (${i.id})`));
                      }

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between px-4 py-3 bg-cream rounded-xl text-sm group"
                        >
                          <span className="text-forest">
                            {ingredient?.name || id}
                          </span>
                          <button
                            onClick={() => handleRemoveFromInventory(id)}
                            className="text-sage hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="card p-6">
              <h3 className="text-lg font-display font-bold text-forest mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/mix"
                  className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group"
                >
                  <span className="text-forest group-hover:text-terracotta transition-colors">Edit My Bar</span>
                  <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
                </Link>
                <Link
                  href="/cocktails"
                  className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group"
                >
                  <span className="text-forest group-hover:text-terracotta transition-colors">Browse Cocktails</span>
                  <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
                </Link>
                {/* Show share buttons when user has ingredients - handle loading gracefully */}
                {ingredientIds.length > 0 && (
                  preferences ? (
                    preferences.public_bar_enabled ? (
                      <Link
                        href={`/bar/${profile?.username || profile?.public_slug || user?.id}`}
                        className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group"
                      >
                        <span className="text-forest group-hover:text-terracotta transition-colors">Share My Bar</span>
                        <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
                      </Link>
                    ) : (
                      <Link
                        href="/account"
                        className="flex items-center justify-between p-3 bg-olive/20 hover:bg-olive/30 rounded-xl transition-colors group"
                      >
                        <span className="text-olive group-hover:text-olive-dark transition-colors">Enable Public Bar</span>
                        <ArrowRightIcon className="w-4 h-4 text-olive group-hover:text-olive-dark transition-colors" />
                      </Link>
                    )
                  ) : (
                    // Loading placeholder while preferences load
                    <div className="flex items-center justify-between p-3 bg-mist rounded-xl">
                      <span className="text-sage">Loading share options...</span>
                      <ArrowRightIcon className="w-4 h-4 text-sage" />
                    </div>
                  )
                )}
                <button
                  onClick={() => router.push("/onboarding")}
                  className="flex items-center justify-between p-3 bg-cream hover:bg-mist rounded-xl transition-colors group w-full text-left"
                >
                  <span className="text-forest group-hover:text-terracotta transition-colors">Update Preferences</span>
                  <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </MainContainer>
    </div>
  );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="py-12 bg-cream min-h-screen">
        <MainContainer>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-forest mb-3">
              Something went wrong
            </h1>
            <p className="text-sage mb-8 max-w-md mx-auto">
              We encountered an error loading your dashboard. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl font-medium"
            >
              Refresh Page
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: typeof BeakerIcon;
  label: string;
  value: number;
  href: string;
  color: "olive" | "terracotta" | "forest" | "sage";
}) {
  const colorClasses = {
    olive: "text-olive bg-olive/10",
    terracotta: "text-terracotta bg-terracotta/10",
    forest: "text-forest bg-forest/10",
    sage: "text-sage bg-sage/10",
  };

  return (
    <Link
      href={href}
      className="card card-hover p-6"
    >
      <div className={`inline-flex p-2 rounded-xl ${colorClasses[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-forest">{value}</p>
      <p className="text-sm text-sage">{label}</p>
    </Link>
  );
}

// Badge Card Component
function BadgeCard({ badge, locked }: { badge: BadgeDefinition & { locked?: boolean; earnedAt?: string }, locked: boolean }) {
  return (
    <div className={`relative group flex flex-col items-center p-3 bg-cream rounded-xl text-center transition-all ${
      locked ? "opacity-60" : ""
    }`}>
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${
          locked ? "from-sage to-stone" : RARITY_COLORS[badge.rarity]
        } flex items-center justify-center text-2xl mb-2`}
      >
        {badge.icon}
      </div>
      <p className={`text-xs font-medium line-clamp-2 ${locked ? "text-sage" : "text-forest"}`}>
        {badge.name}
      </p>
      {locked && (
        <div className="absolute inset-0 bg-white/5 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-sage text-xs">🔒</div>
        </div>
      )}

      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100
                      bg-forest text-cream text-xs font-medium
                      px-2 py-1 rounded-lg shadow-lg
                      whitespace-nowrap pointer-events-none
                      transition-opacity duration-200 z-50">
        {badge.criteria}
      </div>
    </div>
  );
}
