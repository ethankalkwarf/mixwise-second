"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface HeroProps {
  title?: string;
  subtitle?: string;
  featuredCocktails?: unknown[];
}

export function Hero({
  subtitle = "Recipes worth making, matched to what’s already in your\u00A0cabinet — so you can pour something good\u00A0tonight.",
}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-charcoal">
      <Image
        src="/media/strainer-pour-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        poster="/media/strainer-pour-poster.webp"
        aria-hidden
      >
        <source src="/media/strainer-pour.mp4" type="video/mp4" />
      </video>

      {/* Even scrim — readable type when content is centered over the pour */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 to-charcoal/30" />
      <div className="absolute inset-0 bg-charcoal/25" />

      <div className="relative z-10 flex min-h-[88vh] items-center justify-center">
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <h1 className="mb-6 [text-wrap:balance] text-6xl font-semibold leading-[1.02] tracking-tight text-cream sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
            Find your{" "}
            <span className="italic text-terracotta">
              next
              <br />
              favorite
            </span>
            {"\u00A0"}cocktail
          </h1>
          <p className="mx-auto mb-10 max-w-xl [text-wrap:pretty] text-base leading-relaxed text-mist sm:text-lg lg:text-xl">
            {subtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/mix"
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark sm:px-10 sm:py-4 sm:text-base"
            >
              Open your cabinet
            </Link>
            <Link
              href="/cocktails"
              className="inline-flex items-center justify-center rounded-full border-2 border-cream px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-forest sm:px-10 sm:py-4 sm:text-base"
            >
              Browse recipes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
