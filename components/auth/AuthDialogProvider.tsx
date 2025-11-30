"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthDialog } from "./AuthDialog";

interface AuthDialogContextType {
  isOpen: boolean;
  openAuthDialog: (options?: AuthDialogOptions) => void;
  closeAuthDialog: () => void;
}

interface AuthDialogOptions {
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

  const closeAuthDialog = useCallback(() => {
    setIsOpen(false);
    setOptions({});
  }, []);

  return (
    <AuthDialogContext.Provider value={{ isOpen, openAuthDialog, closeAuthDialog }}>
      {children}
      <AuthDialog
        isOpen={isOpen}
        onClose={closeAuthDialog}
        title={options.title}
        subtitle={options.subtitle}
        onSuccess={options.onSuccess}
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

