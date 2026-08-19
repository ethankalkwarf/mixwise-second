"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Capacitor } from "@capacitor/core";
import { clearCache, getLastSyncTime } from "@/lib/mobile/offline";
import { invalidateMixClientCaches } from "@/lib/cocktails";
import { formatOfflineSyncLabel } from "@/lib/mobile/offlineSync";

export function OfflineDataSettings() {
  const [native, setNative] = useState(false);
  const [syncLabel, setSyncLabel] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
    setSyncLabel(formatOfflineSyncLabel());
  }, [cleared]);

  if (!native) return null;

  const handleClear = async () => {
    if (clearing) return;

    const confirmed = window.confirm(
      "Clear saved offline recipes and catalog data? You'll need internet to browse recipes again until MixWise re-syncs."
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      await clearCache();
      invalidateMixClientCaches();
      setCleared(true);
      setSyncLabel(null);
    } catch (error) {
      console.error("[OfflineDataSettings] Clear failed:", error);
      window.alert("Couldn't clear offline data. Try again.");
    } finally {
      setClearing(false);
    }
  };

  const hasData = Boolean(getLastSyncTime());

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ArrowPathIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-sage" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-forest">Offline data</p>
          <p className="mt-0.5 text-xs text-sage">
            {cleared
              ? "Offline cache removed. Browse online to save recipes again."
              : syncLabel ??
                (hasData
                  ? "Recipes saved on this device for offline browsing."
                  : "No offline catalog saved yet. Open Mix or browse while online to cache recipes.")}
          </p>
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-mist px-3 py-2 text-xs font-semibold text-terracotta transition-colors hover:border-terracotta/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <TrashIcon className="h-4 w-4" />
            {clearing ? "Clearing…" : "Clear offline data"}
          </button>
        </div>
      </div>
    </div>
  );
}
