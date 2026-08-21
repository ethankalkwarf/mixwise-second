"use client";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { BADGE_LIST } from "@/lib/badges";
import { useUserBadges } from "@/hooks/useUserBadges";
import { AppLink } from "@/components/mobile/AppLink";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  TrashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EnvelopeIcon,
  TrophyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { debugLog } from "@/lib/debugLog";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { AvatarUploader } from "@/components/account/AvatarUploader";
import { getMixologistTier } from "@/lib/mixologistTiers";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLayoutTier } from "@/hooks/useLayoutTier";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const router = useRouter();
  const nativeShell = useNativeShell();
  const layoutTier = useLayoutTier();
  const { user, profile, isLoading, isAuthenticated, signOut, refreshProfile } = useUser();
  const supabase = getSupabaseClient();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { recentlyViewed, clearHistory } = useRecentlyViewed();
  const { ingredientIds } = useBarIngredients();
  const { preferences, updatePreferences } = useUserPreferences();
  const { earnedIds, isLoading: badgesLoading } = useUserBadges();
  const toast = useToast();

  // Ensure public_slug exists if public bar is enabled but no username/slug
  useEffect(() => {
    const ensurePublicSlug = async () => {
      if (preferences?.public_bar_enabled && user && !profile?.username && !profile?.public_slug) {
        debugLog("User has public bar enabled but no username/slug, this should not happen with proper migrations");
        // Note: This logic is now handled by the database trigger on profile creation
        // If we reach here, it means the migrations haven't been applied yet
        console.warn("Public bar enabled but no username/slug - migrations may not be applied");
      }
    };

    ensurePublicSlug();
  }, [preferences?.public_bar_enabled, user, profile?.username, profile?.public_slug]);

  // Get the shareable bar URL (username or public_slug)
  // Using explicit null coalescence to ensure type safety
  const shareableBarUrl: string | null = profile?.username || profile?.public_slug || null;

  // Username management for public profiles
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  // Profile name state
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  
  // Email preferences state — single marketing subscription toggle
  const [emailSubscribed, setEmailSubscribed] = useState(true);
  const [emailPrefsLoading, setEmailPrefsLoading] = useState(true);
  const [emailPrefsSaving, setEmailPrefsSaving] = useState(false);
  const [emailPrefsError, setEmailPrefsError] = useState<string | null>(null);

  // Fetch ingredient names from Sanity for fallback lookup
  const [ingredientNames, setIngredientNames] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    supabase
      .from("ingredients")
      .select("id, name")
      .then(({ data, error }) => {
        if (error || !data) return;
        const nameMap = new Map<string, string>();
        data.forEach((ing: { id: string | number; name: string | null }) => {
          if (ing.name) nameMap.set(String(ing.id), ing.name);
        });
        setIngredientNames(nameMap);
      });
  }, [supabase]);

  // Initialize profile name inputs when profile loads
  useEffect(() => {
    if (profile?.display_name !== undefined) {
      setDisplayNameInput(profile.display_name || '');
    }
    if (profile?.first_name !== undefined) {
      setFirstNameInput(profile.first_name || '');
    }
    if (profile?.last_name !== undefined) {
      setLastNameInput(profile.last_name || '');
    }
    if (profile?.bio !== undefined) {
      setBioInput(profile.bio || '');
    }
  }, [profile?.display_name, profile?.first_name, profile?.last_name, profile?.bio]);

  // Fetch email preferences
  useEffect(() => {
    async function fetchEmailPrefs() {
      if (!user) {
        setEmailPrefsLoading(false);
        return;
      }

      setEmailPrefsLoading(true);
      setEmailPrefsError(null);

      try {
        const response = await fetch("/api/email-preferences");
        if (response.ok) {
          const data = await response.json();
          setEmailSubscribed(data.preferences?.email_subscribed ?? true);
        } else {
          setEmailPrefsError("Couldn't load email preferences. You can try again below.");
        }
      } catch (err) {
        console.error("Failed to fetch email preferences:", err);
        setEmailPrefsError("Couldn't load email preferences. You can try again below.");
      } finally {
        setEmailPrefsLoading(false);
      }
    }

    void fetchEmailPrefs();
  }, [user]);

  // Update profile names - try direct client first, fallback to API route
  const handleUpdateProfile = useCallback(async () => {
    if (!user) {
      toast.error("You must be signed in to update your profile");
      return;
    }

    setProfileSaving(true);
    const trimmedDisplayName = displayNameInput.trim();
    const trimmedFirstName = firstNameInput.trim();
    const trimmedLastName = lastNameInput.trim();
    const trimmedBio = bioInput.trim();
    let updateSucceeded = false;

    const profileUpdate = {
      display_name: trimmedDisplayName || null,
      first_name: trimmedFirstName || null,
      last_name: trimmedLastName || null,
      bio: trimmedBio || null,
    };

    if (supabase) {
      try {
        debugLog("Attempting direct Supabase profile update:", { userId: user.id, ...profileUpdate });
        
        const { data, error } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id)
          .select("display_name, first_name, last_name, bio")
          .single();

        if (!error && data) {
          debugLog("✅ Direct profile update succeeded:", data);
          updateSucceeded = true;
          
          try {
            const cacheKey = `mixwise_profile_${user.id}`;
            localStorage.removeItem(cacheKey);
          } catch (cacheErr) {
            console.warn("Failed to clear cache:", cacheErr);
          }
          
          setDisplayNameInput(data.display_name || '');
          setFirstNameInput(data.first_name || '');
          setLastNameInput(data.last_name || '');
          setBioInput(data.bio || '');
          toast.success("Profile updated");
          
          refreshProfile().catch(err => {
            console.warn("Profile refresh failed (non-critical, update succeeded):", err);
          });
          setProfileSaving(false);
          return;
        }

        if (error.message?.includes("Failed to fetch") || error.code === 'PGRST301') {
          debugLog("Direct update failed with network error, trying API route fallback");
        } else {
          console.error("Direct update error:", error);
          toast.error(error.message || "Failed to update profile");
          setProfileSaving(false);
          return;
        }
      } catch (err: any) {
        if (err?.message?.includes("Failed to fetch") || err?.name === "TypeError") {
          debugLog("Direct update exception, trying API route fallback:", err);
        } else {
          console.error("Direct update exception:", err);
          toast.error("Failed to update profile. Please try again.");
          setProfileSaving(false);
          return;
        }
      }
    }

    try {
      const [namesRes, bioRes] = await Promise.all([
        fetch("/api/profile/display-name", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: trimmedDisplayName || "",
            first_name: trimmedFirstName || "",
            last_name: trimmedLastName || "",
          }),
        }),
        fetch("/api/profile/bio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio: trimmedBio || null }),
        }),
      ]);

      const data = await namesRes.json().catch(() => ({}));
      const bioData = await bioRes.json().catch(() => ({}));

      if (!namesRes.ok || !bioRes.ok) {
        console.error("API route error:", data, bioData);
        toast.error(data.error || bioData.error || "Failed to update profile");
        setProfileSaving(false);
        return;
      }

      if (data?.success || data?.display_name !== undefined) {
        debugLog("✅ API route profile update succeeded:", data);
        updateSucceeded = true;

        try {
          const cacheKey = `mixwise_profile_${user.id}`;
          localStorage.removeItem(cacheKey);
        } catch (cacheErr) {
          console.warn("Failed to clear cache:", cacheErr);
        }

        setDisplayNameInput(data?.display_name || "");
        setFirstNameInput(data?.first_name || "");
        setLastNameInput(data?.last_name || "");
        setBioInput(bioData?.bio || "");
        toast.success("Profile updated");

        refreshProfile().catch((err) => {
          console.warn("Profile refresh failed (non-critical):", err);
        });
        setProfileSaving(false);
        return;
      }

      toast.error(data?.error || "Failed to update profile. Please try again.");
      setProfileSaving(false);
    } catch (err: any) {
      if (!updateSucceeded) {
        toast.error(err?.message || "Failed to update profile. Please try again.");
      }
      setProfileSaving(false);
    }
  }, [user, displayNameInput, firstNameInput, lastNameInput, bioInput, supabase, toast, refreshProfile]);

  // Update email preference
  const updateEmailPref = async (subscribed: boolean) => {
    setEmailPrefsSaving(true);
    setEmailSubscribed(subscribed);

    try {
      const response = await fetch("/api/email-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_subscribed: subscribed }),
      });

      if (response.ok) {
        toast.success("Email preferences updated");
      } else {
        setEmailSubscribed(!subscribed);
        toast.error("Failed to update preferences");
      }
    } catch {
      setEmailSubscribed(!subscribed);
      toast.error("Failed to update preferences");
    } finally {
      setEmailPrefsSaving(false);
    }
  };

  // Generate default username suggestion
  const generateDefaultUsername = useCallback(() => {
    // Defensive check for both profile and user
    if (!profile?.display_name && !profile?.email && !user?.email) return '';
    const displayName = profile?.display_name || profile?.email?.split('@')[0] || user?.email?.split('@')[0] || '';
    if (!displayName) return '';
    // Remove special chars and replace spaces with underscores
    return displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  }, [profile, user?.email]);

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
    debugLog('🔵 [CLIENT] updateUsername called with:', newUsername);
    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      debugLog('🔵 [CLIENT] API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ [CLIENT] API error response:', errorData);
        return { success: false, error: errorData.error || 'Failed to update username' };
      }

      const data = await response.json();
      debugLog('✅ [CLIENT] API success response:', data);
      return { success: true };
    } catch (err) {
      console.error('❌ [CLIENT] Error updating username:', err);
      return { success: false, error: 'Failed to update username' };
    }
  }, []);

  // Handle enabling public bar (with username check)
  const handleTogglePublicBar = useCallback(async (enabled: boolean) => {
    debugLog("Toggle public bar:", enabled, "Profile:", profile);

    if (enabled && !profile?.username && !profile?.public_slug) {
      // Need to set username first (will generate public_slug as fallback)
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
      // More specific error message
      const errorMsg = typeof result.error === 'string' 
        ? result.error 
        : "Failed to update privacy setting. Please try again.";
      toast.error(errorMsg);
    } else {
      debugLog("Successfully updated privacy setting");
      toast.success(enabled ? "Your bar is now public!" : "Your bar is now private");
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

      // Now enable public bar using upsert
      try {
        const { error: prefError } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: user!.id,
            public_bar_enabled: true,
          });

        if (prefError) {
          console.error('Failed to enable public bar:', prefError);
          // Try insert if upsert fails (might be a permission issue)
          const { error: insertError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: user!.id,
              public_bar_enabled: true,
            });

          if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
            console.error('Insert also failed:', insertError);
            setUsernameError('Username updated but failed to enable public bar');
            return;
          }
        }
      } catch (prefErr) {
        console.error('Exception enabling public bar:', prefErr);
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

  // Helper to get ingredient display name (from stored name, Sanity, or ID fallback)
  const getIngredientName = (ingredient: { id: string; name: string | null }) => {
    return ingredient.name || ingredientNames.get(ingredient.id) || ingredient.id;
  };

  // Redirect to home or show auth dialog if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthDialog({
        mode: "login",
        title: "Sign in to view your account",
        subtitle: "Log in to manage your bar, favorites, notes, and settings.",
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
              {preferredAuthMode === "login"
                ? "Log in to manage your bar, favorites, notes, and settings."
                : "Create a free account to save your bar, favorite cocktails, tasting notes, and more."}
            </p>
            <button
              onClick={() => openAuthDialog({ mode: preferredAuthMode })}
              className="btn-primary"
            >
              {preferredAuthMode === "login" ? "Log In" : "Create Free Account"}
            </button>
          </div>
        </MainContainer>
      </div>
    );
  }

  // Only show display name if profile data is loaded, otherwise show loading state
  const displayName = profile ? (profile.display_name || user?.email?.split("@")[0] || "User") : "Loading...";
  const avatarUrl = profile?.avatar_url;
  const email = user?.email;
  const mixologistTier = getMixologistTier([...earnedIds]);

  const cardClass = nativeShell
    ? "overflow-hidden rounded-[1.75rem] bg-white shadow-sm"
    : "overflow-hidden rounded-3xl border border-mist bg-white";

  const sectionTitleClass = nativeShell
    ? "font-display text-lg font-bold text-forest"
    : "font-serif text-lg font-bold text-forest";
  const rowTitleClass = "text-sm font-semibold text-forest";
  const rowDescClass = "mt-0.5 text-sm text-sage";
  const metaClass = "text-xs text-sage";

  const profileSection = (
    <section className={cardClass}>
      <div className="border-b border-mist/80 px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Profile</h2>
        <p className={rowDescClass}>How you appear on your public bar</p>
      </div>

      <div className="p-5 sm:p-6">
        <AvatarUploader
          avatarUrl={avatarUrl}
          displayName={displayName}
          onUploaded={async () => {
            await refreshProfile().catch(() => undefined);
          }}
          details={
            <>
              <p className="truncate text-lg font-semibold tracking-tight text-forest">
                {displayName}
              </p>
              {profile?.username ? (
                <p className="mt-0.5 truncate text-sm text-olive">@{profile.username}</p>
              ) : (
                <p className="mt-1 text-xs font-medium leading-snug text-terracotta">
                  Add a username so friends can find you
                </p>
              )}
              <div className={`mt-2 space-y-0.5 ${metaClass}`}>
                {email && <p className="truncate">{email}</p>}
                <p className="truncate">
                  <Link href="/badges" className="font-medium text-olive hover:text-olive-dark">
                    <span aria-hidden>{mixologistTier.emoji} </span>
                    {mixologistTier.name}
                  </Link>
                  {!badgesLoading && (
                    <> · {earnedIds.size} of {BADGE_LIST.length} badges</>
                  )}
                </p>
              </div>
            </>
          }
        />

        <div className="mt-6 space-y-4 border-t border-mist/80 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div>
              <label htmlFor="firstName" className="label-botanical mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
                className="input-botanical"
                placeholder="Optional"
                disabled={profileSaving}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label-botanical mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                className="input-botanical"
                placeholder="Optional"
                disabled={profileSaving}
              />
            </div>
          </div>
          <div>
            <label htmlFor="displayName" className="label-botanical mb-1.5">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="input-botanical"
              placeholder="How your name appears in the app"
              disabled={profileSaving}
            />
          </div>
          <div>
            <label htmlFor="bio" className="label-botanical mb-1.5">
              Public bio
            </label>
            <textarea
              id="bio"
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value.slice(0, 160))}
              className="input-botanical min-h-[88px] resize-y"
              placeholder="A short line about your bar — favorites, vibes, what you're mixing"
              maxLength={160}
              disabled={profileSaving}
            />
            <p className={`mt-1.5 ${metaClass}`}>
              {bioInput.length}/160 · Shown on your public bar
              {!preferences?.public_bar_enabled && " (enable Public Bar below)"}
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleUpdateProfile}
              disabled={profileSaving}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[10rem]"
            >
              {profileSaving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const friendsLink = (
    <section className={cardClass}>
      <Link
        href="/friends"
        className="native-menu-row flex w-full items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-mist/40 sm:px-6 group"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UsersIcon className="h-5 w-5 shrink-0 text-olive" />
          <div className="min-w-0">
            <p className={rowTitleClass}>Friends</p>
            <p className={rowDescClass}>Invite, follow, and activity</p>
          </div>
        </div>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-sage group-hover:text-forest" />
      </Link>
    </section>
  );

  const sharingSection = (
    <section className={cardClass}>
      <div className="border-b border-mist/80 px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Sharing &amp; email</h2>
        <p className={rowDescClass}>Who can see your bar, and what we send you</p>
      </div>

      <div className="divide-y divide-mist/80">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {preferences?.public_bar_enabled ? (
              <GlobeAltIcon className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
            ) : (
              <LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
            )}
            <div className="min-w-0">
              <p className={rowTitleClass}>Public bar profile</p>
              <p className={rowDescClass}>
                {preferences?.public_bar_enabled
                  ? "Visible to anyone with the link"
                  : "Private — only you can see your bar"}
              </p>
            </div>
          </div>
          <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={preferences?.public_bar_enabled || false}
              onChange={(e) => handleTogglePublicBar(e.target.checked)}
            />
            <div className="peer h-6 w-11 rounded-full bg-stone/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-terracotta peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/25"></div>
          </label>
        </div>

        {preferences?.public_bar_enabled && shareableBarUrl && (
          <div className="space-y-3 bg-olive/[0.04] px-5 py-4 sm:px-6">
            <p className="text-sm text-sage">Share your bar with this link:</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <code className="min-w-0 break-all rounded-xl border border-mist bg-cream px-3 py-2 font-mono text-sm text-forest">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/bar/${shareableBarUrl}`
                  : `/bar/${shareableBarUrl}`}
              </code>
              <button
                onClick={() => {
                  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/bar/${shareableBarUrl}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                }}
                className="native-compact-cta shrink-0 rounded-xl bg-terracotta px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark sm:self-center"
              >
                Copy
              </button>
            </div>
            {!profile?.username && profile?.public_slug && profile?.display_name && (
              <div className="space-y-3 border-t border-olive/15 pt-3">
                <p className="text-sm leading-relaxed text-sage">
                  <strong>Tip:</strong> Set a username from your display name for a cleaner link:
                </p>
                <code className="block min-w-0 break-all rounded-xl border border-mist bg-cream px-3 py-2 font-mono text-xs text-forest">
                  /bar/{generateDefaultUsername() || "username"}
                </code>
                <button
                  onClick={async () => {
                    const suggestedUsername = generateDefaultUsername();
                    if (!suggestedUsername) {
                      toast.error("Unable to generate username from display name");
                      return;
                    }

                    if (profile?.username?.toLowerCase() === suggestedUsername.toLowerCase()) {
                      toast.success("You already have this username!");
                      await refreshProfile();
                      return;
                    }

                    setIsCheckingUsername(true);
                    try {
                      const result = await updateUsername(suggestedUsername);
                      if (result.success) {
                        toast.success("Username set! Your bar URL has been updated.");
                        await refreshProfile();
                      } else if (result.error?.includes("taken") || result.error?.includes("already")) {
                        toast.error("This username is already taken. Please choose a different one.");
                        setUsernameInput(suggestedUsername);
                        setShowUsernameInput(true);
                      } else {
                        toast.error(result.error || "Failed to set username");
                      }
                    } catch (err) {
                      console.error("Error setting username:", err);
                      toast.error("An error occurred. Please try again.");
                    } finally {
                      setIsCheckingUsername(false);
                    }
                  }}
                  disabled={isCheckingUsername}
                  className="native-menu-row flex w-full items-center justify-center rounded-xl bg-olive/15 px-3 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-olive/25 disabled:opacity-50"
                >
                  {isCheckingUsername
                    ? "Setting..."
                    : `Set username: ${generateDefaultUsername() || "username"}`}
                </button>
              </div>
            )}
          </div>
        )}

        {preferences?.public_bar_enabled && !shareableBarUrl && (
          <div className="bg-amber-50/80 px-5 py-4 sm:px-6">
            <h4 className={rowTitleClass}>Username required</h4>
            <p className="mt-1 text-sm text-sage">
              You need to set a username to make your bar fully public. Toggle again to set one.
            </p>
          </div>
        )}

        <div className="px-5 py-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-sage" />
            <p className={rowTitleClass}>Email</p>
          </div>
          {emailPrefsLoading ? (
            <div className="h-12 animate-pulse rounded-xl bg-mist/50" />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-forest">MixWise emails</p>
                <p className={rowDescClass}>
                  {emailPrefsError
                    ? emailPrefsError
                    : "Welcome tips, weekly cocktail inspiration, and updates"}
                </p>
              </div>
              <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={emailSubscribed}
                  onChange={(e) => updateEmailPref(e.target.checked)}
                  disabled={emailPrefsSaving}
                />
                <div className="peer h-6 w-11 rounded-full bg-stone/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-terracotta peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/25 disabled:opacity-50"></div>
              </label>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const shortcutsSection = (
    <section className={cardClass}>
      <AppLink
        href="/badges"
        className="native-menu-row flex w-full items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-mist/40 sm:px-6 group"
      >
        <div className="flex min-w-0 items-center gap-3">
          <TrophyIcon className="h-5 w-5 shrink-0 text-olive" />
          <div className="min-w-0">
            <p className={rowTitleClass}>Badges</p>
            <p className={rowDescClass}>
              {badgesLoading
                ? "Loading progress…"
                : `${earnedIds.size} of ${BADGE_LIST.length} earned`}
            </p>
          </div>
        </div>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-sage group-hover:text-forest" />
      </AppLink>

      <button
        type="button"
        onClick={clearHistory}
        className="native-menu-row flex w-full items-center gap-3 border-t border-mist/80 px-5 py-4 text-left transition-colors hover:bg-mist/40 sm:px-6 group"
      >
        <TrashIcon className="h-5 w-5 shrink-0 text-sage group-hover:text-forest" />
        <span className={`min-w-0 flex-1 ${rowTitleClass}`}>Clear history</span>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-sage group-hover:text-forest" />
      </button>

      {ingredientIds.length > 0 && (
        <ShareBarButton
          variant="menu"
          className="native-menu-row flex w-full items-center gap-3 border-t border-mist/80 px-5 py-4 text-left text-sm font-semibold text-forest transition-colors hover:bg-mist/40 hover:text-terracotta disabled:opacity-50 sm:px-6"
        />
      )}

      <button
        type="button"
        onClick={handleSignOut}
        className="native-menu-row flex w-full items-center gap-3 border-t border-mist/80 px-5 py-4 text-left transition-colors hover:bg-mist/40 sm:px-6 group"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0 text-terracotta group-hover:text-terracotta-dark" />
        <span className="min-w-0 flex-1 text-sm font-semibold text-forest">Sign out</span>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-sage group-hover:text-forest" />
      </button>
    </section>
  );

  const usernameModal = showUsernameInput && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-6">
        <div className="mb-4 flex items-center gap-3">
          <GlobeAltIcon className="h-6 w-6 text-olive" />
          <h3 className="font-serif text-lg font-bold text-forest">Set Your Username</h3>
        </div>
        <p className="mb-4 text-sm text-sage">
          To make your bar public, you need a unique username for your profile URL.
        </p>
        <form onSubmit={handleUsernameSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="label-botanical mb-2 block">
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
            <p className="mt-1 text-xs text-sage">
              Your public URL will be: /bar/{usernameInput || "username"}
            </p>
            {usernameError && (
              <p className="mt-1 text-xs text-terracotta">{usernameError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowUsernameInput(false)}
              className="flex-1 rounded-xl bg-mist px-4 py-2 font-medium text-forest transition-colors hover:bg-stone"
              disabled={isCheckingUsername}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-terracotta px-4 py-2 font-medium text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-50"
              disabled={isCheckingUsername || !usernameInput.trim()}
            >
              {isCheckingUsername ? "Checking..." : "Enable Public Bar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (nativeShell) {
    return (
      <>
        <PullToRefreshContainer
          className="min-h-screen bg-gradient-to-b from-cream via-cream to-mist/30 pb-10"
          onRefresh={async () => {
            await refreshProfile().catch(() => undefined);
          }}
        >
          <div
            className="sticky top-0 z-10 border-b border-mist/60 bg-cream/95 backdrop-blur-md"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-sm"
                aria-label="Back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold text-forest">Account</h1>
                <p className="text-sm text-sage">Profile, sharing, and preferences</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 px-4 pt-4">
            {profileSection}
            {friendsLink}
            {sharingSection}
            {shortcutsSection}
          </div>
        </PullToRefreshContainer>
        {usernameModal}
      </>
    );
  }

  const phoneLayout = (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-bold text-forest">Account</h1>
        <p className="mt-1 text-sm text-sage">Profile, sharing, and preferences</p>
      </header>
      {profileSection}
      {friendsLink}
      {sharingSection}
      {shortcutsSection}
    </div>
  );

  const wideLayout = (
    <div className="mx-auto max-w-5xl lg:max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-forest lg:text-4xl">Account</h1>
        <p className="mt-1.5 text-sm text-sage">Profile, sharing, and preferences</p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] md:items-start lg:gap-8">
        <div className="md:sticky md:top-24 space-y-6">{profileSection}</div>
        <div className="space-y-6">
          {friendsLink}
          {sharingSection}
          {shortcutsSection}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-8 sm:py-10 lg:py-12">
      <MainContainer>
        {layoutTier === "phone" ? phoneLayout : wideLayout}
      </MainContainer>
      {usernameModal}
    </div>
  );
}
