"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";
import { isLearnPublic } from "@/lib/learnAccess";
import { useUser } from "@/components/auth/UserProvider";
import { EmailListCapture } from "@/components/email/EmailListCapture";

type FooterLink = {
  label: string;
  href: string;
  learnOnly?: boolean;
};

type FooterColumn = {
  title: string;
  ariaLabel: string;
  links: FooterLink[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Drink",
    ariaLabel: "Drink",
    links: [
      { label: "Cocktail Recipes", href: "/cocktails" },
      { label: "Collections", href: "/occasions" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "What Can I Make", href: "/mix" },
      { label: "Drink of the Day", href: "/cocktail-of-the-day" },
    ],
  },
  {
    title: "Learn",
    ariaLabel: "Learn mixology",
    links: [
      { label: "Learn Mixology", href: "/learn", learnOnly: true },
      { label: "Beginner Course", href: "/learn/paths/first-month-home", learnOnly: true },
      { label: "Smart Swaps", href: "/learn/swaps", learnOnly: true },
    ],
  },
  {
    title: "About",
    ariaLabel: "About MixWise",
    links: [
      { label: "About MixWise", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function FooterEmailCapture() {
  return <EmailListCapture source="footer" variant="dark" />;
}

function FooterNavColumn({ title, ariaLabel, links }: FooterColumn) {
  if (links.length === 0) return null;

  return (
    <nav aria-label={ariaLabel}>
      <h3 className="font-mono text-xs font-bold text-cream/80 uppercase tracking-widest mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-stone hover:text-cream transition-colors text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { isAuthenticated } = useUser();
  const learnPublic = isLearnPublic();
  const columns = FOOTER_COLUMNS.map((column) => ({
    ...column,
    links: column.links.filter((link) => learnPublic || !link.learnOnly),
  }));

  return (
    <footer className="bg-forest mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & email capture */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6">
            <div className="mb-4">
              <BrandLogo variant="light" size="lg" />
            </div>
            <p className="text-stone text-sm leading-relaxed max-w-sm mb-6">
              A home bar, made easier. Discover recipes, mix with what you have,
              keep tasting notes, and skip drinks you won&apos;t remake.
            </p>
            {isAuthenticated ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark"
                >
                  Dashboard
                </Link>
                <Link
                  href="/mix"
                  className="inline-flex items-center rounded-full border border-cream/20 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:border-cream/40"
                >
                  Open Mix
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-cream/80">
                  New cocktails every week
                </p>
                <FooterEmailCapture />
              </>
            )}
          </div>

          {columns
            .filter((column) => column.links.length > 0)
            .map((column) => (
              <div key={column.title} className="lg:col-span-2">
                <FooterNavColumn {...column} />
              </div>
            ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone/70 text-sm">
            © {year} MixWise. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone/70 hover:text-cream text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
