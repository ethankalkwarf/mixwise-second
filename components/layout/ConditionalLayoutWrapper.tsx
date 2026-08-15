"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Capacitor } from "@capacitor/core";
import type { MegaMenuData } from "@/lib/megaMenu";

function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    // Capacitor may not be initialized on web
  }

  const href = window.location.href;
  return (
    window.location.protocol === "capacitor:" ||
    href.includes("capacitor://") ||
    href.includes("ionic://")
  );
}

export function ConditionalLayoutWrapper({
  children,
  megaMenu,
}: {
  children: ReactNode;
  megaMenu?: MegaMenuData;
}) {
  const pathname = usePathname();
  const [isNative, setIsNative] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsNative(isCapacitorNative());
  }, []);

  if (pathname.startsWith("/dev")) {
    return <>{children}</>;
  }

  if (!isMounted || !isNative) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar megaMenu={megaMenu} />
        <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav />
      </div>
    );
  }

  return <MobileLayout>{children}</MobileLayout>;
}
