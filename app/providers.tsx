"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";

// Create Supabase client with fallback for build-time when env vars may not be available
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are available, use the proper auth helpers client
  if (supabaseUrl && supabaseAnonKey) {
    return createClientComponentClient();
  }

  // Fallback: create a minimal client for build time
  // This allows the build to succeed; actual functionality requires proper env vars
  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key"
  );
}

const supabase = createSupabaseClient();

export function SupabaseProvider({
  children,
  initialSession
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <UserProvider>
        <AuthDialogProvider>
          {children}
        </AuthDialogProvider>
      </UserProvider>
    </SessionContextProvider>
  );
}
