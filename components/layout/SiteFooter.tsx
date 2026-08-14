"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";
import { isLearnPublic } from "@/lib/learnAccess";
import { useUser } from "@/components/auth/UserProvider";
import { EmailListCapture } from "@/components/email/EmailListCapture";

const FOOTER_LINKS = {
  explore: [
    { label: "Browse Cocktail Recipes", href: "/cocktails" },
    { label: "Ingredient Guides", href: "/ingredients" },
    { label: "Open Mixology Wizard", href: "/mix" },
  ],
  learn: [
    { label: "Learn Mixology", href: "/learn", learnOnly: true },
    { label: "Smart Swaps", href: "/learn/swaps", learnOnly: true },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

function FooterEmailCapture() {
  return <EmailListCapture source="footer" variant="dark" />;
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { isAuthenticated } = useUser();
  const learnLinks = FOOTER_LINKS.learn.filter(
    (link) => isLearnPublic() || !("learnOnly" in link && link.learnOnly)
  );

  return (
    <footer className="bg-forest mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & email capture */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <BrandLogo variant="light" size="lg" />
            </div>
            <p className="text-stone text-sm leading-relaxed max-w-sm mb-6">
              A home bar, made easier. Discover recipes, learn techniques,
              and find drinks you can make with what you have.
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

          {/* Explore Links */}
          <nav aria-label="Explore">
            <h3 className="font-mono text-xs font-bold text-cream/80 uppercase tracking-widest mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.explore.map((link) => (
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

          {/* Learn Links */}
          <nav aria-label="Learn more">
            <h3 className="font-mono text-xs font-bold text-cream/80 uppercase tracking-widest mb-4">
              Learn
            </h3>
            <ul className="space-y-3">
              {learnLinks.map((link) => (
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone/70 text-sm">
            © {year} MixWise. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.legal.map((link) => (
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
