"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";

interface MobileHeroVideoProps {
  greeting: string;
  subtitle: string;
}

/** Compact video hero for the native home screen. */
export function MobileHeroVideo({ greeting, subtitle }: MobileHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="relative mx-4 mb-6 overflow-hidden rounded-[1.75rem] bg-charcoal shadow-lg shadow-charcoal/15">
      <div className="relative h-52 sm:h-56">
        <Image
          src="/media/strainer-pour-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
          aria-hidden
        />
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/20" />

        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <BrandLogo variant="light" size="lg" linked={false} render="img" />
          <div>
            <h1 className="font-display text-[1.65rem] leading-tight font-bold text-cream">
              {greeting}
            </h1>
            <p className="mt-1 text-sm text-cream/85">{subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
