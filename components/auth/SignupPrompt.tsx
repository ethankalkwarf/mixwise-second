"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "./UserProvider";
import { useAuthDialog } from "./AuthDialogProvider";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, SparklesIcon, ClockIcon, HeartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

interface SignupPromptProps {
  /** Delay in milliseconds after page load before showing the prompt (default: 7000ms = 7 seconds) */
  delay?: number;
  /** Whether the prompt is enabled */
  enabled?: boolean;
}

export function SignupPrompt({ delay = 7000, enabled = true }: SignupPromptProps) {
  const { isAuthenticated, isLoading } = useUser();
  const { openSignupDialog } = useAuthDialog();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Check if user has already dismissed the prompt in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("mixwise-signup-prompt-dismissed");
      if (dismissed === "true") {
        setHasBeenDismissed(true);
      }
    }
  }, []);

  // Listen for page load event to ensure all images and resources are loaded
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleLoad = () => {
        setPageLoaded(true);
      };

      // If page is already loaded, set immediately
      if (document.readyState === 'complete') {
        setPageLoaded(true);
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  // Timer logic to show prompt after both delay AND page load
  // This ensures all images and content are loaded before showing the prompt for better UX
  useEffect(() => {
    if (!enabled || isAuthenticated || isLoading || hasBeenDismissed || !pageLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, isAuthenticated, isLoading, hasBeenDismissed, pageLoaded, delay]);

  // Don't show if conditions aren't met
  if (!enabled || isAuthenticated || isLoading || hasBeenDismissed || !isVisible) {
    return null;
  }

  const handleSignup = () => {
    openSignupDialog({
      title: "Create your free MixWise account",
      subtitle: "Join thousands of cocktail enthusiasts and unlock personalized recommendations!",
      onSuccess: () => {
        setIsVisible(false);
        // Mark as dismissed to prevent showing again
        sessionStorage.setItem("mixwise-signup-prompt-dismissed", "true");
      },
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    // Store dismissal in session storage
    sessionStorage.setItem("mixwise-signup-prompt-dismissed", "true");
  };

  return (
    <Transition appear show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleDismiss}>
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
          <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal content */}
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white border border-mist p-6 text-left align-middle shadow-card-hover transition-all">
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-1 rounded-xl text-sage hover:text-forest hover:bg-mist transition-colors"
                  aria-label="Close signup prompt"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mb-4">
                    <SparklesIcon className="w-8 h-8 text-terracotta" />
                  </div>
                  <Dialog.Title className="text-xl font-serif font-bold text-forest mb-2">
                    Ready to Mix Like a Pro?
                  </Dialog.Title>
                  <p className="text-sage text-sm">
                    Join MixWise and discover cocktails you'll love!
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-charcoal">
                    <HeartIcon className="w-4 h-4 text-olive flex-shrink-0" />
                    <span>Save your favorite cocktails</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal">
                    <MagnifyingGlassIcon className="w-4 h-4 text-olive flex-shrink-0" />
                    <span>Get personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-charcoal">
                    <ClockIcon className="w-4 h-4 text-olive flex-shrink-0" />
                    <span>Track your cocktail history</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSignup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-2xl transition-all shadow-lg shadow-terracotta/20"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Create Free Account
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="w-full px-4 py-2 text-sage hover:text-forest text-sm font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}