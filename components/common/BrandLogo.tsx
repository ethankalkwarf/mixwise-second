"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { HardNavLink } from "@/components/layout/HardNavLink";

export type BrandLogoVariant = "light" | "dark" | "olive";
export type BrandLogoSize = "sm" | "md" | "lg" | "hero";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  /** When false, render the mark only (e.g. inside a headline). Default true. */
  linked?: boolean;
  /**
   * `inline` — live two-tone wordmark + lime (measured to the e). Default.
   * `img` — static SVG lockup from /public/brand.
   */
  render?: "inline" | "img";
  href?: string;
}

const SIZE_TEXT: Record<BrandLogoSize, string> = {
  sm: "text-[20px]",
  md: "text-[28px]",
  lg: "text-[36px]",
  hero: "text-[0.85em]",
};

const SIZE_IMG: Record<BrandLogoSize, string> = {
  sm: "h-5",
  md: "h-7",
  lg: "h-9",
  hero: "h-[0.85em]",
};

const VARIANT_ASSET: Record<BrandLogoVariant, string> = {
  light: "/brand/mixwise-lockup-cream.svg",
  dark: "/brand/mixwise-lockup.svg",
  olive: "/brand/mixwise-lockup-olive.svg",
};

const MIX_COLOR: Record<BrandLogoVariant, string> = {
  light: "text-cream",
  dark: "text-forest",
  olive: "text-olive",
};

const WISE_COLOR: Record<BrandLogoVariant, string> = {
  light: "text-cream/80",
  dark: "text-sage",
  olive: "text-olive/85",
};

/** Lime wheel — white ring between rind and flesh. */
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

function LockupMark({
  variant,
  size,
  className = "",
}: {
  variant: BrandLogoVariant;
  size: BrandLogoSize;
  className?: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<{ height: number; descent: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      const style = getComputedStyle(el);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const m = ctx.measureText("e");
      const ascent = m.actualBoundingBoxAscent || 0;
      const descent = m.actualBoundingBoxDescent || 0;
      const height = ascent + descent;
      if (height > 0) setMetrics({ height, descent });
    };

    measure();
    void document.fonts?.ready.then(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size, variant]);

  const limeSize = metrics?.height;
  const limeShift = metrics?.descent ?? 0;

  return (
    <span
      className={`inline-flex items-baseline overflow-visible font-display font-bold tracking-tight leading-none ${SIZE_TEXT[size]} ${className}`}
    >
      <span ref={textRef} className={MIX_COLOR[variant]}>
        mix
      </span>
      <span className={`${WISE_COLOR[variant]} -ml-[0.08em]`}>wise</span>
      <span
        className="ml-[0.14em] inline-block shrink-0 overflow-visible"
        style={
          limeSize
            ? {
                width: limeSize,
                height: limeSize,
                transform: `translateY(${limeShift}px)`,
              }
            : { width: "1ex", height: "1ex" }
        }
      >
        <LimeWheel />
      </span>
    </span>
  );
}

export function BrandLogo({
  variant = "dark",
  size = "md",
  className = "",
  linked = true,
  render = "inline",
  href = "/",
}: BrandLogoProps) {
  const mark =
    render === "img" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={VARIANT_ASSET[variant]}
        alt="mixwise"
        className={`block w-auto ${SIZE_IMG[size]}`}
        width={243}
        height={59}
        decoding="async"
      />
    ) : (
      <LockupMark variant={variant} size={size} />
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
