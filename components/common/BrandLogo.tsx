"use client";

import { HardNavLink } from "@/components/layout/HardNavLink";

export type BrandLogoVariant = "light" | "dark" | "olive";
export type BrandLogoSize = "sm" | "md" | "lg" | "hero";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  /** When false, render the mark only (e.g. inside a headline). Default true. */
  linked?: boolean;
  href?: string;
}

const SIZE_IMG: Record<BrandLogoSize, string> = {
  sm: "h-5",
  md: "h-7",
  lg: "h-9",
  hero: "h-[0.85em]",
};

/**
 * Static lockup SVGs — lime is baked into the file (same assets as the website).
 * Never compose text + LimeWheel at runtime; that drifts in the Capacitor WebView.
 * Cache-bust when the lockup art changes.
 */
const LOCKUP_VERSION = "20260820c";
const VARIANT_ASSET: Record<BrandLogoVariant, string> = {
  light: `/brand/mixwise-lockup-cream.svg?v=${LOCKUP_VERSION}`,
  dark: `/brand/mixwise-lockup.svg?v=${LOCKUP_VERSION}`,
  olive: `/brand/mixwise-lockup-olive.svg?v=${LOCKUP_VERSION}`,
};

/** Lime wheel — favicon / standalone marks only. Not used in the wordmark. */
export function LimeWheel({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden
      className={`h-full w-full overflow-visible ${className}`}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="#2D4A2E" strokeWidth="6" />
      <circle cx="50" cy="50" r="41" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="37" fill="#C5D46A" />
      <g stroke="#2D4A2E" strokeWidth="2.25" strokeLinecap="round">
        <line x1="50" y1="50" x2="50" y2="13" />
        <line x1="50" y1="50" x2="82.01" y2="31.5" />
        <line x1="50" y1="50" x2="82.01" y2="68.5" />
        <line x1="50" y1="50" x2="50" y2="87" />
        <line x1="50" y1="50" x2="17.99" y2="68.5" />
        <line x1="50" y1="50" x2="17.99" y2="31.5" />
      </g>
      <circle cx="50" cy="50" r="3.5" fill="#2D4A2E" />
    </svg>
  );
}

export function BrandLogo({
  variant = "dark",
  size = "md",
  className = "",
  linked = true,
  href = "/",
}: BrandLogoProps) {
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={VARIANT_ASSET[variant]}
      alt="mixwise"
      className={`block h-auto w-auto ${SIZE_IMG[size]}`}
      width={243}
      height={59}
      decoding="async"
      draggable={false}
    />
  );

  if (!linked) {
    return <span className={`inline-flex items-center ${className}`}>{mark}</span>;
  }

  return (
    <HardNavLink
      href={href}
      className={`inline-flex items-center hover:opacity-80 transition-opacity ${className}`}
      aria-label={href === "/dashboard" ? "MixWise Dashboard" : "MixWise Home"}
    >
      {mark}
    </HardNavLink>
  );
}
