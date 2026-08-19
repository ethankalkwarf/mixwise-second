"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { FireIcon } from "@heroicons/react/24/solid";
import { getPourStreak, POUR_STREAK_EVENT } from "@/lib/mobile/pourStreak";

type Props = {
  variant?: "light" | "dark";
};

/** Small streak indicator for the native home screen. */
export function PourStreakChip({ variant = "light" }: Props) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    setStreak(getPourStreak());

    const onUpdate = () => setStreak(getPourStreak());
    window.addEventListener(POUR_STREAK_EVENT, onUpdate);
    return () => window.removeEventListener(POUR_STREAK_EVENT, onUpdate);
  }, []);

  if (streak < 1) return null;

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
        isDark ? "bg-terracotta/10" : "bg-black/30 backdrop-blur-md"
      }`}
    >
      <FireIcon className={`h-4 w-4 ${isDark ? "text-terracotta" : "text-terracotta"}`} aria-hidden />
      <span className={`text-xs font-bold ${isDark ? "text-forest" : "text-cream"}`}>
        {streak}-day streak
      </span>
    </div>
  );
}
