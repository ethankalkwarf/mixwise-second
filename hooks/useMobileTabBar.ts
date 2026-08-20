"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_MOBILE_TAB_BAR,
  getTabBarConfig,
  normalizeTabBar,
  resetTabBarConfig,
  resolveTabDestinations,
  saveTabBarConfig,
  TAB_BAR_CONFIG_EVENT,
  type MobileTabDestination,
  type MobileTabDestinationId,
} from "@/lib/mobile/tabBarConfig";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TAB_BAR_CONFIG_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(TAB_BAR_CONFIG_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedSnapshot = DEFAULT_MOBILE_TAB_BAR;
let cachedSnapshotKey = JSON.stringify(DEFAULT_MOBILE_TAB_BAR);

function getSnapshot(): MobileTabDestinationId[] {
  const next = getTabBarConfig();
  const key = JSON.stringify(next);
  if (key !== cachedSnapshotKey) {
    cachedSnapshotKey = key;
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): MobileTabDestinationId[] {
  return DEFAULT_MOBILE_TAB_BAR;
}

export function useMobileTabBar(): {
  bar: MobileTabDestinationId[];
  tabs: MobileTabDestination[];
  setBar: (slots: MobileTabDestinationId[]) => MobileTabDestinationId[];
  resetBar: () => MobileTabDestinationId[];
  setSlot: (index: number, destination: MobileTabDestinationId) => MobileTabDestinationId[];
} {
  const bar = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const tabs = useMemo(() => resolveTabDestinations(bar), [bar]);

  const setBar = useCallback((slots: MobileTabDestinationId[]) => saveTabBarConfig(slots), []);

  const resetBar = useCallback(() => resetTabBarConfig(), []);

  const setSlot = useCallback(
    (index: number, destination: MobileTabDestinationId) => {
      const next = [...bar];
      const existingIndex = next.indexOf(destination);
      if (existingIndex >= 0 && existingIndex !== index) {
        next[existingIndex] = next[index];
      }
      next[index] = destination;
      return saveTabBarConfig(normalizeTabBar(next));
    },
    [bar]
  );

  return { bar, tabs, setBar, resetBar, setSlot };
}
