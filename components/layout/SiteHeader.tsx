"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  navItems: NavItem[];
}

export function SiteHeader({ navItems }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 shadow-lg shadow-lime-500/20 flex items-center justify-center text-sm font-serif font-bold text-slate-900">
              MW
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold tracking-tight text-xl text-slate-100">
                MixWise
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Second Instance
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive
                    ? "text-lime-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth section placeholder - can add login button here later */}
        <div className="flex items-center gap-3" />
      </div>
    </header>
  );
}
