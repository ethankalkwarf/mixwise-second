"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { MixwiseShake } from "@/lib/mobile/shakePlugin";

const SHAKE_DELTA_THRESHOLD = 18;
const SHAKE_LINEAR_THRESHOLD = 12;
const NATIVE_SHAKE_THRESHOLD = 1.85;
const SHAKE_COOLDOWN_MS = 1600;
const SHAKE_PREF_KEY = "mixwise-shake-granted";

type DeviceMotionCtor = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export type ShakePermission = "unknown" | "granted" | "denied" | "unavailable";

function rememberGranted() {
  try {
    window.localStorage.setItem(SHAKE_PREF_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Detects a physical shake.
 * Native iOS uses Core Motion (WKWebView never shows Safari's motion prompt).
 * Web Safari still uses DeviceMotionEvent.requestPermission.
 */
export function useShakeGesture(onShake: () => void, enabled: boolean) {
  const [permission, setPermission] = useState<ShakePermission>("unknown");
  const lastShake = useRef(0);
  const lastSample = useRef({ x: 0, y: 0, z: 0, ready: false });
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const fireShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShake.current < SHAKE_COOLDOWN_MS) return;
    lastShake.current = now;
    onShakeRef.current();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await MixwiseShake.start();
        if (result.available) {
          setPermission("granted");
          rememberGranted();
          return true;
        }
        setPermission("unavailable");
        return false;
      } catch {
        setPermission("unavailable");
        return false;
      }
    }

    if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
      setPermission("unavailable");
      return false;
    }

    const Motion = DeviceMotionEvent as DeviceMotionCtor;
    if (typeof Motion.requestPermission === "function") {
      try {
        const result = await Motion.requestPermission();
        const granted = result === "granted";
        setPermission(granted ? "granted" : "denied");
        if (granted) rememberGranted();
        return granted;
      } catch {
        setPermission("denied");
        return false;
      }
    }

    setPermission("granted");
    rememberGranted();
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (Capacitor.isNativePlatform()) return;
    try {
      if (window.localStorage.getItem(SHAKE_PREF_KEY) === "1") {
        setPermission("granted");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (Capacitor.isNativePlatform()) {
      let handle: { remove: () => Promise<void> } | null = null;
      let cancelled = false;

      void (async () => {
        try {
          const result = await MixwiseShake.start();
          if (cancelled) {
            await MixwiseShake.stop().catch(() => {});
            return;
          }
          if (!result.available) {
            setPermission("unavailable");
            return;
          }
          setPermission("granted");
          handle = await MixwiseShake.addListener("accel", (event) => {
            const mag = Math.sqrt(event.x ** 2 + event.y ** 2 + event.z ** 2);
            if (mag > NATIVE_SHAKE_THRESHOLD) fireShake();
          });
        } catch {
          if (!cancelled) setPermission("unavailable");
        }
      })();

      return () => {
        cancelled = true;
        void handle?.remove();
        void MixwiseShake.stop().catch(() => {});
      };
    }

    if (permission !== "granted" || typeof DeviceMotionEvent === "undefined") return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const linear = event.acceleration;
      if (linear && (linear.x != null || linear.y != null || linear.z != null)) {
        const mag = Math.sqrt((linear.x ?? 0) ** 2 + (linear.y ?? 0) ** 2 + (linear.z ?? 0) ** 2);
        if (mag > SHAKE_LINEAR_THRESHOLD) fireShake();
        return;
      }

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;

      if (!lastSample.current.ready) {
        lastSample.current = { x, y, z, ready: true };
        return;
      }

      const delta =
        Math.abs(x - lastSample.current.x) +
        Math.abs(y - lastSample.current.y) +
        Math.abs(z - lastSample.current.z);
      lastSample.current = { x, y, z, ready: true };

      if (delta > SHAKE_DELTA_THRESHOLD) fireShake();
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [enabled, fireShake, permission]);

  return { permission, requestPermission };
}
