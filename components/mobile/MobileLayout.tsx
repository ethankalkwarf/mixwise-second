"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ReactNode } from "react";
import { MobileTabBar } from "./MobileTabBar";

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * MobileLayout
 * 
 * Applies native iOS app-first design:
 * - Hides website navbar/footer on native platforms
 * - Adds bottom tab bar navigation
 * - Adds safe area padding for content
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  const [isNative, setIsNative] = useState(true); // Default to true since this is only called when native is detected

  useEffect(() => {
    // Double-check we're on native (should already be confirmed by ConditionalLayoutWrapper)
    if (typeof window !== "undefined" && window.Capacitor) {
      try {
        setIsNative(Capacitor.isNativePlatform());
      } catch (e) {
        console.error("Error checking native platform in MobileLayout:", e);
        setIsNative(true); // Default to native layout
      }
    }
  }, []);

  // On native, use app-first layout
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-cream via-cream to-mist/20" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
      {/* Main content with safe area padding */}
      <main 
        id="main-content" 
        className="flex-1 safe-area-content page-transition"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)", // Tab bar height (80px) + safe area
          minHeight: "100vh",
        }}
      >
        {children}
      </main>

      {/* Bottom tab bar navigation */}
      <MobileTabBar />
    </div>
  );
}
