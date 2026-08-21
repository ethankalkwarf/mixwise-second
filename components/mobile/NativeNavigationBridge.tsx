"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NATIVE_NAV_EVENT } from "@/lib/mobile/deepLinks";
import { navigateInApp } from "@/lib/mobile/navigate";
import { isNativeApp } from "@/lib/mobile/platform";

function sameOriginPath(href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Bridges deep links and keeps same-origin anchors inside the WebView (not Safari). */
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

  // MobileLayout only mounts this bridge in the native shell — always keep
  // same-origin anchors on the client router so iOS never hands them to Safari.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const path = sameOriginPath(href);
      if (!path) return;

      // Ensure the native flag/class is set for other helpers (AppLink, CSS).
      void isNativeApp();

      // Intercept target=_blank too — same-origin blanks open Safari in Capacitor.
      event.preventDefault();
      event.stopPropagation();
      navigateInApp(router, path);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
