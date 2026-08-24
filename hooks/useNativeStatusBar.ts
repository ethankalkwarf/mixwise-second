"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

type StatusBarLook = "cream" | "photo";

/**
 * Capacitor naming is inverted from intuition:
 * - Style.Light → dark icons (for cream / light screens)
 * - Style.Dark → white icons (for photo / dark heroes)
 */
export function useNativeStatusBar(look: StatusBarLook) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const style = look === "photo" ? Style.Dark : Style.Light;
    void StatusBar.setStyle({ style }).catch(() => {});
    return () => {
      void StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    };
  }, [look]);
}
