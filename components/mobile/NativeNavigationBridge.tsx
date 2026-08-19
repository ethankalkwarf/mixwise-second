"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NATIVE_NAV_EVENT } from "@/lib/mobile/deepLinks";
import { navigateInApp } from "@/lib/mobile/navigate";

/** Bridges notification taps and cold-start URLs into Next client navigation. */
export function NativeNavigationBridge() {
  const router = useRouter();

  useEffect(() => {
    const onNav = (event: Event) => {
      const href = (event as CustomEvent<{ href: string }>).detail?.href;
      if (href) navigateInApp(router, href);
    };

    window.addEventListener(NATIVE_NAV_EVENT, onNav);
    return () => window.removeEventListener(NATIVE_NAV_EVENT, onNav);
  }, [router]);

  return null;
}
