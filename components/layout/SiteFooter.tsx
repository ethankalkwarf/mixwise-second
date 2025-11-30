import React from "react";
import Link from "next/link";
import { MainContainer } from "./MainContainer";

const FOOTER_LINKS = {
  explore: [
    { label: "Cocktails", href: "/cocktails" },
    { label: "Mix Tool", href: "/mix" },
  ],
  learn: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/90 mt-auto">
      <MainContainer className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-sm font-serif font-bold text-slate-900">
                MW
              </div>
              <span className="font-serif font-bold text-xl text-slate-100">
                MixWise
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              A smarter way to make cocktails at home. Discover recipes, learn techniques, 
              and find drinks you can make with what you have.
            </p>
          </div>

          {/* Explore Links */}
          <nav aria-label="Explore">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-lime-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Learn Links */}
          <nav aria-label="Learn more">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Learn
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-lime-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {year} MixWise. All rights reserved.
          </p>
          
          {/* Social Links Placeholder */}
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-xs">
              Follow us on social media
            </span>
            {/* Add social icons here when available */}
          </div>
        </div>
      </MainContainer>
    </footer>
  );
}
