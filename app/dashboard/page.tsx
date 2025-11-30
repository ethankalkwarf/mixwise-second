"use client";

import { useEffect, useState, useMemo } from "react";
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
import { sanityClient } from "@/lib/sanityClient";
import type { MixIngredient } from "@/lib/mixTypes";
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
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const { openAuthDialog } = useAuthDialog();
  const { ingredientIds, isLoading: barLoading, removeIngredient } = useBarIngredients();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { preferences, needsOnboarding } = useUserPreferences();

  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedCocktail[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!authLoading && isAuthenticated && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [authLoading, isAuthenticated, needsOnboarding, router]);

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

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      if (!isAuthenticated || ingredientIds.length === 0) {
        setRecommendations([]);
        setLoadingRecs(false);
        return;
      }

      try {
        // Fetch cocktails from Sanity
        const cocktails = await sanityClient.fetch<RecommendedCocktail[]>(`
          *[_type == "cocktail"][0...50] {
            _id,
            name,
            slug,
            externalImageUrl,
            primarySpirit,
            "ingredientIds": ingredients[].ingredient->._id
          }
        `);

        // Score cocktails by how many ingredients user has
        const ingredientSet = new Set(ingredientIds);
        const scoredCocktails = cocktails
          .map((cocktail) => {
            const cocktailIngredients = (cocktail as unknown as { ingredientIds: string[] }).ingredientIds || [];
            const matchCount = cocktailIngredients.filter((id) => ingredientSet.has(id)).length;
            const totalIngredients = cocktailIngredients.length || 1;
            const matchScore = totalIngredients > 0 ? matchCount / totalIngredients : 0;

            // Boost score if matches user preferences
            let finalScore = matchScore;
            if (preferences?.preferred_spirits?.includes(cocktail.primarySpirit?.toLowerCase() || "")) {
              finalScore += 0.2;
            }

            return { ...cocktail, matchScore: finalScore };
          })
          .filter((c) => c.matchScore && c.matchScore > 0.3)
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10);

        setRecommendations(scoredCocktails);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecs(false);
      }
    }

    fetchRecommendations();
  }, [isAuthenticated, ingredientIds, preferences]);

  // Fetch ingredients for display
  useEffect(() => {
    async function fetchIngredients() {
      try {
        const ingredients = await sanityClient.fetch<MixIngredient[]>(`
          *[_type == "ingredient"] {
            _id,
            name,
            category
          }
        `);
        setAllIngredients(ingredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    }

    fetchIngredients();
  }, []);

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

  const isLoading = authLoading || barLoading || favsLoading || recentLoading;

  // Dynamic greeting based on time of day
  const getDynamicGreeting = useMemo(() => {
    const displayName = profile?.display_name || user?.email?.split("@")[0] || "Bartender";
    const hour = new Date().getHours();

    let greeting: string;
    if (hour < 12) {
      // Morning
      const greetings = [
        `Good morning, ${displayName}. Ready to start shaking things up?`,
        `Morning, ${displayName}. The bar is open, metaphorically.`,
        `Rise and shine, ${displayName}. Time to mix something great.`,
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (hour < 18) {
      // Afternoon
      const greetings = [
        `Good afternoon, ${displayName}. Feeling inspired?`,
        `Hey ${displayName}, it's cocktail o'clock somewhere.`,
        `Afternoon, ${displayName}. Your bar awaits.`,
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      // Evening
      const greetings = [
        `Good evening, ${displayName}. Let's make something smooth.`,
        `Evening, ${displayName}. Perfect time for a drink.`,
        `Welcome back, ${displayName}. What's on the menu tonight?`,
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }

    return greeting;
  }, [user?.email]);

  const handleRemoveFromInventory = useCallback(async (id: string) => {
    await removeIngredient(id);
  }, [removeIngredient]);

  if (isLoading) {
    return (
      <div className="py-12">
        <MainContainer>
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-800 rounded-lg w-64" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-slate-800 rounded-xl" />
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12">
        <MainContainer>
          <div className="text-center py-20">
            <TrophyIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-slate-200 mb-2">
              Your Personal Dashboard
            </h1>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Sign in to track your bar inventory, favorites, recommendations, and badges.
            </p>
            <button
              onClick={() => openAuthDialog()}
              className="px-6 py-3 bg-lime-500 text-slate-900 font-bold rounded-lg hover:bg-lime-400 transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <MainContainer>
        {/* Dynamic Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-100">
              {getDynamicGreeting}
            </h1>
            <p className="text-slate-400 mt-1">
              Track your bar, favorites, and progress
            </p>
          </div>
          <Link
            href={`/bar/${user?.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm"
          >
            <ShareIcon className="w-4 h-4" />
            Share My Bar
          </Link>
        </div>

        {/* Main Content Grid - Two Columns */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You Can Make - 100% matches */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-lime-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    What You Can Make
                  </h2>
                  {recommendations.length > 0 && (
                    <span className="text-sm text-slate-500">
                      {recommendations.length} cocktail{recommendations.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <Link
                  href="/cocktails"
                  className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="p-6">
                {loadingRecs ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recommendations.slice(0, 6).map((cocktail) => (
                      <Link
                        key={cocktail._id}
                        href={`/cocktails/${cocktail.slug?.current}`}
                        className="flex items-center gap-4 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                      >
                        {cocktail.externalImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cocktail.externalImageUrl}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
                            🍸
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-200 group-hover:text-lime-400 truncate transition-colors">
                            {cocktail.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            100% match
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">
                      Add ingredients to your bar to see cocktails you can make.
                    </p>
                    <Link
                      href="/mix"
                      className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300"
                    >
                      <PlusCircleIcon className="w-5 h-5" />
                      Build Your Bar
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Almost There - Missing 1 ingredient */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <BeakerIcon className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    Almost There
                  </h2>
                  {recommendations.length > 0 && (
                    <span className="text-sm text-slate-500">
                      Add one ingredient to unlock
                    </span>
                  )}
                </div>
                <Link
                  href="/mix"
                  className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
                >
                  Add ingredients →
                </Link>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">
                    Cocktails that need just one more ingredient will appear here.
                  </p>
                  <Link
                    href="/mix"
                    className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Expand Your Bar
                  </Link>
                </div>
              </div>
            </section>

            {/* Recent Activity - Favorites + Recently Viewed */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-sky-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    Recent Activity
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Favorites */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <HeartIcon className="w-5 h-5 text-red-400" />
                      Favorites
                    </h3>
                    <Link
                      href="/cocktails"
                      className="text-sm text-lime-400 hover:text-lime-300"
                    >
                      Browse →
                    </Link>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {favorites.slice(0, 6).map((fav) => (
                        <Link
                          key={fav.id}
                          href={`/cocktails/${fav.cocktail_slug}`}
                          className="flex-shrink-0 w-32 group"
                        >
                          {fav.cocktail_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fav.cocktail_image_url}
                              alt=""
                              className="w-32 h-24 rounded-lg object-cover mb-2"
                            />
                          ) : (
                            <div className="w-32 h-24 rounded-lg bg-slate-800 flex items-center justify-center text-3xl mb-2">
                              🍸
                            </div>
                          )}
                          <p className="text-sm text-slate-300 group-hover:text-lime-400 truncate transition-colors">
                            {fav.cocktail_name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      Save cocktails to favorites to see them here.
                    </p>
                  )}
                </div>

                {/* Recently Viewed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-sky-400" />
                      Recently Viewed
                    </h3>
                  </div>
                  {recentlyViewed.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {recentlyViewed.slice(0, 6).map((item) => (
                        <Link
                          key={item.id}
                          href={`/cocktails/${item.cocktail_slug}`}
                          className="flex-shrink-0 w-32 group"
                        >
                          {item.cocktail_image_url ? (
                            // eslint-disable-next-line @next/next/no/img-element
                            <img
                              src={item.cocktail_image_url}
                              alt=""
                              className="w-32 h-24 rounded-lg object-cover mb-2"
                            />
                          ) : (
                            <div className="w-32 h-24 rounded-lg bg-slate-800 flex items-center justify-center text-3xl mb-2">
                              🍸
                            </div>
                          )}
                          <p className="text-sm text-slate-300 group-hover:text-lime-400 truncate transition-colors">
                            {item.cocktail_name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      Start exploring cocktails to build your history.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - My Bar Sidebar */}
          <div className="space-y-8">
            {/* My Bar */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <BeakerIcon className="w-6 h-6 text-lime-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    My Bar
                  </h2>
                  <span className="text-sm text-slate-500">
                    {ingredientIds.length} ingredient{ingredientIds.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Link
                  href="/mix"
                  className="px-4 py-2 text-sm text-lime-400 hover:text-lime-300 hover:bg-lime-500/10 rounded-lg transition-colors"
                >
                  Add Ingredient
                </Link>
              </div>
              <div className="p-6">
                {ingredientIds.length === 0 ? (
                  <div className="text-center py-8">
                    <BeakerIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">Your bar is empty.</p>
                    <Link
                      href="/mix"
                      className="text-lime-400 hover:text-lime-300 font-medium"
                    >
                      Add your first ingredient →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ingredientIds.map((id) => {
                      // Find the ingredient object for display
                      const ingredient = allIngredients.find(i => i.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-lg text-sm"
                        >
                          <span className="text-slate-300">
                            {ingredient?.name || id}
                          </span>
                          <button
                            onClick={() => handleRemoveFromInventory(id)}
                            className="text-slate-500 hover:text-red-400"
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
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/mix"
                  className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-slate-300">Edit My Bar</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  href="/cocktails"
                  className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-slate-300">Browse Cocktails</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  href={`/bar/${user?.id}`}
                  className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="text-slate-300">Share My Bar</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </MainContainer>
    </div>
  );
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
  color: "lime" | "pink" | "sky" | "amber";
}) {
  const colorClasses = {
    lime: "text-lime-400 bg-lime-500/10",
    pink: "text-pink-400 bg-pink-500/10",
    sky: "text-sky-400 bg-sky-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };

  return (
    <Link
      href={href}
      className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
    >
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </Link>
  );
}

// Badge Card Component
function BadgeCard({ badge, locked }: { badge: BadgeDefinition & { locked?: boolean; earnedAt?: string }, locked: boolean }) {
  return (
    <div className={`relative group flex flex-col items-center p-3 bg-slate-800/50 rounded-xl text-center transition-all ${
      locked ? "opacity-60" : ""
    }`}>
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${
          locked ? "from-slate-500 to-slate-600" : RARITY_COLORS[badge.rarity]
        } flex items-center justify-center text-2xl mb-2`}
      >
        {badge.icon}
      </div>
      <p className={`text-xs font-medium line-clamp-2 ${locked ? "text-slate-500" : "text-slate-300"}`}>
        {badge.name}
      </p>
      {locked && (
        <div className="absolute inset-0 bg-slate-900/5 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-slate-500 text-xs">🔒</div>
        </div>
      )}

      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100
                      bg-slate-900/95 text-slate-200 text-xs font-medium
                      px-2 py-1 rounded-md shadow-lg shadow-black/40
                      whitespace-nowrap pointer-events-none
                      transition-opacity duration-200 z-50">
        {badge.criteria}
      </div>
    </div>
  );
}

