"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  isNotificationEnabled,
  requestNotificationPermissions,
  setNotificationEnabled,
} from "@/lib/mobile/notifications";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { FIRST_WIN_EVENT } from "@/lib/mobile/firstWin";
import { readCabinetReadyCount } from "@/lib/mobile/guestData";
import { trackNotificationPermission } from "@/lib/analytics";

const DISMISS_KEY = "mixwise-notif-ask-dismissed";

/**
 * Ask for daily Drink of the Day after the guest's first pourable win or a stocked cabinet.
 */
export function NativeNotificationPrompt() {
  const { ingredientIds } = useBarIngredients();
  const [readyCount, setReadyCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setReadyCount(readCabinetReadyCount());
    const onFirstWin = (event: Event) => {
      const detail = (event as CustomEvent<{ readyCount?: number }>).detail;
      setReadyCount(detail?.readyCount ?? readCabinetReadyCount());
    };
    window.addEventListener(FIRST_WIN_EVENT, onFirstWin);
    return () => window.removeEventListener(FIRST_WIN_EVENT, onFirstWin);
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const hasValue = readyCount >= 1 || ingredientIds.length >= 3;
    if (!hasValue) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      return;
    }

    let cancelled = false;
    void isNotificationEnabled().then((enabled) => {
      if (!cancelled && !enabled) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ingredientIds.length, readyCount]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const enable = async () => {
    const granted = await requestNotificationPermissions();
    void trackNotificationPermission(granted, { surface: "native_prompt" });
    if (granted) {
      await setNotificationEnabled(true);
    }
    dismiss();
  };

  const subtitle =
    readyCount >= 1
      ? `We'll ping you when today's pick drops — you've got ${readyCount} drink${readyCount === 1 ? "" : "s"} ready now.`
      : "A short, friendly ping when today's recipe drops — tap to open it.";

  return (
    <div className="mb-9 rounded-[1.75rem] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">Daily ritual</p>
      <p className="mt-1 font-display text-lg font-bold text-forest">Get Drink of the Day</p>
      <p className="mt-1 text-sm text-sage">{subtitle}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void enable()}
          className="flex-1 rounded-2xl bg-terracotta py-2.5 text-sm font-bold text-cream"
        >
          Notify me
        </button>
        <button type="button" onClick={dismiss} className="rounded-2xl px-4 py-2.5 text-sm font-medium text-sage">
          Not now
        </button>
      </div>
    </div>
  );
}
