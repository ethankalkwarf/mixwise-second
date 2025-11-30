"use client";

import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { ToastProvider } from "@/components/ui/toast";
import { EmailCaptureModal } from "@/components/email/EmailCaptureModal";

/**
 * SupabaseProvider
 * 
 * Wraps the application with Supabase session context.
 * Creates a fresh Supabase client on mount to ensure proper cookie handling.
 * 
 * Important: The client is created inside the component (not at module level)
 * to ensure it has access to the correct browser cookies on each render.
 */
export function SupabaseProvider({
  children,
  initialSession
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  // Create client inside component to ensure proper cookie handling
  // useState ensures the client is only created once per component lifecycle
  const [supabase] = useState(() => createClientComponentClient());
  
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <UserProvider>
        <AuthDialogProvider>
          <ToastProvider>
            {children}
            <EmailCaptureModal />
          </ToastProvider>
        </AuthDialogProvider>
      </UserProvider>
    </SessionContextProvider>
  );
}
