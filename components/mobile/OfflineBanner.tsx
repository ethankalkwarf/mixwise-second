"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { online, native } = useNetworkStatus();

  if (!native || online) return null;

  return (
    <div
      className="sticky top-0 z-40 border-b border-terracotta/20 bg-terracotta/10 px-4 py-2 text-center text-xs font-semibold text-forest"
      role="status"
    >
      You&apos;re offline — saved recipes and your last catalog sync still work.
    </div>
  );
}
