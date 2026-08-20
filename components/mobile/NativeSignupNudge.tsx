"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { hasLikelyAccount } from "@/lib/auth/returning-user";
import { isNativeApp } from "@/lib/mobile/platform";
import {
  GUEST_ENGAGEMENT_EVENT,
  guestIsHooked,
  isGuestNudgeSnoozed,
  snoozeGuestNudge,
} from "@/lib/mobile/guestEngagement";

/**
 * Soft, dismissible signup after the guest has actually used MixWise.
 * Never blocks the app — favorites, notes, and Mix still prompt in context.
 */
export function NativeSignupNudge() {
  const { isAuthenticated, isLoading } = useUser();
  const { openAuthDialog, isOpen } = useAuthDialog();
  const [native] = useState(() => (typeof window !== "undefined" ? isNativeApp() : false));
  const [visible, setVisible] = useState(false);
  const returning = hasLikelyAccount();

  const [hooked, setHooked] = useState(false);

  useEffect(() => {
    const refresh = () => setHooked(guestIsHooked());
    refresh();
    window.addEventListener(GUEST_ENGAGEMENT_EVENT, refresh);
    return () => window.removeEventListener(GUEST_ENGAGEMENT_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (!native || isLoading || isAuthenticated || isOpen) {
      setVisible(false);
      return;
    }
    if (isGuestNudgeSnoozed() || !hooked) return;

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [native, isLoading, isAuthenticated, isOpen, hooked]);

  if (!visible) return null;

  const dismiss = () => {
    snoozeGuestNudge();
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-[70] mx-auto max-w-md">
      <div className="rounded-2xl border border-mist/60 bg-white p-4 shadow-xl shadow-charcoal/12">
        <p className="font-display text-base font-bold text-forest">
          {returning ? "Keep this bar in sync" : "Save what you've built"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-sage">
          {returning
            ? "Sign in to restore favorites and bottles across devices."
            : "Create a free account so your cabinet and saved drinks aren't lost on this phone."}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              openAuthDialog({
                gate: "native_signup_nudge",
                mode: returning ? "login" : "signup",
                dismissible: true,
                title: returning ? "Welcome back" : "Save your bar",
                subtitle: returning
                  ? "Sign in to pick up your cabinet and favorites."
                  : "Free forever. Takes about a minute.",
              });
            }}
            className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-cream"
          >
            {returning ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-sage"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
