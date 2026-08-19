"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Keyboard, KeyboardStyle } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { debugLog } from "@/lib/debugLog";
import { initializeNotifications, registerNotificationDeepLinks, refreshDailyNotificationIfNeeded } from "@/lib/mobile/notifications";
import { registerNativeOAuthListener } from "@/lib/mobile/nativeOAuth";
import { prefetchNativeCatalog } from "@/lib/mobile/prefetchNativeData";
import { requestInAppNavigation } from "@/lib/mobile/deepLinks";

/**
 * CapacitorProvider
 *
 * Initializes Capacitor native plugins for mobile apps.
 * Only runs on native platforms (iOS/Android), not in web browser.
 */
export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let unregisterOAuth = () => {};
    let unregisterNotifications = () => {};
    let backButtonHandle: { remove: () => void } | null = null;
    let appStateHandle: { remove: () => void } | null = null;

    const initializeCapacitor = async () => {
      try {
        if (Capacitor.getPlatform() === "ios") {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: Style.Dark });
        }

        // Keep the splash up until the first paint, then hide. Auto-hide on a
        // timer left a white WebView while Next was still loading.
        const hideSplash = () => {
          void SplashScreen.hide().catch(() => {});
        };
        requestAnimationFrame(() => requestAnimationFrame(hideSplash));
        window.setTimeout(hideSplash, 2800);

        await Keyboard.setAccessoryBarVisible({ isVisible: true });
        await Keyboard.setStyle({ style: KeyboardStyle.Light });

        appStateHandle = await App.addListener("appStateChange", ({ isActive }) => {
          debugLog("[Capacitor] App state changed. Is active:", isActive);
          if (isActive) {
            void refreshDailyNotificationIfNeeded();
          }
        });

        unregisterOAuth = registerNativeOAuthListener();

        backButtonHandle = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          }
        });

        await initializeNotifications();
        unregisterNotifications = registerNotificationDeepLinks();

        prefetchNativeCatalog();

        const launch = await App.getLaunchUrl();
        if (launch?.url) {
          try {
            const path = new URL(launch.url).pathname;
            if (path.startsWith("/")) {
              requestInAppNavigation(path);
            }
          } catch {
            /* ignore malformed launch URLs */
          }
        }

        debugLog("[Capacitor] Native plugins initialized");
      } catch (error) {
        console.error("[Capacitor] Error initializing plugins:", error);
      }
    };

    void initializeCapacitor();

    return () => {
      unregisterOAuth();
      unregisterNotifications();
      backButtonHandle?.remove();
      appStateHandle?.remove();
    };
  }, []);

  return <>{children}</>;
}
