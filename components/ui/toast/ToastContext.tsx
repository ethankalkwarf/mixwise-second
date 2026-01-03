"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Toast, ToastContainer, ToastType } from "./Toast";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  action?: {
    label: string;
    href: string;
  };
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number, action?: { label: string; href: string }) => void;
  success: (message: string, duration?: number, action?: { label: string; href: string }) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000, action?: { label: string; href: string }) => {
    const id = `toast-${Date.now()}-${idCounter.current++}`;
    setToasts((prev) => [...prev, { id, type, message, duration, action }]);
    return id;
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000, action?: { label: string; href: string }) => {
      addToast(message, type, duration, action);
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration = 4000, action?: { label: string; href: string }) => {
      addToast(message, "success", duration, action);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration = 5000) => {
      addToast(message, "error", duration);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration = 4000) => {
      addToast(message, "info", duration);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration = 4500) => {
      addToast(message, "warning", duration);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <ToastContainer>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            duration={t.duration}
            action={t.action}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

// No-op toast for when context is not available (SSR)
const noopToast: ToastContextValue = {
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

export function useToast() {
  const context = useContext(ToastContext);
  // Return noop if context is not available (e.g., during SSR)
  if (!context) {
    return noopToast;
  }
  return context;
}

