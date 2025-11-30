"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { createClient } from "@/lib/supabase/client";
import { sanityClient } from "@/lib/sanityClient";
import { BADGES, RARITY_COLORS, BadgeDefinition } from "@/lib/badges";
import {
  BeakerIcon,
  HeartIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ShareIcon,
  ArrowRightIcon,
  PlusCircleIcon,
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
  const { openAuthDialog } = useAuthDialog();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const { favorites, isLoading: favsLoading } = useFavorites();
  const { recentlyViewed, isLoading: recentLoading } = useRecentlyViewed();
  const { preferences, needsOnboarding } = useUserPreferences();

  const [recommendations, setRecommendations] = useState<RecommendedCocktail[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const supabase = createClient();

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
        title: "Sign in to view your dashboard",
        subtitle: "Create a free account to track your progress and get recommendations.",
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

  // Badge display data
  const badgeData = useMemo(() => {
    return userBadges.map((ub) => ({
      ...BADGES[ub.badge_id],
      earnedAt: ub.earned_at,
    }));
  }, [userBadges]);

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-100">
              Your Dashboard
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

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={BeakerIcon}
            label="Ingredients"
            value={ingredientIds.length}
            href="/mix"
            color="lime"
          />
          <StatCard
            icon={HeartIcon}
            label="Favorites"
            value={favorites.length}
            href="/account"
            color="pink"
          />
          <StatCard
            icon={ClockIcon}
            label="Recently Viewed"
            value={recentlyViewed.length}
            href="/cocktails"
            color="sky"
          />
          <StatCard
            icon={TrophyIcon}
            label="Badges"
            value={userBadges.length}
            href="#badges"
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommendations */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    Recommended For You
                  </h2>
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
                            {Math.round((cocktail.matchScore || 0) * 100)}% match
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">
                      Add ingredients to your bar to get personalized recommendations.
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

            {/* Recent Activity */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-sky-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    Recently Viewed
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {recentlyViewed.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {recentlyViewed.slice(0, 8).map((item) => (
                      <Link
                        key={item.id}
                        href={`/cocktails/${item.cocktail_slug}`}
                        className="flex-shrink-0 w-32 group"
                      >
                        {item.cocktail_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                  <p className="text-slate-400 text-center py-4">
                    Start exploring cocktails to build your history.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badges */}
            <section id="badges" className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <TrophyIcon className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-serif font-bold text-slate-100">
                    Your Badges
                  </h2>
                </div>
              </div>
              <div className="p-6">
                {badgeData.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {badgeData.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge as BadgeDefinition} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-sm mb-4">
                      Earn badges by exploring cocktails and building your bar.
                    </p>
                    <Link
                      href="/onboarding"
                      className="text-lime-400 hover:text-lime-300 text-sm"
                    >
                      Complete onboarding for your first badge →
                    </Link>
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
function BadgeCard({ badge }: { badge: BadgeDefinition }) {
  return (
    <div
      className="flex flex-col items-center p-3 bg-slate-800/50 rounded-xl text-center"
      title={badge.description}
    >
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} flex items-center justify-center text-2xl mb-2`}
      >
        {badge.icon}
      </div>
      <p className="text-xs text-slate-300 font-medium line-clamp-2">{badge.name}</p>
    </div>
  );
}

