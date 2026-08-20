"use client";

import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { SetPasswordPrompt } from "@/components/auth/SetPasswordPrompt";
import { SignupPrompt } from "@/components/auth/SignupPrompt";
import { ToastProvider } from "@/components/ui/toast";
import { CapacitorProvider } from "@/components/mobile/CapacitorProvider";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CapacitorProvider>
      <UserProvider>
        <PostHogProvider>
          <AuthDialogProvider>
            <ToastProvider>
              {children}
              <SignupPrompt />
              <SetPasswordPrompt />
            </ToastProvider>
          </AuthDialogProvider>
        </PostHogProvider>
      </UserProvider>
    </CapacitorProvider>
  );
}
