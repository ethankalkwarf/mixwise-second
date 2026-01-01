"use client";

import { Suspense } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { ToastProvider } from "@/components/ui/toast";

/**
 * CRITICAL: Create Supabase client at module level (outside React)
 * This ensures ALL code in the app uses THE SAME client instance.
 * 
 * Why this matters:
 * - When user logs in via OAuth, /auth/callback exchanges code and sets cookies on this client
 * - When page redirects to /mix, React mounts fresh, but we use the SAME client instance
 * - The client already has the session cookies and auth state set
 * - No race conditions, no re-initialization issues
 */
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient();
    console.log("[SupabaseProvider] Module-level Supabase client created");
  }
  return supabaseClient;
}

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
  // Get the singleton client that was created at module level
  const supabase = getSupabaseClient();

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
