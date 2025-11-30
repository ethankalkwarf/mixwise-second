"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [profileLoading, setProfileLoading] = useState(false);
  
  const supabase = supabaseClient;

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  }, [supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Sync with context session changes
  useEffect(() => {
    setSession(contextSession);
    setUser(contextSession?.user ?? null);
    
    // Only set loading false once session context has loaded
    if (!sessionLoading) {
      // Fetch profile if user exists
      if (contextSession?.user && !profile && !profileLoading) {
        setProfileLoading(true);
        fetchProfile(contextSession.user.id).then((userProfile) => {
          setProfile(userProfile);
          setProfileLoading(false);
          setIsLoading(false);
        });
      } else if (!contextSession?.user) {
        setProfile(null);
        setIsLoading(false);
      } else if (profile) {
        setIsLoading(false);
      }
    }
  }, [contextSession, sessionLoading, fetchProfile, profile, profileLoading]);

  // Listen for auth changes (login/logout events)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Let context update first, but handle immediate profile fetch for new sign-ins
        if (event === "SIGNED_IN" && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
          
          // Track new signups
          if (userProfile) {
            const createdAt = new Date(userProfile.created_at);
            const now = new Date();
            const isNewUser = (now.getTime() - createdAt.getTime()) < 60000; // Within 1 minute
            
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
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

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

