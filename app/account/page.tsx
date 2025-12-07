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
  }, [user]);

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
            <div className="h-8 bg-mist rounded-lg mx-auto w-64" />
            <div className="h-32 bg-mist rounded-3xl" />
            <div className="h-64 bg-mist rounded-3xl" />
            <div className="h-48 bg-mist rounded-3xl" />
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
            <UserCircleIcon className="w-16 h-16 text-sage mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-forest mb-2">
              Sign in to access your account
            </h1>
            <p className="text-sage mb-6">
              Create a free account to save your bar, favorite cocktails, and more.
            </p>
            <button
              onClick={() => openAuthDialog()}
              className="btn-primary"
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
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-forest mb-2">
              Account Settings
            </h1>
            <p className="text-sage">Manage your profile and account preferences</p>
          </div>

          {/* Profile Section */}
          <section className="section-botanical">
            <h2 className="text-xl font-serif font-bold text-forest mb-6">Profile</h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwYTBmMWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTIgMTJDMxMy44IDEyIDE1IDEzLjggMTUgMTVDMTUgMTYuMiAxMy44IDE4IDEyIDE4QzEwLjIgMTggOSAxNi4yIDkgMTVDOSAxMy44IDEwLjIgMTIgMTIgMTJaIi8+CjxwYXRoIGQ9Ik0yMSAyMWgzVjIwQzIxIDE4LjkgMjAgMTcuOSAyMCAxN0gxOFYyMEgzVjIxWk0xNiAyMEgzVjE5QzE2IDE4LjkgMTYuOSAxOCA4IDE4VjIwSDR2MWMwIDEuMS0uOSAyLTIgMkgxNXYtMWMwLTEuMS45LTItMi0ySDE2VjIwWk0xNiAyMEgzVjE5QzE2IDE4LjkgMTYuOSAxOCA4IDE4VjIwSDR2MWMwIDEuMS0uOSAyLTIgMkgxNXYtMWMwLTEuMS45LTItMi0ySDE2VjIwWiIvPgo8L3N2Zz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4K"}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-olive/20 flex items-center justify-center text-olive font-bold text-2xl">
                    {userInitial}
                  </div>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-serif font-bold text-forest mb-1">
                  {displayName}
                </h3>
                <p className="text-sage mb-4">{email}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="displayName" className="label-botanical">Display Name</label>
                    <input
                      id="displayName"
                      type="text"
                      defaultValue={profile?.display_name || ""}
                      className="input-botanical"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="btn-primary w-full">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="section-botanical">
            <div className="flex items-center gap-3 mb-6">
              <TrophyIcon className="w-6 h-6 text-olive" />
              <h2 className="text-xl font-serif font-bold text-forest">
                Achievements
              </h2>
              <span className="text-sm text-sage">
                {userBadges.length} earned
              </span>
            </div>
            {allBadgeData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {allBadgeData.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} locked={badge.locked} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sage text-sm">
                  Badge system coming soon
                </p>
              </div>
            )}
          </section>

          {/* Account Actions */}
          <section className="section-botanical">
            <h2 className="text-xl font-serif font-bold text-forest mb-6">Account Actions</h2>
            <div className="space-y-4">
              <button
                onClick={clearHistory}
                className="flex items-center justify-between p-4 bg-mist/50 hover:bg-mist rounded-xl transition-colors w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <TrashIcon className="w-5 h-5 text-sage group-hover:text-forest" />
                  <span className="text-forest">Clear History</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-forest" />
              </button>
              <Link
                href={`/bar/${user?.id}`}
                className="flex items-center justify-between p-4 bg-mist/50 hover:bg-mist rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ShareIcon className="w-5 h-5 text-sage group-hover:text-forest" />
                  <span className="text-forest">Share My Bar</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-forest" />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-between p-4 bg-mist/50 hover:bg-mist rounded-xl transition-colors w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-terracotta group-hover:text-terracotta-dark" />
                  <span className="text-forest">Sign Out</span>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-forest" />
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
    <div className={`relative group flex flex-col items-center p-4 bg-mist/50 rounded-xl text-center transition-all border border-stone/20 ${
      locked ? "opacity-60" : ""
    }`}>
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${
          locked ? "from-stone-300 to-stone-400" : RARITY_COLORS[badge.rarity]
        } flex items-center justify-center text-2xl mb-3 shadow-sm`}
      >
        {badge.icon}
      </div>
      <p className={`text-sm font-medium line-clamp-2 ${locked ? "text-sage/60" : "text-forest"}`}>
        {badge.name}
      </p>
      {locked && (
        <div className="absolute inset-0 bg-mist/5 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-sage/60 text-xs">🔒</div>
        </div>
      )}

      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100
                      bg-forest/90 text-cream text-sm font-medium
                      px-3 py-2 rounded-lg shadow-lg
                      whitespace-nowrap pointer-events-none
                      transition-opacity duration-200 z-50 max-w-xs">
        {badge.criteria}
      </div>
    </div>
  );
}
