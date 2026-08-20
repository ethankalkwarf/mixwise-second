"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  capturePageview,
  identifyUser,
  initAnalytics,
  isAnalyticsEnabled,
  resetAnalyticsUser,
} from "@/lib/analytics/client";
import { useUser } from "@/components/auth/UserProvider";

/**
 * Initializes PostHog, identifies the signed-in user, and records App Router pageviews.
 * Safe when NEXT_PUBLIC_POSTHOG_KEY is missing (no-op).
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (isLoading || !isAnalyticsEnabled()) return;

    if (isAuthenticated && user?.id) {
      if (identifiedId.current !== user.id) {
        identifyUser(user.id, user.email ? { email: user.email } : undefined);
        identifiedId.current = user.id;
      }
    } else if (identifiedId.current) {
      resetAnalyticsUser();
      identifiedId.current = null;
    }
  }, [isAuthenticated, isLoading, user?.id, user?.email]);

  useEffect(() => {
    if (!pathname || !isAnalyticsEnabled()) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (lastPath.current === url) return;
    lastPath.current = url;
    capturePageview(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
