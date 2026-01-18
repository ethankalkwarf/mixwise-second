"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { ReactNode } from "react";

interface ConditionalLayoutWrapperProps {
  children: ReactNode;
}

// Pages that should hide the navbar
const NO_NAVBAR_PAGES = ["/thirsty-thursday"];

export function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname();
  const hideNavbar = NO_NAVBAR_PAGES.some(path => pathname === path || pathname.startsWith(path + "/"));

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
