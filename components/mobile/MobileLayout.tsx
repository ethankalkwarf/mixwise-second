"use client";

import { ReactNode, Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MobileTabBar } from "./MobileTabBar";
import { MobileAppProvider } from "./MobileAppProvider";
import { NativeIntroFlow, NativePostAuthNudge } from "./NativeIntroFlow";
import { NativeFirstWinCelebration } from "./NativeFirstWinCelebration";
import { NativeSignupNudge } from "./NativeSignupNudge";
import { OfflineBanner } from "./OfflineBanner";
import { NativeNavigationBridge } from "./NativeNavigationBridge";
import { BiometricGate } from "./BiometricGate";
import { isNativeApp } from "@/lib/mobile/platform";

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * Native iOS/Android shell: safe areas, contextual chrome, tab bar.
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const bleedTop = pathname === "/" || pathname === "/saved";

  // forceNative can SSR this shell from the cookie before the head script runs —
  // ensure html.native-app (and session flag) are set for AppLink / CSS hides.
  useEffect(() => {
    void isNativeApp();
    document.documentElement.classList.add("native-app");
    try {
      sessionStorage.setItem("mixwise_native", "1");
    } catch {
      // private mode
    }
  }, []);

  return (
    <MobileAppProvider>
      <NativeIntroFlow>
        <div
          className="min-h-[100dvh] bg-gradient-to-b from-cream via-cream to-mist/20"
          style={{ WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}
        >
          <main
            id="main-content"
            className="safe-area-content page-transition"
            style={{
              paddingTop: bleedTop ? 0 : "env(safe-area-inset-top, 0px)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4.75rem)",
            }}
          >
            <OfflineBanner />
            <NativeNavigationBridge />
            {children}
          </main>

          <Suspense fallback={null}>
            <MobileTabBar />
          </Suspense>
          <NativeSignupNudge />
          <NativePostAuthNudge />
          <NativeFirstWinCelebration />
          <BiometricGate />
        </div>
      </NativeIntroFlow>
    </MobileAppProvider>
  );
}
