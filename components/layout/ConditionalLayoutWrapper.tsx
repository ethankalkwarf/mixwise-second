"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import type { MegaMenuData } from "@/lib/megaMenu";
import type { ReactNode } from "react";

export function ConditionalLayoutWrapper({
  children,
  megaMenu,
}: {
  children: ReactNode;
  megaMenu?: MegaMenuData;
}) {
  const pathname = usePathname();
  const nativeShell = useNativeShell();

  if (pathname.startsWith("/dev") || pathname.startsWith("/brand-preview")) {
    return <>{children}</>;
  }

  if (nativeShell) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div data-web-chrome>
        <Navbar megaMenu={megaMenu} />
      </div>
      <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
        {children}
      </main>
      <div data-web-chrome>
        <SiteFooter />
        <MobileBottomNav />
      </div>
    </div>
  );
}
