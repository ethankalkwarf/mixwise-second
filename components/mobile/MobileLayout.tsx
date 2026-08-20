"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { MobileTabBar } from "./MobileTabBar";
import { MobileAppProvider } from "./MobileAppProvider";
import { NativeIntroFlow, NativePostAuthNudge } from "./NativeIntroFlow";
import { NativeFirstWinCelebration } from "./NativeFirstWinCelebration";
import { NativeSignupNudge } from "./NativeSignupNudge";
import { OfflineBanner } from "./OfflineBanner";
import { NativeNavigationBridge } from "./NativeNavigationBridge";
import { BiometricGate } from "./BiometricGate";

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * Native iOS/Android shell: safe areas, contextual chrome, tab bar.
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const bleedTop = pathname === "/" || pathname === "/saved";

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
