"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { ToastProvider } from "@/components/ui/toast";


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
 */
export function SupabaseProvider({
  children,
  initialSession: _initialSession  // Deprecated, kept for backwards compatibility
}: {
  children: React.ReactNode;
  initialSession: null;  // Always null - we don't use server-side sessions
}) {
  // Create Supabase client - this client will read session cookies from the browser
  // The auth-helpers library automatically reads cookies on client creation
  const supabase = createClientComponentClient();

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
      <UserProvider>
        <AuthDialogProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthDialogProvider>
      </UserProvider>
    </SessionContextProvider>
  );
}
