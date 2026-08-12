"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { debugLog } from "@/lib/debugLog";
// All Capacitor plugins temporarily disabled due to Swift API compatibility issues with Capacitor 8.0.0
// Plugins will be re-enabled once compatible versions are available
// import { StatusBar, Style } from "@capacitor/status-bar";
// import { SplashScreen } from "@capacitor/splash-screen";
// import { Share } from "@capacitor/share";
// import { App } from "@capacitor/app";
// import { Keyboard } from "@capacitor/keyboard";
// import { Network } from "@capacitor/network";
// import { initializeNotifications } from "@/lib/mobile/notifications";

/**
 * CapacitorProvider
 * 
 * Initializes Capacitor native plugins for mobile apps.
 * Only runs on native platforms (iOS/Android), not in web browser.
 */
export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initializeCapacitor = async () => {
      try {
        // Temporarily disabled due to Swift API compatibility issues
        // Configure Status Bar
        // if (Capacitor.getPlatform() === 'ios') {
        //   await StatusBar.setStyle({ style: Style.Dark });
        //   await StatusBar.setBackgroundColor({ color: '#F9F7F2' });
        // }

        // Hide Splash Screen after app is ready
        // await SplashScreen.hide();

        // All plugin functionality temporarily disabled due to Swift API compatibility issues
        // Configure Keyboard
        // Keyboard.setAccessoryBarVisible({ isVisible: true });
        // Keyboard.setResizeMode({ mode: 'native' });
        // Keyboard.setScroll({ isDisabled: false });
        // Keyboard.setStyle({ style: 'light' });

        // Listen for app state changes
        // App.addListener('appStateChange', ({ isActive }) => {
        //   debugLog('[Capacitor] App state changed. Is active:', isActive);
        // });

        // Listen for app URL open (deep linking)
        // App.addListener('appUrlOpen', ({ url }) => {
        //   debugLog('[Capacitor] App opened with URL:', url);
        // });

        // Listen for back button (Android)
        // App.addListener('backButton', ({ canGoBack }) => {
        //   if (canGoBack) {
        //     window.history.back();
        //   } else {
        //     App.exitApp();
        //   }
        // });

        // Monitor network status
        // Network.addListener('networkStatusChange', (status) => {
        //   debugLog('[Capacitor] Network status changed:', status);
        // });

        // Initialize notifications
        // await initializeNotifications();

        debugLog('[Capacitor] Native plugins initialized');
      } catch (error) {
        console.error('[Capacitor] Error initializing plugins:', error);
      }
    };

    initializeCapacitor();
  }, []);

  return <>{children}</>;
}
