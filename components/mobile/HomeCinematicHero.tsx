"use client";

import { useEffect, useRef } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "@/components/common/BrandLogo";
import { AppLink } from "@/components/mobile/AppLink";
import { PourStreakChip } from "@/components/mobile/PourStreakChip";
import { formatCocktailName } from "@/lib/formatters";
import { nativePhotoUrl } from "@/lib/mobile/nativeImage";

type Props = {
  eyebrow: string;
  title: string;
  /** Rotating prompt when the drink name is not revealed yet. */
  idleTitle?: string;
  subtitle: string;
  imageUrl?: string | null;
  recipeHref?: string | null;
  kicker?: string | null;
  revealName: boolean;
  showStockCta?: boolean;
  onShake: () => void;
  shakeLabel: string;
  shakeImageUrl?: string | null;
  dailyImageUrl?: string | null;
};

export function HomeCinematicHero({
  eyebrow,
  title,
  idleTitle = "What are you pouring?",
  subtitle,
  imageUrl,
  recipeHref,
  kicker,
  revealName,
  showStockCta = false,
  onShake,
  shakeLabel,
  shakeImageUrl,
  dailyImageUrl,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroSrc = nativePhotoUrl(imageUrl, 1080, 85) || imageUrl;
  const shakeSrc = nativePhotoUrl(shakeImageUrl, 640) || shakeImageUrl;
  // Daily spotlight is intentionally de-emphasized, but the current blur/scale makes some photos look AI/CGI.
  // Use higher-quality optimization and keep it mostly crisp.
  const dailySrc = nativePhotoUrl(dailyImageUrl, 640, 85) || dailyImageUrl;

  useEffect(() => {
    if (heroSrc) return;
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {});
  }, [heroSrc]);

  const displayTitle = revealName ? formatCocktailName(title) : idleTitle;

  return (
    <section className="relative w-full bg-[#1c1814]">
      <div className="native-home-hero__stage">
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="native-home-hero__photo" src={heroSrc} alt="" />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="native-home-hero__photo"
              src="/media/strainer-pour-poster.webp"
              alt=""
              aria-hidden
            />
            <video
              ref={videoRef}
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
          </>
        )}

        <div className="native-home-hero__shade" aria-hidden />
        <div className="native-home-hero__chrome-blur" aria-hidden />

        {revealName && recipeHref ? (
          <AppLink
            href={recipeHref}
            className="native-hero-hit absolute inset-0 z-[1]"
            aria-label={`Open ${formatCocktailName(title)}`}
          >
            <span className="sr-only">{formatCocktailName(title)}</span>
          </AppLink>
        ) : null}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-center justify-between px-5"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.55rem)" }}
        >
          <BrandLogo
            variant="light"
            size="md"
            linked={false}
            className="native-home-hero__logo"
          />
          <div className="pointer-events-auto">
            <PourStreakChip variant="light" />
          </div>
        </div>

        <div className="native-home-hero__copy">
          <p className="native-home-hero__eyebrow">{eyebrow}</p>
          {revealName && kicker ? <p className="native-home-hero__kicker">{kicker}</p> : null}
          <h1 className="native-home-hero__title">{displayTitle}</h1>
          <p className="native-home-hero__subtitle">{subtitle}</p>
          {showStockCta ? (
            <AppLink href="/mix" className="native-home-hero__cta">
              Stock your cabinet
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </AppLink>
          ) : revealName ? (
            <p className="native-home-hero__recipe">View recipe →</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2">
        <button
          type="button"
          onClick={onShake}
          className="native-hero-tile native-home-hero__tile"
        >
          {shakeSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shakeSrc} alt="" />
          ) : null}
          <div className="native-home-hero__tile-shade" aria-hidden />
          <span className="native-home-hero__tile-copy">
            <span className="native-home-hero__tile-eyebrow">Shake to pour</span>
            <span className="native-home-hero__tile-title">{shakeLabel}</span>
          </span>
        </button>

        <AppLink href="/cocktail-of-the-day" className="native-hero-tile native-home-hero__tile">
          {dailySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dailySrc} alt="" className="scale-105" />
          ) : null}
          <div className="native-home-hero__tile-shade native-home-hero__tile-shade--daily" aria-hidden />
          <span className="native-home-hero__tile-copy">
            <span className="native-home-hero__tile-eyebrow native-home-hero__tile-eyebrow--muted">
              Daily spotlight
            </span>
            <span className="native-home-hero__tile-title">Tap to reveal</span>
          </span>
        </AppLink>
      </div>
    </section>
  );
}
