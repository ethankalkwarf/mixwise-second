"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthDialog } from "./AuthDialog";
import {
  getLastAuthEmail,
  getPreferredAuthMode,
  preferredAuthCopy,
} from "@/lib/auth/returning-user";

export type AuthDialogMode = "signup" | "login" | "reset";

interface AuthDialogContextType {
  isOpen: boolean;
  openAuthDialog: (options?: AuthDialogOptions) => void;
  /** Login vs signup based on whether this browser has signed in before. */
  openPreferredAuthDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openLoginDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openSignupDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openResetDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  closeAuthDialog: () => void;
}

interface AuthDialogOptions {
  mode?: AuthDialogMode;
  title?: string;
  subtitle?: string;
  initialEmail?: string;
  onSuccess?: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AuthDialogOptions>({});

  const openAuthDialog = useCallback((opts?: AuthDialogOptions) => {
    const mode = opts?.mode ?? getPreferredAuthMode();
    setOptions({
      ...opts,
      mode,
      initialEmail: opts?.initialEmail || getLastAuthEmail() || undefined,
    });
    setIsOpen(true);
  }, []);

  const openPreferredAuthDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    const mode = getPreferredAuthMode();
    const copy = preferredAuthCopy(mode);
    setOptions({
      title: copy.title,
      subtitle: copy.subtitle,
      ...opts,
      mode,
      initialEmail: opts?.initialEmail || getLastAuthEmail() || undefined,
    });
    setIsOpen(true);
  }, []);

  const openLoginDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    setOptions({
      ...opts,
      mode: "login",
      initialEmail: opts?.initialEmail || getLastAuthEmail() || undefined,
    });
    setIsOpen(true);
  }, []);

  const openSignupDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    setOptions({ ...opts, mode: "signup" });
    setIsOpen(true);
  }, []);

  const openResetDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    setOptions({ ...opts, mode: "reset" });
    setIsOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setIsOpen(false);
    setOptions({});
  }, []);

  const setMode = useCallback((mode: AuthDialogMode) => {
    setOptions((prev) => ({ ...prev, mode }));
  }, []);

  return (
    <AuthDialogContext.Provider
      value={{
        isOpen,
        openAuthDialog,
        openPreferredAuthDialog,
        openLoginDialog,
        openSignupDialog,
        openResetDialog,
        closeAuthDialog,
      }}
    >
      {children}
      <AuthDialog
        isOpen={isOpen}
        onClose={closeAuthDialog}
        mode={options.mode || "signup"}
        title={options.title}
        subtitle={options.subtitle}
        initialEmail={options.initialEmail}
        onSuccess={options.onSuccess}
        onModeChange={setMode}
      />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (context === undefined) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return context;
}
