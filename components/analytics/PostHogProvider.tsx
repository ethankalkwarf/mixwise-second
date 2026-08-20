"use client";

import { Suspense, useEffect, useRef } from "react";
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
 * Initializes PostHog and identifies the signed-in user.
 * Pageviews live in a nested Suspense boundary so useSearchParams
 * never blanks the whole app tree.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useUser();
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

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
    </>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isAnalyticsEnabled()) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (lastPath.current === url) return;
    lastPath.current = url;
    capturePageview(url);
  }, [pathname, searchParams]);

  return null;
}
