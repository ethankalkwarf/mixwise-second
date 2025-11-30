"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/components/auth/UserProvider";

const VIEWS_KEY = "mixwise-cocktail-views";
const DISMISSED_KEY = "mixwise-email-modal-dismissed";
const VIEW_THRESHOLD = 3;

interface EmailCaptureModalProps {
  source?: string;
}

export function EmailCaptureModal({ source = "cocktail_guide" }: EmailCaptureModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useUser();
  const toast = useToast();
  const supabase = createClient();

  // Track views and show modal after threshold
  useEffect(() => {
    // Don't show for authenticated users
    if (isAuthenticated) return;

    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Get current view count
    const views = parseInt(localStorage.getItem(VIEWS_KEY) || "0", 10);
    
    // Increment and check threshold
    const newViews = views + 1;
    localStorage.setItem(VIEWS_KEY, newViews.toString());

    if (newViews >= VIEW_THRESHOLD) {
      // Delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(DISMISSED_KEY, "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("email_signups")
        .insert({
          email: email.trim().toLowerCase(),
          source,
        });

      if (dbError) {
        // Ignore duplicate errors
        if (dbError.code === "23505") {
          setIsSuccess(true);
        } else {
          throw dbError;
        }
      } else {
        setIsSuccess(true);
        // Track signup
        if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).trackEmailSignup) {
          ((window as unknown as Record<string, unknown>).trackEmailSignup as (email: string, source: string) => void)(email, source);
        }
      }
    } catch (err) {
      console.error("Email signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setEmail("");
      setIsSuccess(false);
      setError(null);
    }, 300);
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
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {isSuccess ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-lime-400" />
                    </div>
                    <Dialog.Title className="text-xl font-serif font-bold text-slate-100 mb-2">
                      You&apos;re in!
                    </Dialog.Title>
                    <p className="text-slate-400 mb-6">
                      Check your inbox for the cocktail guide and weekly inspiration.
                    </p>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors"
                    >
                      Continue browsing
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Icon */}
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                      <SparklesIcon className="w-7 h-7 text-white" />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                      <Dialog.Title className="text-xl font-serif font-bold text-slate-100 mb-2">
                        Get Our Free Cocktail Guide
                      </Dialog.Title>
                      <p className="text-slate-400 text-sm">
                        Learn the essentials of home bartending with our free guide + weekly cocktail inspiration.
                      </p>
                    </div>

                    {/* What you get */}
                    <ul className="space-y-2 mb-6 text-sm text-slate-400">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                        Essential bar tools checklist
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                        10 classic cocktail recipes
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full" />
                        Weekly cocktail picks in your inbox
                      </li>
                    </ul>

                    {/* Error */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 mb-4"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !email.trim()}
                        className="w-full px-4 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Get the free guide"
                        )}
                      </button>
                    </form>

                    {/* Privacy note */}
                    <p className="mt-4 text-xs text-slate-500 text-center">
                      No spam. Unsubscribe anytime.
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

