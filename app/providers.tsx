"use client";

import { useState, Suspense, useEffect } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { ToastProvider } from "@/components/ui/toast";

/**
 * UserProviderWrapper
 * 
 * Wraps UserProvider in Suspense because it may use client-side hooks
 * that need a Suspense boundary in the App Router.
 */
function UserProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <UserProvider>{children}</UserProvider>
    </Suspense>
  );
}

/**
 * SupabaseProvider
 * 
 * Wraps the application with Supabase session context and auth providers.
 * 
 * Architecture:
 * 1. SessionContextProvider provides the shared Supabase client
 * 2. UserProvider manages auth state using that client
 * 3. AuthDialogProvider handles login/signup modal state
 * 4. ToastProvider provides toast notifications
 * 
 * The initialSession parameter is deprecated - we now rely entirely on
 * client-side session fetching via getSession() and onAuthStateChange.
 * This is more reliable and avoids server/client hydration mismatches.
 */
export function SupabaseProvider({
  children,
  initialSession: _initialSession  // Deprecated, kept for backwards compatibility
}: {
  children: React.ReactNode;
  initialSession: null;  // Always null - we don't use server-side sessions
}) {
  // Create Supabase client and fetch initial session
  const [supabase, setSupabase] = useState<any>(null);
  const [initialSession, setInitialSession] = useState<any>(null);

  useEffect(() => {
    async function initializeSupabase() {
      try {
        const client = createClientComponentClient();
        console.log("[SupabaseProvider] Supabase client created successfully");
        
        // Try to get the current session from cookies
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          console.log("[SupabaseProvider] Found existing session from cookies:", session.user?.email);
          setInitialSession(session);
        } else {
          console.log("[SupabaseProvider] No existing session found in cookies");
        }
        
        setSupabase(client);
      } catch (error) {
        console.error("[SupabaseProvider] Failed to initialize Supabase:", error);
        // Create client anyway even if session fetch failed
        try {
          const client = createClientComponentClient();
          setSupabase(client);
        } catch (clientError) {
          console.error("[SupabaseProvider] Failed to create Supabase client:", clientError);
          throw clientError;
        }
      }
    }

    initializeSupabase();
  }, []);

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <UserProviderWrapper>
        <AuthDialogProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthDialogProvider>
      </UserProviderWrapper>
    </SessionContextProvider>
  );
}
