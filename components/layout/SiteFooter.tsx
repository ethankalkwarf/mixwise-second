import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

const FOOTER_LINKS = {
  explore: [
    { label: "Browse Cocktail Recipes", href: "/cocktails" },
    { label: "Open Mixology Wizard", href: "/mix" },
    { label: "Wedding Cocktail Finder", href: "/wedding-menu" },
  ],
  learn: [
    { label: "About", href: "/about" },
    { label: "Account Benefits", href: "/account-benefits" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & CTA */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <BrandLogo variant="light" size="lg" />
            </div>
            <p className="text-stone text-sm leading-relaxed max-w-sm mb-6">
              A smarter way to make cocktails at home. Discover recipes, learn techniques, 
              and find drinks you can make with what you have.
            </p>
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
              {FOOTER_LINKS.learn.map((link) => (
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
