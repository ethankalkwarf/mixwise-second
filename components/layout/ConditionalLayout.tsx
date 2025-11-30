"use client";

import { usePathname } from "next/navigation";
import { SiteHeader, NavItem } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BrutalHeader } from "./BrutalHeader";
import { BrutalFooter } from "./BrutalFooter";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

// Pages that should use the Neo-Brutalist design
const BRUTALIST_PAGES: string[] = []; // Currently no pages use brutalist design

export function ConditionalLayout({ children, navItems }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isBrutalistPage = BRUTALIST_PAGES.includes(pathname);

  if (isBrutalistPage) {
    // Neo-Brutalist Layout (light theme with hard shadows)
    return (
      <div className="min-h-screen flex flex-col">
        <BrutalHeader navItems={navItems} />
        <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
          {children}
        </main>
        <BrutalFooter />
      </div>
    );
  }

  // Default Dark Layout
  return (
    <>
      {/* Dark background gradient */}
      <div 
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" 
        aria-hidden="true" 
      />
      <div className="min-h-screen flex flex-col">
        <SiteHeader navItems={navItems} />
        <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

