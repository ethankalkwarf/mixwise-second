"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  action?: {
    label: string;
    href: string;
  };
  onClose: (id: string) => void;
}

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const styles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "bg-slate-900/95",
    icon: "text-lime-400",
    border: "border-lime-500/30",
  },
  error: {
    bg: "bg-slate-900/95",
    icon: "text-red-400",
    border: "border-red-500/30",
  },
  info: {
    bg: "bg-slate-900/95",
    icon: "text-sky-400",
    border: "border-sky-500/30",
  },
  warning: {
    bg: "bg-slate-900/95",
    icon: "text-amber-400",
    border: "border-amber-500/30",
  },
};

export function Toast({ id, type, message, duration, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Set up auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  useEffect(() => {
    if (isLeaving) {
      const removeTimer = setTimeout(() => {
        onClose(id);
      }, 300); // Match animation duration
      return () => clearTimeout(removeTimer);
    }
  }, [isLeaving, id, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${style.bg} ${style.border}
        border rounded-lg shadow-xl shadow-black/20
        px-4 py-3 flex items-start gap-3
        min-w-[300px] max-w-[420px]
        backdrop-blur-sm
      `}
    >
      <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-relaxed">{message}</p>
        {action && (
          <Link
            href={action.href}
            onClick={handleClose}
            className="mt-2 inline-block text-xs font-semibold text-slate-300 hover:text-white underline transition-colors"
          >
            {action.label} →
          </Link>
        )}
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0 p-0.5 -m-0.5"
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-auto"
    >
      {children}
    </div>
  );
}





