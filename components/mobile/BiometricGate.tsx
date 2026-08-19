"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useUser } from "@/components/auth/UserProvider";
import {
  authenticateWithBiometric,
  isBiometricAvailable,
  isBiometricEnabled,
} from "@/lib/mobile/biometric";

/**
 * When biometric unlock is enabled, require Face ID / Touch ID after the app
 * returns from background (if the user was signed in).
 */
export function BiometricGate() {
  const { isAuthenticated, isLoading } = useUser();
  const [locked, setLocked] = useState(false);
  const wasBackground = useRef(false);
  const prompting = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") return;

    let handle: { remove: () => void } | null = null;

    void App.addListener("appStateChange", async ({ isActive }) => {
      if (!isActive) {
        wasBackground.current = true;
        return;
      }

      if (!wasBackground.current || isLoading || !isAuthenticated) return;
      wasBackground.current = false;

      const enabled = await isBiometricEnabled();
      if (!enabled || prompting.current) return;

      prompting.current = true;
      setLocked(true);

      const ok = await authenticateWithBiometric("Unlock MixWise");
      prompting.current = false;

      if (ok) {
        setLocked(false);
      } else {
        setLocked(true);
      }
    }).then((h) => {
      handle = h;
    });

    return () => {
      handle?.remove();
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    setLocked(false);
  }, [isAuthenticated, isLoading]);

  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream/95 px-8 backdrop-blur-md">
      <p className="font-display text-xl font-bold text-forest">Unlock MixWise</p>
      <p className="mt-2 text-center text-sm text-sage">Use Face ID or Touch ID to continue.</p>
      <button
        type="button"
        onClick={async () => {
          const ok = await authenticateWithBiometric("Unlock MixWise");
          if (ok) setLocked(false);
        }}
        className="mt-6 rounded-2xl bg-terracotta px-6 py-3 text-sm font-bold text-cream"
      >
        Try again
      </button>
    </div>
  );
}
