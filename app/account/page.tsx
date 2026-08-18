"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { MainContainer } from "@/components/layout/MainContainer";
import { useUser } from "@/components/auth/UserProvider";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import Image from "next/image";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { BADGE_LIST, RARITY_COLORS, BadgeDefinition } from "@/lib/badges";
import { TrophyIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  TrashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { debugLog } from "@/lib/debugLog";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { NativeAccountExtras } from "@/components/mobile/NativeAccountExtras";

export const dynamic = "force-dynamic";

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
  const { user, profile, isLoading, isAuthenticated, signOut, refreshProfile } = useUser();
  const supabase = getSupabaseClient();
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  const { recentlyViewed, clearHistory } = useRecentlyViewed();
  const { ingredientIds } = useBarIngredients();
  const { preferences, updatePreferences } = useUserPreferences();
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
  const [profileSaving, setProfileSaving] = useState(false);
  
  // Email preferences state — single marketing subscription toggle
  const [emailSubscribed, setEmailSubscribed] = useState(true);
  const [emailPrefsLoading, setEmailPrefsLoading] = useState(true);
  const [emailPrefsSaving, setEmailPrefsSaving] = useState(false);
  
  // Fetch ingredient names from Sanity for fallback lookup
  const [ingredientNames, setIngredientNames] = useState<Map<string, string>>(new Map());
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  
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
  }, [profile?.display_name, profile?.first_name, profile?.last_name]);

  // Fetch email preferences
  useEffect(() => {
    async function fetchEmailPrefs() {
      if (!user) return;
      
      try {
        const response = await fetch("/api/email-preferences");
        if (response.ok) {
          const data = await response.json();
          setEmailSubscribed(data.preferences?.email_subscribed ?? true);
        }
      } catch (err) {
        console.error("Failed to fetch email preferences:", err);
      } finally {
        setEmailPrefsLoading(false);
      }
    }

    fetchEmailPrefs();
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
    let updateSucceeded = false;

    const profileUpdate = {
      display_name: trimmedDisplayName || null,
      first_name: trimmedFirstName || null,
      last_name: trimmedLastName || null,
    };

    if (supabase) {
      try {
        debugLog("Attempting direct Supabase profile update:", { userId: user.id, ...profileUpdate });
        
        const { data, error } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id)
          .select("display_name, first_name, last_name")
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
      const response = await fetch('/api/profile/display-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: trimmedDisplayName || '',
          first_name: trimmedFirstName || '',
          last_name: trimmedLastName || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error("API route error:", errorData);
        toast.error(errorData.error || "Failed to update profile");
        setProfileSaving(false);
        return;
      }

      const data = await response.json();
      
      if (data?.success || data?.display_name !== undefined) {
        debugLog("✅ API route profile update succeeded:", data);
        updateSucceeded = true;
        
        try {
          const cacheKey = `mixwise_profile_${user.id}`;
          localStorage.removeItem(cacheKey);
        } catch (cacheErr) {
          console.warn("Failed to clear cache:", cacheErr);
        }
        
        setDisplayNameInput(data?.display_name || '');
        setFirstNameInput(data?.first_name || '');
        setLastNameInput(data?.last_name || '');
        toast.success("Profile updated");
        
        refreshProfile().catch(err => {
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
  }, [user, displayNameInput, firstNameInput, lastNameInput, supabase, toast, refreshProfile]);

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
                    <label htmlFor="firstName" className="label-botanical">First Name</label>
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
                    <label htmlFor="lastName" className="label-botanical">Last Name</label>
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
                  <div className="sm:col-span-2">
                    <label htmlFor="displayName" className="label-botanical">Display Name</label>
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
                  <div className="sm:col-span-2 flex items-end">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={profileSaving}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-forest mb-1">Your bar is now public!</h4>
                      <p className="text-sm text-sage mb-3">
                        Share your bar profile with friends using this link:
                      </p>
                      <div className="flex items-center gap-2 mb-3">
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
                      {/* Show suggestion if using public_slug but have display name */}
                      {!profile?.username && profile?.public_slug && profile?.display_name && (
                        <div className="mt-3 pt-3 border-t border-olive/20">
                          <p className="text-sm text-sage mb-2">
                            💡 <strong>Tip:</strong> Set a username from your display name to get a cleaner URL like <code className="text-xs bg-cream px-1.5 py-0.5 rounded">/bar/{generateDefaultUsername() || 'username'}</code>
                          </p>
                          <button
                            onClick={async () => {
                              const suggestedUsername = generateDefaultUsername();
                              if (!suggestedUsername) {
                                toast.error('Unable to generate username from display name');
                                return;
                              }
                              
                              debugLog('🔵 [CLIENT] Setting username from display name:', {
                                suggestedUsername,
                                currentUsername: profile?.username,
                                currentPublicSlug: profile?.public_slug,
                                userId: user?.id,
                                profileData: profile
                              });
                              
                              // First, check if user already has this username (case-insensitive)
                              if (profile?.username?.toLowerCase() === suggestedUsername.toLowerCase()) {
                                debugLog('✅ [CLIENT] User already has this username, refreshing profile');
                                toast.success('You already have this username!');
                                await refreshProfile();
                                return;
                              }
                              
                              // Skip the availability check and just try to set it directly
                              // The API will handle uniqueness checking and return appropriate errors
                              setIsCheckingUsername(true);
                              try {
                                debugLog('🔵 [CLIENT] Calling updateUsername API...');
                                // Try to set the username directly - API will check uniqueness
                                const result = await updateUsername(suggestedUsername);
                                
                                debugLog('🔵 [CLIENT] API response:', result);
                                
                                if (result.success) {
                                  debugLog('✅ [CLIENT] Username set successfully:', suggestedUsername);
                                  toast.success('Username set! Your bar URL has been updated.');
                                  // Refresh profile to get updated username
                                  await refreshProfile();
                                } else {
                                  console.error('❌ [CLIENT] Failed to set username:', result.error);
                                  
                                  // If it says "already taken", check if it's actually the user's own username
                                  if (result.error?.includes('taken') || result.error?.includes('already')) {
                                    debugLog('🔵 [CLIENT] Username appears taken, checking if user already has it...');
                                    // Try to fetch current profile to see if user already has it
                                    try {
                                      if (!user?.id) return;
                                      const { data: currentProfile, error: fetchError } = await supabase
                                        .from('profiles')
                                        .select('username')
                                        .eq('id', user.id)
                                        .single();
                                      
                                      debugLog('🔵 [CLIENT] Fetched current profile:', {
                                        username: currentProfile?.username,
                                        fetchError,
                                        suggestedUsername,
                                        match: currentProfile?.username?.toLowerCase() === suggestedUsername.toLowerCase()
                                      });
                                      
                                      if (currentProfile?.username?.toLowerCase() === suggestedUsername.toLowerCase()) {
                                        // User already has this username - just refresh
                                        debugLog('✅ [CLIENT] User already has this username, refreshing profile');
                                        toast.success('You already have this username!');
                                        await refreshProfile();
                                        setIsCheckingUsername(false);
                                        return;
                                      }
                                    } catch (fetchErr) {
                                      console.error('❌ [CLIENT] Error fetching current profile:', fetchErr);
                                    }
                                    
                                    // It's actually taken by someone else
                                    console.error('❌ [CLIENT] Username is taken by another user');
                                    toast.error('This username is already taken. Please choose a different one.');
                                    setUsernameInput(suggestedUsername);
                                    setShowUsernameInput(true);
                                  } else {
                                    toast.error(result.error || 'Failed to set username');
                                  }
                                }
                              } catch (err) {
                                console.error('❌ [CLIENT] Error setting username:', err);
                                toast.error('An error occurred. Please try again.');
                              } finally {
                                setIsCheckingUsername(false);
                              }
                            }}
                            disabled={isCheckingUsername}
                            className="text-sm px-3 py-1.5 bg-olive/20 hover:bg-olive/30 text-forest rounded-lg transition-colors font-medium disabled:opacity-50"
                          >
                            {isCheckingUsername ? 'Setting...' : `Set username: ${generateDefaultUsername() || 'username'}`}
                          </button>
                        </div>
                      )}
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

          {/* Email Preferences */}
          <NativeAccountExtras />

          <section className="section-botanical">
            <div className="flex items-center gap-3 mb-6">
              <EnvelopeIcon className="w-6 h-6 text-olive" />
              <h2 className="text-xl font-serif font-bold text-forest">Email Preferences</h2>
            </div>
            <p className="text-sage text-sm mb-6">
              Choose which emails you'd like to receive from MixWise.
            </p>
            
            {emailPrefsLoading ? (
              <div className="space-y-4">
                <div className="h-16 bg-mist/50 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-mist/30 rounded-xl border border-mist">
                  <div>
                    <h3 className="font-semibold text-forest">MixWise emails</h3>
                    <p className="text-sm text-sage">
                      Welcome tips, weekly cocktail inspiration, and other updates from us
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailSubscribed}
                      onChange={(e) => updateEmailPref(e.target.checked)}
                      disabled={emailPrefsSaving}
                    />
                    <div className="w-11 h-6 bg-stone/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terracotta/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            )}
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
                  Keep mixing to earn your first badge.
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
              {ingredientIds.length > 0 && (
                <ShareBarButton
                  variant="menu"
                  className="flex items-center justify-between p-4 bg-mist/50 hover:bg-mist rounded-xl transition-colors w-full text-left group text-forest"
                />
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
