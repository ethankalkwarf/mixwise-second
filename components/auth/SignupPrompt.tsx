"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useUser } from "./UserProvider";
import { useAuthDialog } from "./AuthDialogProvider";

const SESSION_KEY = "mixwise-signup-prompt-dismissed";
const COOLDOWN_KEY = "mixwise-signup-prompt-until";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SignupPromptProps {
  /** Time on site before signup can open (default: 45s) */
  delayMs?: number;
  /** Meaningful clicks (links/buttons) before signup can open */
  clickThreshold?: number;
  /** Scroll depth (0–1) before signup can open */
  scrollThreshold?: number;
  enabled?: boolean;
}

function isCoolingDown(): boolean {
  if (typeof window === "undefined") return true;
  if (sessionStorage.getItem(SESSION_KEY) === "true") return true;
  const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  return Number.isFinite(until) && until > Date.now();
}

function markDismissed() {
  sessionStorage.setItem(SESSION_KEY, "true");
  localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
}

function isMeaningfulClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const el = target.closest("a, button, [role='button']");
  if (!el) return false;
  if (el.closest("[data-auth-dialog]")) return false;
  return true;
}

/**
 * Engagement-triggered signup: opens AuthDialog directly (Google / Apple / email)
 * after time, clicks, or scroll — no intermediate teaser modal.
 */
export function SignupPrompt({
  delayMs = 45_000,
  clickThreshold = 4,
  scrollThreshold = 0.5,
  enabled = true,
}: SignupPromptProps) {
  const { isAuthenticated, isLoading } = useUser();
  const { isOpen: authOpen, openSignupDialog } = useAuthDialog();
  const [blocked, setBlocked] = useState(true);

  const openedRef = useRef(false);
  const openedByUsRef = useRef(false);
  const clicksRef = useRef(0);
  const scrolledRef = useRef(false);
  const timedOutRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (Capacitor.isNativePlatform()) {
      setBlocked(true);
      return;
    }
    setBlocked(isCoolingDown());
  }, [enabled]);

  const tryOpen = useCallback(() => {
    if (openedRef.current || blocked || isAuthenticated || isLoading || authOpen) {
      return;
    }
    if (!(timedOutRef.current || clicksRef.current >= clickThreshold || scrolledRef.current)) {
      return;
    }

    openedRef.current = true;
    openedByUsRef.current = true;
    openSignupDialog({
      title: "Create your free MixWise account",
      subtitle: "Save your cabinet, favorites, and the drinks you've tried.",
      onSuccess: () => {
        markDismissed();
        setBlocked(true);
      },
    });
  }, [authOpen, blocked, clickThreshold, isAuthenticated, isLoading, openSignupDialog]);

  // Time on site
  useEffect(() => {
    if (!enabled || blocked || isAuthenticated || isLoading) return;

    const timer = window.setTimeout(() => {
      timedOutRef.current = true;
      tryOpen();
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [blocked, delayMs, enabled, isAuthenticated, isLoading, tryOpen]);

  // Clicks + scroll
  useEffect(() => {
    if (!enabled || blocked || isAuthenticated || isLoading) return;

    const onClick = (e: MouseEvent) => {
      if (!isMeaningfulClick(e.target)) return;
      clicksRef.current += 1;
      tryOpen();
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= scrollThreshold) {
        scrolledRef.current = true;
        tryOpen();
      }
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [blocked, enabled, isAuthenticated, isLoading, scrollThreshold, tryOpen]);

  // When auth closes: cool down if we opened it; otherwise retry if engaged
  useEffect(() => {
    if (authOpen) return;

    if (openedByUsRef.current) {
      openedByUsRef.current = false;
      markDismissed();
      setBlocked(true);
      return;
    }

    tryOpen();
  }, [authOpen, tryOpen]);

  // If they sign in another way, stop listening
  useEffect(() => {
    if (isAuthenticated) {
      openedRef.current = true;
      setBlocked(true);
    }
  }, [isAuthenticated]);

  return null;
}
