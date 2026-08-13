"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

const FOOTER_LINKS = {
  explore: [
    { label: "Browse Cocktail Recipes", href: "/cocktails" },
    { label: "Open Mixology Wizard", href: "/mix" },
    { label: "Wedding Cocktail Finder", href: "/wedding-menu" },
  ],
  learn: [
    { label: "Learning portal", href: "/learn" },
    { label: "Smart Swaps", href: "/learn/swaps" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

function FooterEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/email/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "You're on the list — check your email.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  if (status === "success") {
    return <p className="text-sm text-cream/90">{message}</p>;
  }

  return (
    <div className="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="footer-email">
          Email
        </label>
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@email.com"
          required
          autoComplete="email"
          disabled={status === "loading"}
          className="min-w-0 flex-1 rounded-full border border-cream/20 bg-forest px-4 py-2.5 text-sm text-cream placeholder:text-stone focus:border-cream/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="shrink-0 rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Join list"}
        </button>
      </form>
      {status === "error" && message && (
        <p className="mt-2 text-xs text-terracotta" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

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
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-cream/80">
              New cocktails every week
            </p>
            <FooterEmailCapture />
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
