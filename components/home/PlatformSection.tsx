"use client";

import Link from "next/link";
import { AutoplayVideo } from "@/components/media/AutoplayVideo";

const FEATURES = [
  {
    title: "Curated recipes",
    body: "An extensive collection of handcrafted cocktails — clear measurements, context, and drinks worth making at home.",
    href: "/cocktails",
    label: "Start browsing",
    accent: "text-olive",
  },
  {
    title: "Your cabinet",
    body: "Add the spirits and mixers you have. Instantly see what you can craft\u00A0tonight — and what’s worth picking up\u00A0next.",
    href: "/mix",
    label: "Open your cabinet",
    accent: "text-terracotta",
  },
  {
    title: "Know the bottle",
    body: "What gin is, what Campari tastes like, and which drinks each bottle actually opens.",
    href: "/ingredients",
    label: "Ingredient guides",
    accent: "text-olive",
  },
  {
    title: "Your taste",
    body: "Heart the keepers, skip drinks you won\u2019t remake, and leave private notes so MixWise remembers what you actually like.",
    href: "/account-benefits",
    label: "See what\u2019s included",
    accent: "text-terracotta",
  },
] as const;

export function PlatformSection() {
  return (
    <section className="relative bg-charcoal py-24 text-cream lg:py-36">
      {/* Wave overlaps the charcoal edge so no cream hairline shows under the troughs */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-full translate-y-px leading-[0]"
        aria-hidden
      >
        <svg
          className="block h-10 w-full text-charcoal sm:h-12 lg:h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0 52 C120 18 220 8 340 28 C460 48 520 72 660 58 C800 44 860 12 980 22 C1100 32 1220 58 1440 36 L1440 80 L0 80 Z"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl text-center md:mb-20 md:text-left lg:mb-24">
          <h2 className="mb-5 [text-wrap:balance] font-display text-4xl leading-[1.1] text-mist md:text-5xl lg:text-6xl">
            Everything you need behind your own&nbsp;bar.
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-terracotta md:mx-0" />
        </div>

        <div className="mb-16 grid gap-12 md:mb-20 md:grid-cols-2 lg:grid-cols-4 md:gap-10 lg:gap-10">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="border-t border-stone/20 pt-8 md:border-t-0 md:pt-0"
            >
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-stone">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-4 font-display text-2xl text-cream sm:text-3xl">
                {feature.title}
              </h3>
              <p className="mb-7 max-w-sm leading-relaxed text-stone">
                {feature.body}
              </p>
              <Link
                href={feature.href}
                className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:text-cream ${feature.accent}`}
              >
                {feature.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>

        <AutoplayVideo
          src="/media/cheers.mp4"
          webmSrc="/media/cheers.webm"
          poster="/media/cheers-poster.webp"
          className="aspect-[21/9] rounded-[1.5rem] sm:aspect-[2.4/1] sm:rounded-[2rem]"
          alt="Close-up of two people cheering cocktails in a bar"
        />
      </div>
    </section>
  );
}
