"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export const dynamic = 'force-dynamic';
import Image from "next/image";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { sanityClient } from "@/lib/sanityClient";
import { BADGES, BADGE_LIST, RARITY_COLORS, BadgeDefinition } from "@/lib/badges";
import { TrophyIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  TrashIcon,
  ShareIcon,
  GlobeAltIcon,
  LockClosedIcon,
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
  const { ingredientIds } = useBarIngredients();
  const { preferences, updatePreferences } = useUserPreferences();
  const toast = useToast();

  // Get the shareable bar URL (username or public_slug)
  const shareableBarUrl = profile?.username || profile?.public_slug;

  // Username management for public profiles
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
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

  // Generate default username suggestion
  const generateDefaultUsername = useCallback(() => {
    if (!profile?.display_name && !profile?.email) return '';
    const base = (profile?.display_name || profile?.email?.split('@')[0] || '').toLowerCase();
    // Remove special chars and replace spaces with underscores
    return base.replace(/[^a-z0-9]/g, '').substring(0, 20);
  }, [profile]);

  // Check username uniqueness via API
  const checkUsernameUnique = useCallback(async (username: string): Promise<boolean> => {
    if (!username.trim()) return false;

    try {
      const response = await fetch(`/api/username?username=${encodeURIComponent(username.trim())}`);
      if (!response.ok) {
        console.error('Error checking username availability:', response.statusText);
        return false;
      }

      const data = await response.json();
      return data.available === true;
    } catch (err) {
      console.error('Error checking username uniqueness:', err);
      return false;
    }
  }, []);

  // Update username via API
  const updateUsername = useCallback(async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to update username' };
      }

      const data = await response.json();
      return { success: true };
    } catch (err) {
      console.error('Error updating username:', err);
      return { success: false, error: 'Failed to update username' };
    }
  }, []);

  // Handle enabling public bar (with username check)
  const handleTogglePublicBar = useCallback(async (enabled: boolean) => {
    if (enabled && !profile?.username) {
      // Need to set username first
      const defaultUsername = generateDefaultUsername();
      setUsernameInput(defaultUsername);
      setUsernameError(null);
      setShowUsernameInput(true);
      return;
    }

    // Update the preference
    const result = await updatePreferences({ public_bar_enabled: enabled });
    if (result.error) {
      console.error("Failed to update privacy setting:", result.error);
      toast.error("Failed to update privacy setting");
    }
  }, [profile, generateDefaultUsername, updatePreferences, toast]);

  // Handle username form submission
  const handleUsernameSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    const username = usernameInput.trim();
    if (!username) {
      setUsernameError('Username is required');
      return;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsCheckingUsername(true);
    try {
      const isUnique = await checkUsernameUnique(username);
      if (!isUnique) {
        setUsernameError('This username is already taken');
        return;
      }

      const result = await updateUsername(username);
      if (!result.success) {
        setUsernameError(result.error || 'Failed to update username');
        return;
      }

      // Now enable public bar
      const prefResult = await updatePreferences({ public_bar_enabled: true });
      if (prefResult.error) {
        setUsernameError('Username updated but failed to enable public bar');
        return;
      }

      setShowUsernameInput(false);
      toast.success('Public bar enabled!');

    } catch (err) {
      console.error('Error in username submission:', err);
      setUsernameError('An unexpected error occurred');
    } finally {
      setIsCheckingUsername(false);
    }
  }, [usernameInput, checkUsernameUnique, updateUsername, updatePreferences, toast]);

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
                <div className="w-20 h-20 rounded-full overflow-hidden bg-olive/20 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, hide it (fallback will show)
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-olive font-bold text-2xl">
                      {userInitial}
                    </span>
                  )}
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

          {/* Privacy & Sharing */}
          <section className="section-botanical">
            <h2 className="text-xl font-serif font-bold text-forest mb-6">Privacy & Sharing</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-mist/30 rounded-xl border border-mist">
                <div className="flex items-center gap-3">
                  {preferences?.public_bar_enabled ? (
                    <GlobeAltIcon className="w-6 h-6 text-olive" />
                  ) : (
                    <LockClosedIcon className="w-6 h-6 text-sage" />
                  )}
                  <div>
                    <h3 className="font-semibold text-forest">Public Bar Profile</h3>
                    <p className="text-sm text-sage">
                      {preferences?.public_bar_enabled
                        ? "Your bar is visible to anyone with the link"
                        : "Your bar is private and only visible to you. Enable to share what cocktails you can make!"
                      }
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences?.public_bar_enabled || false}
                    onChange={(e) => handleTogglePublicBar(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-stone/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                </label>
              </div>
              {preferences?.public_bar_enabled && shareableBarUrl && (
                <div className="p-4 bg-olive/10 border border-olive/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-olive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-forest mb-1">Your bar is now public!</h4>
                      <p className="text-sm text-sage mb-3">
                        Share your bar profile with friends using this link:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-cream text-forest text-sm rounded-lg border border-mist font-mono">
                          {typeof window !== 'undefined' ? `${window.location.origin}/bar/${shareableBarUrl}` : `/bar/${shareableBarUrl}`}
                        </code>
                        <button
                          onClick={() => {
                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/bar/${shareableBarUrl}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Link copied to clipboard!');
                          }}
                          className="px-3 py-2 bg-terracotta hover:bg-terracotta-dark text-cream text-sm rounded-lg transition-colors font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {preferences?.public_bar_enabled && !shareableBarUrl && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-forest mb-1">Username Required</h4>
                      <p className="text-sm text-sage mb-3">
                        You need to set a username to make your bar fully public. Click the toggle again to set one.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Username Input Modal */}
              {showUsernameInput && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-cream rounded-2xl p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <GlobeAltIcon className="w-6 h-6 text-olive" />
                      <h3 className="text-lg font-serif font-bold text-forest">Set Your Username</h3>
                    </div>
                    <p className="text-sage text-sm mb-4">
                      To make your bar public, you need a unique username for your profile URL.
                    </p>
                    <form onSubmit={handleUsernameSubmit}>
                      <div className="mb-4">
                        <label htmlFor="username" className="label-botanical block mb-2">
                          Username
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={usernameInput}
                          onChange={(e) => {
                            setUsernameInput(e.target.value);
                            setUsernameError(null);
                          }}
                          className="input-botanical w-full"
                          placeholder="Enter your username"
                          disabled={isCheckingUsername}
                        />
                        <p className="text-xs text-sage mt-1">
                          Your public URL will be: /bar/{usernameInput || 'username'}
                        </p>
                        {usernameError && (
                          <p className="text-xs text-terracotta mt-1">{usernameError}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowUsernameInput(false)}
                          className="flex-1 px-4 py-2 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                          disabled={isCheckingUsername}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium disabled:opacity-50"
                          disabled={isCheckingUsername || !usernameInput.trim()}
                        >
                          {isCheckingUsername ? 'Checking...' : 'Enable Public Bar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
              {ingredientIds.length > 0 && user?.id && (
                <Link
                  href={`/bar/${user.id}`}
                  className="flex items-center justify-between p-4 bg-mist/50 hover:bg-mist rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ShareIcon className="w-5 h-5 text-sage group-hover:text-forest" />
                    <span className="text-forest">Share My Bar</span>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-sage group-hover:text-forest" />
                </Link>
              )}
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
