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

const SNOOZE_KEY = "mixwise-notif-ask-snooze";
const LEGACY_DISMISS_KEY = "mixwise-notif-ask-dismissed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function isSnoozed(): boolean {
  try {
    // Migrate permanent dismiss → one-week snooze so we can ask again.
    if (localStorage.getItem(LEGACY_DISMISS_KEY) === "1") {
      localStorage.removeItem(LEGACY_DISMISS_KEY);
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
      return true;
    }
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (!Number.isFinite(until)) return false;
    if (Date.now() < until) return true;
    localStorage.removeItem(SNOOZE_KEY);
    return false;
  } catch {
    return true;
  }
}

/**
 * Ask for daily Drink of the Day after the guest's first pourable win or a stocked cabinet.
 * Shown on Home — not buried in settings.
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
    if (isSnoozed()) return;

    let cancelled = false;
    void isNotificationEnabled().then((enabled) => {
      if (!cancelled && !enabled) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ingredientIds.length, readyCount]);

  if (!visible) return null;

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
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
    snooze();
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
        <button type="button" onClick={snooze} className="rounded-2xl px-4 py-2.5 text-sm font-medium text-sage">
          Not now
        </button>
      </div>
    </div>
  );
}
