"use client";

import { useState } from "react";
import { EnvelopeIcon, CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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

export function AuthPanel({
  initialEmail = "",
  convertSource,
  convertToken,
}: {
  initialEmail?: string;
  convertSource?: string;
  convertToken?: string;
}) {
  const { signInWithGoogle, signInWithApple, signInWithPassword } = useUser();
  const { openLoginDialog } = useAuthDialog();
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const fromList = Boolean(convertToken && email);
  const busy = googleLoading || appleLoading || emailLoading;

  const sendMagicLink = async () => {
    if (!isEmailValid) {
      setError("Enter a valid email address");
      return;
    }
    setEmailLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/email-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "join_page", nextPath: "/dashboard" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not send the link. Try Google or Apple.");
        setEmailLoading(false);
        return;
      }
      setSent(true);
      toast.success("Check your email for a link to open your account.");
    } catch {
      setError("Could not send the link. Try Google or Apple.");
    } finally {
      setEmailLoading(false);
    }
  };

  const setPasswordAndEnter = async () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setEmailLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/email/convert-to-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: convertSource || "homepage",
          token: convertToken,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not finish setup. Try Google or Apple.");
        setEmailLoading(false);
        return;
      }

      const signedIn = await signInWithPassword(email.trim().toLowerCase(), password);
      if (signedIn.error) {
        setError(signedIn.error);
        setEmailLoading(false);
        return;
      }

      toast.success("You're in. MixWise will remember the cabinet.");
      window.location.href = "/dashboard";
    } catch {
      setError("Could not finish setup. Try Google or Apple.");
      setEmailLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-mist bg-white p-6 text-center sm:p-8">
        <CheckCircleIcon className="mx-auto mb-3 h-10 w-10 text-olive" />
        <p className="font-display text-xl font-bold text-forest">Check your email</p>
        <p className="mt-2 text-sm text-sage">
          We sent a link to <strong>{email}</strong>. Open it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-mist bg-white p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold text-forest">
        {fromList ? "One last step" : "Create your free account"}
      </h2>
      <p className="mt-2 text-sm text-sage">
        {fromList
          ? "Set a password and MixWise will remember the cabinet."
          : "Google, Apple, or a link to your inbox. Takes about a minute."}
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-terracotta" role="alert">
          {error}
          {error.toLowerCase().includes("already has") && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => openLoginDialog({ initialEmail: email })}
                className="font-medium underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      )}

      {fromList && (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void setPasswordAndEnter();
          }}
        >
          <div>
            <label className="label-botanical" htmlFor="join-email">
              Email
            </label>
            <input
              id="join-email"
              type="email"
              value={email}
              readOnly
              className="input-botanical w-full bg-mist/40"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label-botanical" htmlFor="join-password">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
              <input
                id="join-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-botanical w-full pl-11"
                minLength={8}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
              />
            </div>
          </div>
          <div>
            <label className="label-botanical" htmlFor="join-password-confirm">
              Confirm password
            </label>
            <input
              id="join-password-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-botanical w-full"
              minLength={8}
              autoComplete="new-password"
              required
              placeholder="Same password again"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center rounded-2xl bg-terracotta px-4 py-3 font-bold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark disabled:opacity-50"
          >
            {emailLoading ? "Saving…" : "Set password & start mixing"}
          </button>
        </form>
      )}

      <div className={`${fromList ? "mt-6" : "mt-6"} space-y-3`}>
        {fromList && (
          <div className="relative mb-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mist" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-sage">or skip the password</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={async () => {
            setGoogleLoading(true);
            try {
              await signInWithGoogle();
            } catch (err) {
              setGoogleLoading(false);
              if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
              setError("Google sign-in failed. Try email instead.");
            }
          }}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-mist bg-white px-4 py-3 font-medium text-forest transition-colors hover:bg-mist/50 disabled:opacity-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={async () => {
            setAppleLoading(true);
            try {
              await signInWithApple();
            } catch (err) {
              setAppleLoading(false);
              if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
              setError("Apple sign-in failed. Try email instead.");
            }
          }}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
        >
          <AppleIcon className="h-5 w-5" />
          Continue with Apple
        </button>
      </div>

      {!fromList && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mist" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-sage">or email</span>
            </div>
          </div>
          <div className="relative mb-3">
            <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="input-botanical w-full pl-11"
              autoComplete="email"
            />
          </div>
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={busy || !isEmailValid}
            className="flex w-full items-center justify-center rounded-2xl bg-terracotta px-4 py-3 font-bold text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-50"
          >
            {emailLoading ? "Sending…" : "Email me a sign-in link"}
          </button>
        </>
      )}
    </div>
  );
}
