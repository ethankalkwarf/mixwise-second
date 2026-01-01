"use client";

import { useState, Suspense } from "react";
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
  // Create Supabase client - useState with initializer ensures singleton pattern
  // The client reads cookies on creation, before React renders children
  const [supabase] = useState(() => {
    try {
      const client = createClientComponentClient();
      console.log("[SupabaseProvider] Supabase client created successfully");
      return client;
    } catch (error) {
      console.error("[SupabaseProvider] Failed to create Supabase client:", error);
      throw error;
    }
  });

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
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
