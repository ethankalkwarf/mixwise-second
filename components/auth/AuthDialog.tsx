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
  const { signInWithGoogle, signInWithEmail, isAuthenticated } = useUser();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default titles based on mode
  const defaultTitle = mode === "login" 
    ? "Welcome back to MixWise" 
    : "Create your free MixWise account";
  
  const displayTitle = title || defaultTitle;

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsEmailLoading(true);
    setError(null);
    
    const result = await signInWithEmail(email.trim());
    
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setIsEmailLoading(false);
    } else {
      setEmailSent(true);
      setIsEmailLoading(false);
      toast.success("Check your email for the magic link");
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close dialog"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {emailSent ? (
                  // Email sent confirmation
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-lime-400" />
                    </div>
                    <Dialog.Title className="text-xl font-serif font-bold text-slate-100 mb-2">
                      Check your email
                    </Dialog.Title>
                    <p className="text-slate-400 mb-6">
                      We sent a magic link to <span className="text-slate-200 font-medium">{email}</span>.
                      Click the link to sign in.
                    </p>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-sm text-lime-400 hover:text-lime-300"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                  // Sign in form
                  <>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="mx-auto w-14 h-14 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-slate-900 font-serif font-bold text-xl">MW</span>
                      </div>
                      <Dialog.Title className="text-xl font-serif font-bold text-slate-100 mb-2">
                        {displayTitle}
                      </Dialog.Title>
                      <p className="text-slate-400 text-sm">
                        {subtitle || (mode === "login" 
                          ? "Sign in to access your saved cocktails, bar inventory, and more."
                          : "Save your bar, favorite cocktails, and get personalized recommendations.")}
                      </p>
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Google sign in */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-slate-900 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                      {isGoogleLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <GoogleIcon className="w-5 h-5" />
                      )}
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-slate-900 px-3 text-slate-500">or</span>
                      </div>
                    </div>

                    {/* Email sign in */}
                    <form onSubmit={handleEmailSignIn}>
                      <div className="relative mb-4">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isEmailLoading || !email.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEmailLoading ? (
                          <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                          "Continue with email"
                        )}
                      </button>
                    </form>

                    {/* Benefits list (only for signup mode) */}
                    {mode === "signup" && (
                      <div className="mt-6 pt-6 border-t border-slate-800">
                        <p className="text-xs text-slate-500 text-center mb-3">Free accounts include:</p>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                            Save your home bar ingredients
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                            Favorite cocktails to find later
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                            Track your cocktail history
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Mode switcher */}
                    <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                      {mode === "signup" ? (
                        <p className="text-sm text-slate-400">
                          Already have an account?{" "}
                          <button
                            onClick={() => onModeChange?.("login")}
                            className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                          >
                            Log in
                          </button>
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">
                          Don&apos;t have an account?{" "}
                          <button
                            onClick={() => onModeChange?.("signup")}
                            className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                          >
                            Create one for free
                          </button>
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <p className="mt-4 text-xs text-slate-500 text-center">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
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

