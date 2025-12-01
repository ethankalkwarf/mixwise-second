import React from "react";
import Link from "next/link";
import { MainContainer } from "./MainContainer";

const FOOTER_LINKS = {
  explore: [
    { label: "Cocktails", href: "/cocktails" },
    { label: "Mix Tool", href: "/mix" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  learn: [
    { label: "About", href: "/about" },
    { label: "Account Benefits", href: "/account-benefits" },
    { label: "Contact", href: "/contact" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest mt-auto">
      <MainContainer className="py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & CTA */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <span className="text-3xl font-display font-bold text-cream">
                mixwise.
              </span>
            </Link>
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
          
        </div>
      </MainContainer>
    </footer>
  );
}
