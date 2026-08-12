"use client";

import { UserProvider } from "@/components/auth/UserProvider";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";
import { ToastProvider } from "@/components/ui/toast";
import { CapacitorProvider } from "@/components/mobile/CapacitorProvider";

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CapacitorProvider>
      <UserProvider>
        <AuthDialogProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthDialogProvider>
      </UserProvider>
    </CapacitorProvider>
  );
}
