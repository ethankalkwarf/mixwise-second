"use client";

type AppRouterLike = {
  push: (href: string) => void;
};

/**
 * Stay inside the Capacitor WebView.
 * Full document loads (`location.assign`) and raw `<a href>` on the live-reload
 * http URL are handed to Safari by iOS.
 */
export function navigateInApp(router: AppRouterLike, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return;
  }
  router.push(href);
}
