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
// Create Supabase client at module level to ensure it reads cookies correctly
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient();
      console.log("[SupabaseProvider] Client created successfully");
    } catch (error) {
      console.error("[SupabaseProvider] Failed to create Supabase client:", error);
      throw error;
    }
  }
  return supabaseClient;
}

export function SupabaseProvider({
  children,
  initialSession: _initialSession  // Deprecated, kept for backwards compatibility
}: {
  children: React.ReactNode;
  initialSession: null;  // Always null - we don't use server-side sessions
}) {
  // Get the client (created at module level to read cookies on first load)
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
