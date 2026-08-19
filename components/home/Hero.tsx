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
  subtitle = "Recipes worth making, matched to what’s already in your cabinet, so you can pour something good tonight.",
}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="relative isolate min-h-[min(100svh-4rem,34rem)] overflow-hidden bg-charcoal sm:min-h-[56vh] md:min-h-[62vh] lg:min-h-[88vh]">
      <Image
        src="/media/strainer-pour-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_28%] md:object-center"
        aria-hidden
      />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-[center_28%] md:object-center"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        poster="/media/strainer-pour-poster.webp"
        aria-hidden
      >
        <source src="/media/strainer-pour.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal from-[18%] via-charcoal/70 to-charcoal/25 md:from-charcoal md:via-charcoal/65 md:to-charcoal/30" />
      <div className="absolute inset-0 bg-charcoal/25" />

      <div className="relative z-10 flex min-h-[min(100svh-4rem,34rem)] items-end justify-center sm:min-h-[56vh] md:min-h-[62vh] md:items-center lg:min-h-[88vh]">
        <div className="mx-auto w-full max-w-5xl px-5 pb-[calc(var(--mw-tabbar-h)+env(safe-area-inset-bottom,0px)+1.5rem)] pt-8 text-left sm:px-6 sm:pb-[calc(var(--mw-tabbar-h)+env(safe-area-inset-bottom,0px)+2rem)] md:max-w-3xl md:px-8 md:pt-14 md:text-center lg:max-w-5xl lg:pb-24 lg:pt-28">
          <h1 className="mb-4 [text-wrap:balance] text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-cream sm:mb-6 sm:text-[2.65rem] sm:leading-[1.08] md:text-5xl md:leading-[1.06] lg:text-7xl lg:leading-[1.04] xl:text-[7.5rem]">
            Find your{" "}
            <span className="italic text-terracotta">
              next
              <br className="hidden sm:block" />
              {` `}
              favorite
            </span>{" "}
            cocktail
          </h1>
          <p className="mb-7 max-w-md [text-wrap:pretty] text-[15px] leading-relaxed text-mist sm:mx-auto sm:mb-9 sm:max-w-lg sm:text-base md:mb-10 md:max-w-xl md:text-lg lg:text-xl">
            {subtitle}
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3 md:gap-4">
            <Link
              href="/mix"
              className="inline-flex w-full items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark sm:w-auto sm:px-9 sm:py-3.5 md:px-10 md:py-4 md:text-base"
            >
              Open your cabinet
            </Link>
            <Link
              href="/cocktails"
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-cream px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-forest sm:w-auto sm:px-9 sm:py-3.5 md:px-10 md:py-4 md:text-base"
            >
              Browse recipes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
