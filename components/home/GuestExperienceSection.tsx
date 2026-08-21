"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { JoinCtaButton } from "@/components/auth/JoinCtaButton";

export function GuestExperienceSection() {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="relative overflow-x-clip bg-cream py-20 lg:py-28">
      {/* Organic portrait mask — uneven hand-cut circle */}
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        <defs>
          <clipPath id="shelf-organic-mask" clipPathUnits="objectBoundingBox">
            <path d="M0.52 0.02 C0.68 0.01 0.82 0.06 0.90 0.16 C0.98 0.27 1.01 0.42 0.99 0.55 C0.97 0.70 0.91 0.82 0.80 0.91 C0.68 0.99 0.52 1.02 0.38 0.98 C0.22 0.93 0.10 0.82 0.04 0.68 C-0.02 0.52 0.00 0.35 0.06 0.22 C0.13 0.08 0.30 0.03 0.52 0.02 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 md:grid-cols-12 md:gap-10 lg:px-8">
        <div className="relative z-10 md:col-span-5 lg:pr-4 xl:pr-8">
          <h2 className="mb-5 [text-wrap:balance] font-display text-3xl font-bold leading-tight text-forest lg:text-5xl">
            Start with what&apos;s
            <br />
            <span className="italic text-terracotta">
              already on your&nbsp;shelf
            </span>
          </h2>
          <p className="mb-8 max-w-md [text-wrap:pretty] text-lg leading-relaxed text-sage">
            See what you can make&nbsp;tonight, skip what you won&apos;t remake, and keep
            notes on drinks worth&nbsp;repeating.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <JoinCtaButton className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark" />
            <Link
              href="/mix"
              className="inline-flex items-center justify-center rounded-full border-2 border-forest px-8 py-3 text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-cream"
            >
              Open your cabinet
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center md:col-span-7 md:justify-end">
          {/* Soft mist disc — anchors the cut silhouette to the composition */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mist md:left-auto md:right-[8%] md:translate-x-0"
          />

          <div
            className="relative w-full max-w-md sm:max-w-lg md:mr-4 md:max-w-xl xl:mr-8"
            style={{ filter: "drop-shadow(0 24px 40px rgba(58, 77, 57, 0.14))" }}
          >
            <div
              className="relative aspect-square overflow-hidden"
              style={{
                clipPath: "url(#shelf-organic-mask)",
                WebkitClipPath: "url(#shelf-organic-mask)",
              }}
            >
              <Image
                src="/media/kitchen-prep.webp"
                alt="Preparing cocktails at home with ingredients already on the counter"
                fill
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover object-[center_28%]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
