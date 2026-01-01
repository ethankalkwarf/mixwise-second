"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "./UserProvider";
import { useToast } from "@/components/ui/toast";
import type { AuthDialogMode } from "./AuthDialogProvider";

// Google icon component
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

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: AuthDialogMode;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthDialogMode) => void;
}

export function AuthDialog({
  isOpen,
  onClose,
  mode = "signup",
  title,
  subtitle,
  onSuccess,
  onModeChange,
}: AuthDialogProps) {
  const { signInWithGoogle, signInWithPassword, resetPassword, isAuthenticated } = useUser();
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default titles based on mode
  const defaultTitle = mode === "login"
    ? "Welcome back to MixWise"
    : mode === "reset"
    ? "Reset your password"
    : "Create your free MixWise account";
  
  const displayTitle = title || defaultTitle;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const showSignupDetails = mode === "signup" && isEmailValid;

  // Close dialog if user becomes authenticated
  React.useEffect(() => {
    if (isAuthenticated && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose, onSuccess]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsEmailLoading(true);
    setError(null);

    if (mode === "signup") {
      if (!firstName.trim()) {
        setError("First name is required");
        setIsEmailLoading(false);
        return;
      }
      if (!lastName.trim()) {
        setError("Last name is required");
        setIsEmailLoading(false);
        return;
      }

      // Validate password for signup
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

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsEmailLoading(false);
        return;
      }

      // Use server-side signup API to create user and send confirmation email
      // This bypasses Supabase's default email flow
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Signup failed:", data);
          setError(data.error || "Failed to create account. Please try again.");
          toast.error(data.error || "Failed to create account");
          setIsEmailLoading(false);
          return;
        }

        if (data.ok) {
          setSignupSuccess(true);
          setIsEmailLoading(false);
          if (data.emailSent) {
            toast.success("Check your email to confirm your account");
          } else {
            toast.info(data.message || "Account created. Please try logging in.");
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
      // Reset password
      const result = await resetPassword(email.trim());

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setIsEmailLoading(false);
      } else {
        setEmailSent(true);
        setIsEmailLoading(false);
        toast.success("If an account with that email exists, we've sent you a password reset link");
      }
    } else {
      // Sign in with email and password
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
        // Success - the useEffect will close the dialog when isAuthenticated becomes true
        toast.success("Welcome back!");
        setIsEmailLoading(false);
      }
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailSent(false);
    setSignupSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-forest/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Dialog content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white border border-mist p-6 sm:p-8 text-left align-middle shadow-card-hover transition-all">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-xl text-sage hover:text-forest hover:bg-mist transition-colors"
                  aria-label="Close dialog"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {signupSuccess ? (
                  // Signup success - email confirmation sent
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-olive" />
                    </div>
                    <Dialog.Title className="text-xl font-display font-bold text-forest mb-2">
                      Check your email
                    </Dialog.Title>
                    <p className="text-sage mb-6">
                      We sent a confirmation link to <strong>{email}</strong>. Click the link to verify your account, then come back to log in.
                    </p>
                    <button
                      onClick={() => {
                        setSignupSuccess(false);
                        onModeChange?.("login");
                      }}
                      className="text-sm text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Back to login
                    </button>
                  </div>
                ) : emailSent ? (
                  // Password reset email sent
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
                  // Sign in form
                  <>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="mb-4">
                        <span className="text-3xl font-display font-bold text-forest">mixwise.</span>
                      </div>
                      <Dialog.Title className="text-xl font-display font-bold text-forest mb-2">
                        {displayTitle}
                      </Dialog.Title>
                      <p className="text-sage text-sm">
                        {subtitle || (mode === "login"
                          ? "Sign in to access your saved cocktails, bar inventory, and more."
                          : mode === "reset"
                          ? "Enter your email address and we'll send you a link to reset your password."
                          : "Save your bar, favorite cocktails, and get personalized recommendations.")}
                      </p>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-terracotta text-sm">
                        {error}
                      </div>
                    )}

                    {/* Google sign in */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-mist/50 text-forest font-medium rounded-2xl border border-mist transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                      {isGoogleLoading ? (
                        <div className="spinner" />
                      ) : (
                        <GoogleIcon className="w-5 h-5" />
                      )}
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-mist" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 text-sage">or</span>
                      </div>
                    </div>

                    {/* Email auth */}
                    <form onSubmit={handleEmailAuth}>
                      <label className="label-botanical">Email Address</label>
                      <div className="relative mb-4">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="input-botanical pl-11"
                          required
                        />
                      </div>

                      {showSignupDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="label-botanical">First Name</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                                className="input-botanical"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="label-botanical">Last Name</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                                className="input-botanical"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {(mode === "login" || showSignupDetails) && (
                        <>
                          <label className="label-botanical">Password</label>
                          <div className="relative mb-4">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                              className="input-botanical"
                              required
                              minLength={8}
                            />
                          </div>

                          {mode === "signup" && showSignupDetails && (
                            <>
                              <label className="label-botanical">Confirm Password</label>
                              <div className="relative mb-4">
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirm your password"
                                  className="input-botanical"
                                  required
                                  minLength={8}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={
                          isEmailLoading || 
                          !email.trim() || 
                          (mode === "signup" && (!isEmailValid || !firstName.trim() || !lastName.trim() || !password.trim() || !confirmPassword.trim())) ||
                          (mode === "login" && !password.trim())
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all shadow-lg shadow-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEmailLoading ? (
                          <div className="spinner border-cream/30 border-t-cream" />
                        ) : (
                          mode === "signup" ? "Create Account" :
                          mode === "reset" ? "Send Reset Link" :
                          "Log In"
                        )}
                      </button>
                    </form>

                    {/* Benefits list (only for signup mode) */}
                    {mode === "signup" && (
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

                    {/* Mode switcher */}
                    <div className="mt-6 pt-6 border-t border-mist text-center">
                      {mode === "signup" ? (
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
                        <div className="space-y-2">
                          <p className="text-sm text-sage">
                            Remember your password?{" "}
                            <button
                              onClick={() => onModeChange?.("login")}
                              className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                            >
                              Back to login
                            </button>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-sage">
                            <button
                              onClick={() => onModeChange?.("reset")}
                              className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                            >
                              Forgot your password?
                            </button>
                          </p>
                          <p className="text-sm text-sage">
                            Don&apos;t have an account?{" "}
                            <button
                              onClick={() => onModeChange?.("signup")}
                              className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                            >
                              Create one for free
                            </button>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    <p className="mt-4 text-xs text-sage text-center">
                      By continuing, you agree to our Terms of Service and{" "}
                      <a href="/privacy" className="text-terracotta hover:text-terracotta-dark underline">
                        Privacy Policy
                      </a>.
                    </p>
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
