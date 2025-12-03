"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import Image from "next/image";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { sanityClient } from "@/lib/sanityClient";
import { BADGES, BADGE_LIST, RARITY_COLORS, BadgeDefinition } from "@/lib/badges";
import { TrophyIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  TrashIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

// Simple query to get all ingredient names
const INGREDIENT_NAMES_QUERY = `*[_type == "ingredient"] { _id, name }`;

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgeDisplayData extends BadgeDefinition {
  locked?: boolean;
  earnedAt?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated, signOut } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const { openAuthDialog } = useAuthDialog();
  const { recentlyViewed, clearHistory } = useRecentlyViewed();
  
  // Fetch ingredient names from Sanity for fallback lookup
  const [sanityNames, setSanityNames] = useState<Map<string, string>>(new Map());
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  
  useEffect(() => {
    sanityClient.fetch<Array<{ _id: string; name: string }>>(INGREDIENT_NAMES_QUERY)
      .then((data) => {
        const nameMap = new Map<string, string>();
        data.forEach((ing) => nameMap.set(ing._id, ing.name));
        setSanityNames(nameMap);
      })
      .catch((err) => console.error("Failed to fetch ingredient names:", err));
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

  // Badge display data - show all badges with earned status
  const allBadgeData = useMemo(() => {
    const earnedIds = new Set(userBadges.map(ub => ub.badge_id));
    const earnedTimes = new Map(userBadges.map(ub => [ub.badge_id, ub.earned_at]));

    return BADGE_LIST.map((badge) => ({
      ...badge,
      locked: !earnedIds.has(badge.id),
      earnedAt: earnedTimes.get(badge.id),
    }));
  }, [userBadges]);

  // Helper to get ingredient display name (from stored name, Sanity, or ID fallback)
  const getIngredientName = (ingredient: { id: string; name: string | null }) => {
    return ingredient.name || sanityNames.get(ingredient.id) || ingredient.id;
  };

  // Redirect to home or show auth dialog if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthDialog({
        title: "Sign in to view your account",
        subtitle: "Create a free account to save your bar, favorites, and more.",
        onSuccess: () => {
          // Stay on account page after sign in
        },
      });
    }
  }, [isLoading, isAuthenticated, openAuthDialog]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <MainContainer>
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-800 rounded-xl" />
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
            <UserCircleIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-slate-200 mb-2">
              Sign in to access your account
            </h1>
            <p className="text-slate-400 mb-6">
              Create a free account to save your bar, favorite cocktails, and more.
            </p>
            <button
              onClick={() => openAuthDialog()}
              className="px-6 py-3 bg-lime-500 text-slate-900 font-bold rounded-lg hover:bg-lime-400 transition-colors"
            >
              Sign in
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;
  const userInitial = displayName.charAt(0).toUpperCase();
  const email = user?.email;

  return (
    <div className="py-12">
      <MainContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwYTBmMWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTIgMTJDMxMy44IDEyIDE1IDEzLjggMTUgMTVDMTUgMTYuMiAxMy44IDE4IDEyIDE4QzEwLjIgMTggOSAxNi4yIDkgMTVDOSAxMy44IDEwLjIgMTIgMTIgMTJaIi8+CjxwYXRoIGQ9Ik0yMSAyMWgzVjIwQzIxIDE4LjkgMjAgMTcuOSAyMCAxN0gxOFYyMEgzVjIxWk0xNiAyMEgzVjE5QzE2IDE4LjkgMTYuOSAxOCA4IDE4VjIwSDR2MWMwIDEuMS0uOSAyLTIgMkgxNXYtMWMwLTEuMS45LTItMi0ySDE2VjIwWk0xNiAyMEgzVjE5QzE2IDE4LjkgMTYuOSAxOCA4IDE4VjIwSDR2MWMwIDEuMS0uOSAyLTIgMkgxNXYtMWMwLTEuMS45LTItMi0ySDE2VjIwWiIvPgo8L3N2Zz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4K"}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-2xl">
                    {userInitial}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-100">
                    {displayName}
                  </h1>
                  <p className="text-slate-400">{email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <TrophyIcon className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  Achievements
                </h2>
                <span className="text-sm text-slate-500">
                  {userBadges.length} earned
                </span>
              </div>
            </div>
            <div className="p-6">
              {allBadgeData.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {allBadgeData.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} locked={badge.locked} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm">
                    Badge system coming soon
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Administrative Actions */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button
                onClick={clearHistory}
                className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <TrashIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">Clear History</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500" />
              </button>
              <Link
                href={`/bar/${user?.id}`}
                className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShareIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">Share My Bar</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-slate-300">Sign Out</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </section>
        </div>
      </MainContainer>
    </div>
  );
}

// Badge Card Component
function BadgeCard({ badge, locked }: { badge: BadgeDisplayData, locked: boolean }) {
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
                      bg-neutral-900/80 text-neutral-100 text-sm font-medium
                      px-2 py-1 rounded-md shadow-lg backdrop-blur-sm
                      whitespace-nowrap pointer-events-none
                      transition-opacity duration-200 z-50">
        {badge.criteria}
      </div>
    </div>
  );
}
