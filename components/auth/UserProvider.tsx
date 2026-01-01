"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useSessionContext } from "@supabase/auth-helpers-react";
import type { Profile } from "@/lib/supabase/database.types";
import { trackUserSignup } from "@/lib/analytics";

/**
 * UserProvider - Single Source of Truth for Auth State
 * 
 * This provider is the ONLY place that manages authentication state.
 * All components should use useUser() to access user data.
 * 
 * Architecture:
 * 1. Uses the shared Supabase client from SessionContextProvider
 * 2. Subscribes to onAuthStateChange for real-time auth updates
 * 3. Fetches profile data from the profiles table
 * 4. Provides loading, authenticated, and error states
 * 5. Provides authReady promise that resolves when initial auth check is complete
 *    This allows pages like /auth/callback to wait for auth to be ready before redirecting
 */

// Helper to create a deferred promise (promise + resolve/reject exposed)
interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Types for the user context
interface UserContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  authReady: Promise<void>;  // Resolves when initial auth check is complete
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  // Get the shared Supabase client from SessionContextProvider
  const { supabaseClient: supabase, isLoading: sessionContextLoading } = useSessionContext();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Deferred promise that resolves when initial auth check is complete
  // This allows pages like /auth/callback to wait for auth to be ready before redirecting
  const authReadyRef = useRef(createDeferred<void>());
  
  // Ref to track if we've done the initial auth check
  const initialCheckDone = useRef(false);
  // Ref to prevent duplicate profile fetches
  const fetchingProfile = useRef<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Prevent duplicate fetches for the same user
    if (fetchingProfile.current === userId) {
      return null;
    }
    fetchingProfile.current = userId;
    
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (fetchError) {
        // PGRST116 means no rows found - expected for new users
        if (fetchError.code !== "PGRST116") {
          console.error("[UserProvider] Profile fetch error:", fetchError);
        }
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error("[UserProvider] Profile fetch exception:", err);
      return null;
    } finally {
      fetchingProfile.current = null;
    }
  }, [supabase]);

  // Ensure profile exists by creating one if fetch returns null
  // This handles race conditions on slow networks where profile INSERT hasn't completed yet
  const ensureProfileExists = useCallback(async (userId: string, userEmail: string): Promise<Profile | null> => {
    try {
      // First try to fetch
      const profile = await fetchProfile(userId);
      
      if (profile) {
        console.log("[UserProvider] Profile fetch successful");
        return profile;
      }
      
      // If fetch returns null, try to create it
      // This handles the race condition where auth.users was created but profile INSERT hasn't completed
      console.log("[UserProvider] Profile not found, attempting to create...");
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          display_name: userEmail.split("@")[0],
        })
        .select()
        .single();
      
      if (error) {
        // If it's a duplicate key error (23505), profile exists but we couldn't fetch it - try again
        if (error.code === "23505") {
          console.log("[UserProvider] Profile already exists (duplicate error), retrying fetch...");
          return await fetchProfile(userId);
        }
        console.error("[UserProvider] Failed to create profile:", error);
        return null;
      }
      
      console.log("[UserProvider] Successfully created new profile");
      return data as Profile;
    } catch (err) {
      console.error("[UserProvider] Exception in ensureProfileExists:", err);
      return null;
    }
  }, [supabase, fetchProfile]);

  // Refresh profile data (can be called after profile updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await ensureProfileExists(user.id, user.email || "");
      setProfile(newProfile);
    }
  }, [user, ensureProfileExists]);

  // Main auth state initialization and subscription
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let authCheckDone = false;

    // Function to update auth state
    const updateAuthState = async (newSession: Session | null) => {
      if (!mounted) return;

      console.log("[UserProvider] Updating auth state:", {
        hasSession: !!newSession,
        hasUser: !!newSession?.user,
        userId: newSession?.user?.id,
        userEmail: newSession?.user?.email
      });

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Ensure profile exists (fetch or create if missing due to race condition)
        console.log("[UserProvider] Ensuring profile exists for user:", newSession.user.id);
        try {
          const userProfile = await ensureProfileExists(newSession.user.id, newSession.user.email || "");
          if (mounted) {
            console.log("[UserProvider] Profile ensured:", !!userProfile);
            setProfile(userProfile);

            // Track new signups (users created in last minute)
            if (userProfile) {
              const createdAt = new Date(userProfile.created_at);
              const now = new Date();
              const isNewUser = (now.getTime() - createdAt.getTime()) < 60000;
              if (isNewUser && !initialCheckDone.current) {
                trackUserSignup(newSession.user.id, newSession.user.email);
              }
            }
          }
        } catch (err) {
          // Profile ensure failed - but don't block on it
          console.error("[UserProvider] Profile ensure failed:", err);
          if (mounted) {
            // Still set user as authenticated even if profile ensure fails
            setProfile(null);
          }
        }
      } else {
        if (mounted) {
          console.log("[UserProvider] No user session, clearing profile");
          setProfile(null);
        }
      }

      if (mounted) {
        console.log("[UserProvider] Setting loading to false");
        setIsLoading(false);
        
        // Mark initial check as done and resolve the authReady promise
        // This signals to waiting code (like /auth/callback) that auth state is ready
        if (!initialCheckDone.current) {
          initialCheckDone.current = true;
          authCheckDone = true;
          authReadyRef.current.resolve();
          console.log("[UserProvider] Auth initialization complete, authReady promise resolved");
        }
      }
    };

    // Initial session check - non-blocking
    const initializeAuth = async () => {
      try {
        console.log("[UserProvider] Initializing auth - getting session...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[UserProvider] Initial session error:", sessionError);
          setError(sessionError);
          if (mounted) {
            setIsLoading(false);
          }
          authCheckDone = true;
          return;
        }

        console.log("[UserProvider] Initial session result:", {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          sessionExpiry: currentSession?.expires_at
        });

        // If we got a session immediately, use it
        if (currentSession?.user && mounted) {
          console.log("[UserProvider] Session found from getSession");
          await updateAuthState(currentSession);
        }
        // Otherwise, we'll wait for SIGNED_IN or INITIAL_SESSION from subscription
      } catch (err) {
        console.error("[UserProvider] Initialize auth error:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Auth initialization failed"));
          setIsLoading(false);
        }
        authCheckDone = true;
      }
    };

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[UserProvider] Auth state change:", event, newSession?.user?.email ?? "no user");

        // Handle different auth events
        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            console.log("[UserProvider] User signed in or token refreshed");
            await updateAuthState(newSession);
            break;

          case "SIGNED_OUT":
            if (mounted) {
              console.log("[UserProvider] User signed out");
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsLoading(false);
              initialCheckDone.current = false;
              authCheckDone = false;
            }
            break;

          case "INITIAL_SESSION":
            // This fires when the subscription is set up and detects a session
            // Could be from cookies, localStorage, or the Supabase client state
            console.log("[UserProvider] INITIAL_SESSION detected:", !!newSession?.user);
            if (!authCheckDone) {
              await updateAuthState(newSession);
            }
            break;

          case "USER_UPDATED":
            // User data was updated, refresh profile
            if (newSession?.user && mounted) {
              setUser(newSession.user);
              const userProfile = await ensureProfileExists(newSession.user.id, newSession.user.email || "");
              if (mounted) {
                setProfile(userProfile);
              }
            }
            break;

          case "PASSWORD_RECOVERY":
            // Handle password recovery if needed
            break;
        }
      }
    );

    // Set a SHORT timeout as a safety net - if still loading after 3 seconds, force it off
    // This handles edge cases where subscription doesn't fire for some reason
    // In normal conditions, this should not be needed - should load in < 500ms
    timeoutId = setTimeout(() => {
      if (mounted && !authCheckDone) {
        console.warn("[UserProvider] Auth initialization timeout (3s) - forcing completion anyway");
        setIsLoading(false);
        authCheckDone = true;
        initialCheckDone.current = true;
        // Also resolve authReady so waiting code (like /auth/callback) doesn't hang
        authReadyRef.current.resolve();
        console.log("[UserProvider] Auth timeout - authReady promise resolved");
      }
    }, 3000); // 3 second safety timeout

    // Run initial auth check - this calls getSession() which triggers the subscription
    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, ensureProfileExists]);

  // Get the correct redirect URL for auth
  const getAuthRedirectUrl = useCallback(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      return `${siteUrl}/auth/callback`;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/callback`;
    }
    return "/auth/callback";
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = getAuthRedirectUrl();
    console.log("[UserProvider] Starting Google OAuth, redirect:", redirectUrl);
    
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    if (signInError) {
      console.error("[UserProvider] Google sign-in error:", signInError);
      setError(signInError);
      throw signInError;
    }
  }, [supabase, getAuthRedirectUrl]);

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const redirectUrl = getAuthRedirectUrl();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (signUpError) {
      console.error("[UserProvider] Email sign-up error:", signUpError);
      return { error: signUpError.message };
    }

    return {};
  }, [supabase, getAuthRedirectUrl]);

  // Sign in with email (magic link) - kept for backwards compatibility
  const signInWithEmail = useCallback(async (email: string): Promise<{ error?: string }> => {
    const redirectUrl = getAuthRedirectUrl();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (signInError) {
      console.error("[UserProvider] Email sign-in error:", signInError);
      return { error: signInError.message };
    }

    return {};
  }, [supabase, getAuthRedirectUrl]);

  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("[UserProvider] Password sign-in error:", signInError);
      
      // Provide user-friendly error messages
      if (signInError.message?.includes("Invalid login credentials")) {
        return { error: "Invalid email or password. If you just signed up, make sure you clicked the confirmation link in your email first." };
      }
      if (signInError.message?.includes("Email not confirmed")) {
        return { error: "Please check your email and click the confirmation link before logging in." };
      }
      
      return { error: signInError.message };
    }

    return {};
  }, [supabase]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await fetch("/api/auth/send-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("[UserProvider] Password reset API error:", data);
        return { error: "Failed to send password reset email. Please try again." };
      }

      return {};
    } catch (error) {
      console.error("[UserProvider] Password reset request failed:", error);
      return { error: "Failed to send password reset email. Please try again." };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    console.log("[UserProvider] Signing out");
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("[UserProvider] Sign-out error:", signOutError);
      setError(signOutError);
      throw signOutError;
    }

    // Clear state immediately
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [supabase]);

  const value: UserContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    error,
    authReady: authReadyRef.current.promise,
    signInWithGoogle,
    signInWithEmail,
    signInWithPassword,
    signUpWithEmail,
    resetPassword,
    signOut,
    refreshProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Alias for consistency with the task requirements
export const useCurrentUser = useUser;
