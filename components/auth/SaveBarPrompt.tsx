"use client";

import { useState } from "react";
import { BookmarkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import {
  getLastAuthEmail,
  usePreferredAuthMode,
} from "@/lib/auth/returning-user";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

interface SaveBarPromptProps {
  onDismiss: () => void;
}

export function SaveBarPrompt({ onDismiss }: SaveBarPromptProps) {
  const { signInWithGoogle, signInWithApple } = useUser();
  const toast = useToast();
  const preferredMode = usePreferredAuthMode();
  const isReturning = preferredMode === "login";
  const [email, setEmail] = useState(getLastAuthEmail);
  const [loading, setLoading] = useState<"google" | "apple" | "email" | null>(null);
  const [sent, setSent] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleGoogle = async () => {
    setLoading("google");
    try {
      await signInWithGoogle();
    } catch (err) {
      setLoading(null);
      if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const handleApple = async () => {
    setLoading("apple");
    try {
      await signInWithApple();
    } catch (err) {
      setLoading(null);
      if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
      toast.error("Apple sign-in failed. Please try again.");
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading("email");

    try {
      const res = await fetch("/api/auth/email-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "mix_save" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        setLoading(null);
        return;
      }

      setSent(true);
      toast.success(
        data.message ||
          (isReturning
            ? "Check your email for a sign-in link."
            : "Check your email to open your account.")
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 rounded-2xl border-2 border-olive/40 bg-white/95 p-4 shadow-xl backdrop-blur-md md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-olive/30 bg-olive/20">
          <BookmarkIcon className="h-5 w-5 text-olive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-forest">
            {isReturning ? "Sign in to save your bar" : "Save your bar with a free account"}
          </p>
          <p className="text-sm text-sage">
            {sent
              ? isReturning
                ? "Check your email for a sign-in link."
                : "Check your email for a link to open your account."
              : isReturning
                ? "Welcome back — sign in to keep this cabinet synced."
                : "Google, Apple, or email — then you can add a password anytime."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-sage hover:bg-mist hover:text-forest"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {!sent && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading !== null}
              className="flex items-center justify-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-mist/50 disabled:opacity-50"
            >
              {loading === "google" ? <span className="spinner" /> : <GoogleIcon className="h-4 w-4" />}
              Google
            </button>
            <button
              type="button"
              onClick={handleApple}
              disabled={loading !== null}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
            >
              {loading === "apple" ? (
                <span className="spinner border-white/30 border-t-white" />
              ) : (
                <AppleIcon className="h-4 w-4" />
              )}
              Apple
            </button>
          </div>

          <form onSubmit={handleEmailSave} className="flex gap-2">
            <label className="sr-only" htmlFor="save-bar-email">
              Email
            </label>
            <input
              id="save-bar-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="input-botanical min-w-0 flex-1 !py-2 !text-sm"
              autoComplete="email"
              disabled={loading !== null}
            />
            <button
              type="submit"
              disabled={loading !== null || !isEmailValid}
              className="shrink-0 rounded-xl bg-terracotta px-3 py-2 text-sm font-bold text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "email" ? "…" : isReturning ? "Sign in" : "Save"}
            </button>
          </form>
        </>
      )}

      {sent && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 w-full rounded-xl border border-mist px-3 py-2 text-sm text-sage hover:text-forest"
        >
          Got it
        </button>
      )}
    </div>
  );
}
