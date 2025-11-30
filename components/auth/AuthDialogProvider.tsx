"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthDialog } from "./AuthDialog";

export type AuthDialogMode = "signup" | "login";

interface AuthDialogContextType {
  isOpen: boolean;
  openAuthDialog: (options?: AuthDialogOptions) => void;
  openLoginDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openSignupDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  closeAuthDialog: () => void;
}

interface AuthDialogOptions {
  mode?: AuthDialogMode;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AuthDialogOptions>({});

  const openAuthDialog = useCallback((opts?: AuthDialogOptions) => {
    setOptions(opts || {});
    setIsOpen(true);
  }, []);

  const openLoginDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    setOptions({ ...opts, mode: "login" });
    setIsOpen(true);
  }, []);

  const openSignupDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    setOptions({ ...opts, mode: "signup" });
    setIsOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setIsOpen(false);
    setOptions({});
  }, []);

  const setMode = useCallback((mode: AuthDialogMode) => {
    setOptions(prev => ({ ...prev, mode }));
  }, []);

  return (
    <AuthDialogContext.Provider value={{ isOpen, openAuthDialog, openLoginDialog, openSignupDialog, closeAuthDialog }}>
      {children}
      <AuthDialog
        isOpen={isOpen}
        onClose={closeAuthDialog}
        mode={options.mode || "signup"}
        title={options.title}
        subtitle={options.subtitle}
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

