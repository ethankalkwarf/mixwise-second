"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AuthDialog } from "./AuthDialog";
import {
  getLastAuthEmail,
  getPreferredAuthMode,
  preferredAuthCopy,
} from "@/lib/auth/returning-user";
import { trackAuthGateShown } from "@/lib/analytics";

export type AuthDialogMode = "signup" | "login" | "reset";

interface AuthDialogContextType {
  isOpen: boolean;
  openAuthDialog: (options?: AuthDialogOptions) => void;
  /** Login vs signup based on whether this browser has signed in before. */
  openPreferredAuthDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openLoginDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openSignupDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  openResetDialog: (options?: Omit<AuthDialogOptions, "mode">) => void;
  closeAuthDialog: (force?: boolean) => void;
}

interface AuthDialogOptions {
  mode?: AuthDialogMode;
  title?: string;
  subtitle?: string;
  initialEmail?: string;
  onSuccess?: () => void;
  /** When false, hide close control and block backdrop / escape dismiss. Default true. */
  dismissible?: boolean;
  /** Explicit leave action when the dialog is not trivially dismissible (e.g. Mix gate). */
  escapeLabel?: string;
  onEscape?: () => void;
  /** Analytics gate id, e.g. mix_gate, favorite, learn_gate, nav. */
  gate?: string;
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

function trackGate(opts?: AuthDialogOptions, fallbackGate?: string) {
  const gate = opts?.gate || fallbackGate || opts?.mode || "auth_dialog";
  void trackAuthGateShown(gate, {
    mode: opts?.mode,
    dismissible: opts?.dismissible !== false,
  });
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AuthDialogOptions>({});
  const dismissibleRef = useRef(true);

  const openAuthDialog = useCallback((opts?: AuthDialogOptions) => {
    const mode = opts?.mode ?? getPreferredAuthMode();
    const dismissible = opts?.dismissible !== false;
    dismissibleRef.current = dismissible;
    trackGate({ ...opts, mode }, opts?.gate || "auth_dialog");
    setOptions({
      ...opts,
      mode,
      dismissible,
      initialEmail: opts?.initialEmail || getLastAuthEmail() || undefined,
    });
    setIsOpen(true);
  }, []);

  const openPreferredAuthDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    const mode = getPreferredAuthMode();
    const copy = preferredAuthCopy(mode);
    trackGate({ ...opts, mode }, opts?.gate || "preferred_auth");
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
    trackGate({ ...opts, mode: "login" }, opts?.gate || "login");
    setOptions({
      ...opts,
      mode: "login",
      initialEmail: opts?.initialEmail || getLastAuthEmail() || undefined,
    });
    setIsOpen(true);
  }, []);

  const openSignupDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    trackGate({ ...opts, mode: "signup" }, opts?.gate || "signup");
    setOptions({ ...opts, mode: "signup" });
    setIsOpen(true);
  }, []);

  const openResetDialog = useCallback((opts?: Omit<AuthDialogOptions, "mode">) => {
    trackGate({ ...opts, mode: "reset" }, opts?.gate || "reset");
    setOptions({ ...opts, mode: "reset" });
    setIsOpen(true);
  }, []);

  const closeAuthDialog = useCallback((force?: boolean) => {
    if (!force && !dismissibleRef.current) return;
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
        dismissible={options.dismissible !== false}
        escapeLabel={options.escapeLabel}
        onEscape={options.onEscape}
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
