"use client";

import React, { useState, Fragment, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "./UserProvider";
import { useToast } from "@/components/ui/toast";
import type { AuthDialogMode } from "./AuthDialogProvider";
import { debugLog } from "@/lib/debugLog";
import { BrandLogo } from "@/components/common/BrandLogo";
import { markHasAccount } from "@/lib/auth/returning-user";
import { currentReturnPath, rememberAuthReturnTo, resolvePostAuthPath } from "@/lib/auth/return-to";
import { useNativeShell } from "@/hooks/useIsNativeApp";

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

interface AuthDialogProps {
  isOpen: boolean;
  onClose: (force?: boolean) => void;
  mode?: AuthDialogMode;
  title?: string;
  subtitle?: string;
  initialEmail?: string;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthDialogMode) => void;
  dismissible?: boolean;
  escapeLabel?: string;
  onEscape?: () => void;
}

export function AuthDialog({
  isOpen,
  onClose,
  mode = "signup",
  title,
  subtitle,
  initialEmail = "",
  onSuccess,
  onModeChange,
  dismissible = true,
  escapeLabel,
  onEscape,
}: AuthDialogProps) {
  const { signInWithGoogle, signInWithApple, signInWithPassword, signInWithEmail, resetPassword, isAuthenticated } = useUser();
  const router = useRouter();
  const toast = useToast();
  const nativeShell = useNativeShell();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Prefer password once email is valid; user can switch to magic link. */
  const [preferPassword, setPreferPassword] = useState(true);
  const [accountHint, setAccountHint] = useState<"existing" | "new" | null>(null);
  /** True after a valid email has been stable briefly — avoids password popping mid-typing. */
  const [emailSettled, setEmailSettled] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const defaultTitle = mode === "login"
    ? "Welcome back to MixWise"
    : mode === "reset"
    ? "Reset your password"
    : "Create your free MixWise account";

  const displayTitle = title || defaultTitle;
  /** Require a real TLD (2+ letters) so `user@gmail.c` does not unlock the password step. */
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const showCredentialStep = mode !== "reset" && isEmailValid && emailSettled;
  const showPasswordFields = showCredentialStep && preferPassword;
  const anyLoading = isEmailLoading || isMagicLoading || isGoogleLoading || isAppleLoading;

  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    setPreferPassword(true);
    setError(null);
    setPassword("");
    setEmailSettled(false);
  }, [mode]);

  // Wait until the address stops changing so mid-typing (.com) does not pop the password field.
  useEffect(() => {
    if (!isEmailValid) {
      setEmailSettled(false);
      return;
    }
    const timer = window.setTimeout(() => setEmailSettled(true), 650);
    return () => window.clearTimeout(timer);
  }, [email, isEmailValid]);

  // Reveal password only after a settled valid email; look up existing accounts on signup.
  useEffect(() => {
    if (!isOpen || mode === "reset") return;

    if (!isEmailValid || !emailSettled) {
      if (!isEmailValid) {
        setPassword("");
        setAccountHint(null);
      }
      return;
    }

    if (mode !== "signup") return;

    const trimmed = email.trim().toLowerCase();
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/lookup-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { hasAccount?: boolean };
        if (cancelled) return;
        if (data.hasAccount) {
          markHasAccount(trimmed);
          setAccountHint("existing");
          onModeChange?.("login");
        } else {
          setAccountHint("new");
        }
      } catch {
        /* ignore lookup failures — signup still works */
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [email, isEmailValid, emailSettled, isOpen, mode, onModeChange]);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onSuccess?.();
      onClose(true);
      const here = currentReturnPath();
      const dest = resolvePostAuthPath(here);
      if (dest !== here) {
        router.replace(dest);
      }
    }
  }, [isAuthenticated, isOpen, onClose, onSuccess, router]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEmailConfirmed = (event: Event) => {
      const customEvent = event as CustomEvent<{ success: boolean }>;
      if (customEvent.detail?.success) {
        debugLog("[AuthDialog] Email confirmation detected, closing dialog");
        onSuccess?.();
        onClose(true);
      }
    };

    window.addEventListener("mixwise:emailConfirmed", handleEmailConfirmed);
    return () => {
      window.removeEventListener("mixwise:emailConfirmed", handleEmailConfirmed);
    };
  }, [isOpen, onClose, onSuccess]);

  const handleGoogleSignIn = async () => {
    rememberAuthReturnTo();
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setIsGoogleLoading(false);
      if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleAppleSignIn = async () => {
    rememberAuthReturnTo();
    setIsAppleLoading(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (err) {
      setIsAppleLoading(false);
      if ((err as { code?: string } | null)?.code === "OAUTH_CANCELLED") return;
      setError("Failed to sign in with Apple. Please try again.");
    }
  };

  const handleMagicLink = async () => {
    if (!isEmailValid) {
      setError("Enter a valid email address");
      return;
    }

    rememberAuthReturnTo();
    setIsMagicLoading(true);
    setError(null);

    // Intentional account / sign-in: Resend magic link (not Supabase default email)
    try {
      const response = await fetch("/api/auth/email-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "auth_dialog",
          nextPath: currentReturnPath(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        // Fall back to client OTP if server path fails
        const result = await signInWithEmail(email.trim());
        if (result.error) {
          setError(data.error || result.error);
          toast.error(data.error || result.error);
          setIsMagicLoading(false);
          return;
        }
      }

      setMagicLinkSent(true);
      setIsMagicLoading(false);
      toast.success(
        mode === "signup"
          ? "Check your email for a link to open your account."
          : "Check your email for a sign-in link."
      );
    } catch {
      setError("Failed to send email link. Please try again.");
      toast.error("Failed to send email link");
      setIsMagicLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsEmailLoading(true);
    setError(null);

    if (mode === "signup") {
      if (!password.trim()) {
        setError("Password is required");
        setIsEmailLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsEmailLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            nextPath: currentReturnPath(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Signup failed:", data);
          const alreadyExists = typeof data.error === "string" && /already exists/i.test(data.error);
          if (alreadyExists) {
            markHasAccount(email.trim());
            onModeChange?.("login");
            toast.info("An account already exists for this email. Log in instead.");
            setIsEmailLoading(false);
            return;
          }
          setError(data.error || "Failed to create account. Please try again.");
          toast.error(data.error || "Failed to create account");
          setIsEmailLoading(false);
          return;
        }

        if (data.ok) {
          setSignupSuccess(true);
          setIsEmailLoading(false);
          if (data.emailSent) {
            toast.success("Account created! Check your email to confirm.");
          } else {
            toast.info(data.message || "Account created. Please check your email.");
          }
        } else {
          setError(data.error || "Failed to create account. Please try again.");
          toast.error(data.error || "Failed to create account");
          setIsEmailLoading(false);
        }
      } catch (apiError) {
        console.error("Signup API call failed:", apiError);
        setError("Failed to create account. Please try again.");
        toast.error("Failed to create account");
        setIsEmailLoading(false);
      }
    } else if (mode === "reset") {
      const result = await resetPassword(email.trim());

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setIsEmailLoading(false);
      } else {
        setEmailSent(true);
        setIsEmailLoading(false);
        toast.success(
          result.message ||
            "If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder."
        );
      }
    } else {
      if (!password.trim()) {
        setError("Password is required");
        setIsEmailLoading(false);
        return;
      }

      const result = await signInWithPassword(email.trim(), password.trim());

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setIsEmailLoading(false);
      } else {
        toast.success("Welcome back!");
        setIsEmailLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setEmailSent(false);
    setMagicLinkSent(false);
    setSignupSuccess(false);
    setPreferPassword(true);
    setAccountHint(null);
    setError(null);
  };

  const handleClose = () => {
    if (!dismissible) return;
    resetForm();
    onClose();
  };

  const handleEscape = () => {
    resetForm();
    onEscape?.();
    onClose(true);
  };

  const showEscape = Boolean(escapeLabel) && !signupSuccess && !magicLinkSent && !emailSent;

  const panelClass = nativeShell
    ? "relative flex min-h-[100dvh] w-full flex-col overflow-y-auto bg-cream px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left"
    : "relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-mist p-6 sm:p-8 text-left align-middle shadow-card-hover";

  const shellWrapClass = nativeShell
    ? "flex min-h-full items-stretch justify-center bg-cream"
    : "flex min-h-full items-center justify-center p-4 text-center";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={nativeShell ? "relative z-[120]" : "relative z-[100]"}
        onClose={dismissible ? handleClose : () => {}}
        data-auth-dialog
        data-native-auth={nativeShell ? "1" : undefined}
      >
        {nativeShell ? (
          <div className="fixed inset-0 bg-cream" aria-hidden />
        ) : (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-forest/35 backdrop-blur-md" aria-hidden />
          </Transition.Child>
        )}

        <div className="fixed inset-0 overflow-y-auto">
          <div className={shellWrapClass}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom={nativeShell ? "opacity-0 translate-y-3" : "opacity-0"}
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className={panelClass}>
                {dismissible && (
                  <button
                    onClick={handleClose}
                    className={
                      nativeShell
                        ? "absolute right-3 top-[max(0.5rem,env(safe-area-inset-top))] z-10 rounded-full bg-white p-2.5 text-forest ring-1 ring-mist shadow-sm"
                        : "absolute top-4 right-4 p-2 rounded-xl text-sage hover:text-forest hover:bg-mist transition-colors"
                    }
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}

                {signupSuccess ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-olive" />
                    </div>
                    <Dialog.Title className="text-xl font-display font-bold text-forest mb-4">
                      Account created!
                    </Dialog.Title>
                    <p className="text-sage mb-4">
                      We sent a confirmation link to <strong>{email}</strong>.
                    </p>
                    <p className="text-sm text-sage mb-6 bg-mist/30 rounded-2xl p-4">
                      Click the link in your email to verify your account. Once confirmed, you&apos;ll be signed in automatically.
                    </p>
                    <button
                      onClick={() => {
                        setSignupSuccess(false);
                        onModeChange?.("login");
                      }}
                      className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Already confirmed? Log in
                    </button>
                  </div>
                ) : magicLinkSent ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-olive" />
                    </div>
                    <Dialog.Title className="text-xl font-display font-bold text-forest mb-2">
                      Check your email
                    </Dialog.Title>
                    <p className="text-sage mb-6">
                      We sent a link to <strong>{email}</strong>. Open it to{" "}
                      {mode === "signup" ? "finish creating your account" : "sign in"}.
                      Afterward you can add a password if you want.
                    </p>
                    <button
                      onClick={() => setMagicLinkSent(false)}
                      className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : emailSent ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-olive" />
                    </div>
                    <Dialog.Title className="text-xl font-display font-bold text-forest mb-2">
                      Check your email
                    </Dialog.Title>
                    <p className="text-sage mb-6">
                      If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                    </p>
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        onModeChange?.("login");
                      }}
                      className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={nativeShell ? "mx-auto flex w-full max-w-md flex-1 flex-col pt-6" : ""}>
                    <div className={`text-center ${nativeShell ? "mb-8" : "mb-6"}`}>
                      <div className={`${nativeShell ? "mb-6" : "mb-4"} flex justify-center`}>
                        <BrandLogo size="lg" variant="dark" linked={false} />
                      </div>
                      {nativeShell && mode !== "reset" ? (
                        <div
                          className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1 ring-1 ring-mist"
                          role="tablist"
                          aria-label="Account"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "login"}
                            onClick={() => onModeChange?.("login")}
                            className={`rounded-xl py-3 text-sm font-bold transition-colors ${
                              mode === "login"
                                ? "bg-forest text-cream shadow-sm"
                                : "text-sage"
                            }`}
                          >
                            Log in
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={mode === "signup"}
                            onClick={() => onModeChange?.("signup")}
                            className={`rounded-xl py-3 text-sm font-bold transition-colors ${
                              mode === "signup"
                                ? "bg-forest text-cream shadow-sm"
                                : "text-sage"
                            }`}
                          >
                            Create account
                          </button>
                        </div>
                      ) : null}
                      <Dialog.Title
                        className={`font-display font-bold text-forest mb-2 ${
                          nativeShell ? "text-2xl tracking-tight" : "text-xl"
                        }`}
                      >
                        {displayTitle}
                      </Dialog.Title>
                      <p className={`text-sage ${nativeShell ? "text-[15px] leading-relaxed" : "text-sm"}`}>
                        {subtitle || (mode === "login"
                          ? "Sign in to access your saved cocktails, notes, bar inventory, and more."
                          : mode === "reset"
                          ? "Enter your email address and we'll send you a link to reset your password."
                          : "Save your bar, favorite cocktails, tasting notes, and get personalized recommendations.")}
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-terracotta text-sm">
                        {error}
                      </div>
                    )}

                    {mode !== "reset" && (
                      <div className={`space-y-3 ${nativeShell ? "mb-5" : "mb-4"}`}>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={anyLoading}
                          className={`w-full flex items-center justify-center gap-3 px-4 bg-white hover:bg-mist/50 text-forest font-semibold rounded-2xl border border-mist transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            nativeShell ? "py-3.5 text-[15px] shadow-sm" : "py-3 font-medium"
                          }`}
                        >
                          {isGoogleLoading ? (
                            <div className="spinner" />
                          ) : (
                            <GoogleIcon className="w-5 h-5" />
                          )}
                          Continue with Google
                        </button>

                        <button
                          type="button"
                          onClick={handleAppleSignIn}
                          disabled={anyLoading}
                          className={`w-full flex items-center justify-center gap-3 px-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            nativeShell ? "py-3.5 text-[15px]" : "py-3 font-medium"
                          }`}
                        >
                          {isAppleLoading ? (
                            <div className="spinner border-white/30 border-t-white" />
                          ) : (
                            <AppleIcon className="w-5 h-5" />
                          )}
                          Continue with Apple
                        </button>
                      </div>
                    )}

                    {mode !== "reset" && (
                      <div className={`relative ${nativeShell ? "my-5" : "my-6"}`}>
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-mist" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className={`${nativeShell ? "bg-cream" : "bg-white"} px-3 text-sage`}>
                            or continue with email
                          </span>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleEmailAuth}>
                      <label className="label-botanical">Email Address</label>
                      <div className="relative mb-4">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="input-botanical pl-11 text-base"
                          required
                          autoComplete="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          inputMode="email"
                          enterKeyHint={showCredentialStep ? "next" : "done"}
                        />
                      </div>

                      {accountHint === "existing" && mode === "login" ? (
                        <p className="mb-3 text-sm text-forest/80">
                          Welcome back — we found an account for this email.
                        </p>
                      ) : null}

                      {mode !== "reset" && showPasswordFields && (
                        <>
                          <label className="label-botanical">Password</label>
                          <div className="relative mb-4">
                            <input
                              ref={passwordInputRef}
                              type="password"
                              name={mode === "signup" ? "new-password" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Enter your password"}
                              className="input-botanical text-base"
                              required
                              minLength={8}
                              autoComplete={mode === "signup" ? "new-password" : "current-password"}
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              enterKeyHint="done"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={
                              anyLoading ||
                              !email.trim() ||
                              (mode === "signup" && (!isEmailValid || !password.trim())) ||
                              (mode === "login" && !password.trim())
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all shadow-lg shadow-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isEmailLoading ? (
                              <div className="spinner border-cream/30 border-t-cream" />
                            ) : mode === "signup" ? (
                              "Create Account"
                            ) : (
                              "Log In"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPreferPassword(false);
                              setPassword("");
                              setError(null);
                            }}
                            className="w-full mt-3 text-sm text-sage hover:text-forest transition-colors py-1"
                          >
                            Email me a sign-in link instead
                          </button>
                        </>
                      )}

                      {mode !== "reset" && showCredentialStep && !preferPassword && (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={handleMagicLink}
                            disabled={anyLoading || !isEmailValid}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all shadow-lg shadow-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isMagicLoading ? (
                              <div className="spinner border-cream/30 border-t-cream" />
                            ) : (
                              "Email me a sign-in link"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreferPassword(true)}
                            className="w-full text-sm text-sage hover:text-forest transition-colors py-1"
                          >
                            Use a password instead
                          </button>
                        </div>
                      )}

                      {mode !== "reset" && !showCredentialStep ? (
                        <p className="text-sm text-sage">Enter your email to continue with a password or a sign-in link.</p>
                      ) : null}
                      {mode === "reset" && (
                        <button
                          type="submit"
                          disabled={anyLoading || !email.trim()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all shadow-lg shadow-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEmailLoading ? (
                            <div className="spinner border-cream/30 border-t-cream" />
                          ) : (
                            "Send Reset Link"
                          )}
                        </button>
                      )}
                    </form>

                    {mode === "signup" && !nativeShell && (
                      <div className="mt-6 pt-6 border-t border-mist">
                        <p className="font-mono text-xs text-sage text-center mb-3 uppercase tracking-widest">Free accounts include:</p>
                        <ul className="space-y-2 text-sm text-charcoal">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-olive rounded-full" />
                            Save your home bar ingredients
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-olive rounded-full" />
                            Favorite cocktails to find later
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-olive rounded-full" />
                            Track your cocktail history
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className={`text-center ${nativeShell ? "mt-8 pt-2" : "mt-6 pt-6 border-t border-mist"}`}>
                      {mode === "signup" && !nativeShell ? (
                        <p className="text-sm text-sage">
                          Already have an account?{" "}
                          <button
                            onClick={() => onModeChange?.("login")}
                            className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                          >
                            Log in
                          </button>
                        </p>
                      ) : mode === "reset" ? (
                        <p className="text-sm text-sage">
                          Remember your password?{" "}
                          <button
                            onClick={() => onModeChange?.("login")}
                            className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                          >
                            Back to login
                          </button>
                        </p>
                      ) : mode === "login" ? (
                        <div className="space-y-2">
                          <p className="text-sm text-sage">
                            <button
                              onClick={() => onModeChange?.("reset")}
                              className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                            >
                              Forgot your password?
                            </button>
                          </p>
                          {!nativeShell ? (
                            <p className="text-sm text-sage">
                              Don&apos;t have an account?{" "}
                              <button
                                onClick={() => onModeChange?.("signup")}
                                className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                              >
                                Create one for free
                              </button>
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-4 text-xs text-sage text-center">
                      By continuing, you agree to our Terms of Service and{" "}
                      <a href="/privacy" className="text-terracotta hover:text-terracotta-dark underline">
                        Privacy Policy
                      </a>.
                    </p>

                    {showEscape ? (
                      <button
                        type="button"
                        onClick={handleEscape}
                        className="mt-5 w-full py-3 text-sm font-medium text-sage hover:text-forest transition-colors"
                      >
                        {escapeLabel}
                      </button>
                    ) : null}
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
