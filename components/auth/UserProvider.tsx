"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useSessionContext } from "@supabase/auth-helpers-react";
import type { Profile } from "@/lib/supabase/database.types";
import { trackUserSignup } from "@/lib/analytics";

// Types for the user context
interface UserContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  // Use session from SessionContextProvider (which has the server-side initial session)
  const { session: contextSession, supabaseClient, isLoading: sessionLoading } = useSessionContext();
  
  const [user, setUser] = useState<User | null>(contextSession?.user ?? null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(contextSession);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if we've already processed the initial session to prevent duplicate fetches
  const initializedRef = useRef(false);
  const fetchingProfileRef = useRef(false);
  
  const supabase = supabaseClient;

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        // PGRST116 means no rows found - this is expected for new users
        if (error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error("Profile fetch exception:", err);
      return null;
    }
  }, [supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Sync with context session changes - this handles the initial load and OAuth redirects
  useEffect(() => {
    // Don't do anything while session is still loading
    if (sessionLoading) {
      return;
    }

    // Update session and user from context
    setSession(contextSession);
    setUser(contextSession?.user ?? null);

    // If there's no user, we're done loading
    if (!contextSession?.user) {
      setProfile(null);
      setIsLoading(false);
      initializedRef.current = true;
      return;
    }

    // If we have a user, fetch their profile (if not already fetching)
    if (!fetchingProfileRef.current) {
      fetchingProfileRef.current = true;
      
      fetchProfile(contextSession.user.id)
        .then((userProfile) => {
          setProfile(userProfile);
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
        })
        .finally(() => {
          fetchingProfileRef.current = false;
          setIsLoading(false);
          initializedRef.current = true;
        });
    }
  }, [contextSession, sessionLoading, fetchProfile]);

  // Listen for auth changes (login/logout events)
  // This handles client-side auth events like signInWithOAuth completing
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change:", event, newSession?.user?.email);
        
        if (event === "SIGNED_IN" && newSession?.user) {
          // Update state immediately
          setSession(newSession);
          setUser(newSession.user);
          setIsLoading(true);
          
          // Fetch profile
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
          
          // Track new signups
          if (userProfile) {
            const createdAt = new Date(userProfile.created_at);
            const now = new Date();
            const isNewUser = (now.getTime() - createdAt.getTime()) < 60000;
            
            if (isNewUser) {
              trackUserSignup(newSession.user.id, newSession.user.email);
            }
          }
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        } else if (event === "TOKEN_REFRESHED" && newSession?.user) {
          // Update session on token refresh
          setSession(newSession);
          setUser(newSession.user);
        } else if (event === "INITIAL_SESSION") {
          // Handle initial session - this fires when onAuthStateChange is first set up
          if (newSession?.user && !initializedRef.current) {
            setSession(newSession);
            setUser(newSession.user);
            
            const userProfile = await fetchProfile(newSession.user.id);
            setProfile(userProfile);
            setIsLoading(false);
            initializedRef.current = true;
          } else if (!newSession && !initializedRef.current) {
            // No session on initial load
            setIsLoading(false);
            initializedRef.current = true;
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Fallback: Force session check on mount to handle OAuth redirect edge cases
  // This runs once after mount to catch any missed session updates
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      // Wait a brief moment for other effects to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted) return;
      
      // If still loading after mount, do an explicit session check
      if (!initializedRef.current) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            
            const userProfile = await fetchProfile(currentSession.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          }
        } catch (err) {
          console.error("Session check error:", err);
        } finally {
          if (mounted) {
            setIsLoading(false);
            initializedRef.current = true;
          }
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
    };
  }, [supabase, fetchProfile]); // Include dependencies for proper cleanup

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Sign in with email (magic link)
  const signInWithEmail = async (email: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error("Email sign-in error:", error);
      return { error: error.message };
    }
    
    return {};
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value: UserContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
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

