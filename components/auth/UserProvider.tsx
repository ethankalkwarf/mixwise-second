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
 */

// Types for the user context
interface UserContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
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

  // Refresh profile data (can be called after profile updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Main auth state initialization and subscription
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // Always clear any existing timeout when this effect runs
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // If session context is still loading, set up a timeout
    if (sessionContextLoading) {
      console.log("[UserProvider] Session context still loading...");

      // Add a timeout to prevent infinite loading state
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn("[UserProvider] Session context loading timeout - proceeding anyway");
          setIsLoading(false);
          setError(new Error("Session context loading timeout"));
        }
      }, 10000); // 10 second timeout

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    // Session context is ready - proceed with auth initialization
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
        // Fetch profile for authenticated user
        console.log("[UserProvider] Fetching profile for user:", newSession.user.id);
        const userProfile = await fetchProfile(newSession.user.id);
        if (mounted) {
          console.log("[UserProvider] Profile fetched:", !!userProfile);
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
      } else {
        if (mounted) {
          console.log("[UserProvider] No user session, clearing profile");
          setProfile(null);
        }
      }

      if (mounted) {
        console.log("[UserProvider] Setting loading to false");
        setIsLoading(false);
        initialCheckDone.current = true;
      }
    };

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log("[UserProvider] Initializing auth - getting session...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[UserProvider] Initial session error:", sessionError);
          setError(sessionError);
          setIsLoading(false);
          return;
        }

        console.log("[UserProvider] Initial session result:", {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          sessionExpiry: currentSession?.expires_at
        });

        await updateAuthState(currentSession);
      } catch (err) {
        console.error("[UserProvider] Initialize auth error:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Auth initialization failed"));
          setIsLoading(false);
        }
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
            await updateAuthState(newSession);
            break;

          case "SIGNED_OUT":
            if (mounted) {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsLoading(false);
            }
            break;

          case "INITIAL_SESSION":
            // Only process if we haven't done the initial check yet
            if (!initialCheckDone.current) {
              await updateAuthState(newSession);
            }
            break;

          case "USER_UPDATED":
            // User data was updated, refresh profile
            if (newSession?.user && mounted) {
              setUser(newSession.user);
              const userProfile = await fetchProfile(newSession.user.id);
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

    // Run initial auth check
    initializeAuth();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, sessionContextLoading, fetchProfile]);

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

  // Sign in with email (magic link)
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
    signInWithGoogle,
    signInWithEmail,
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
