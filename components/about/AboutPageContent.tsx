"use client";

import Link from "next/link";
import Image from "next/image";
import { AutoplayVideo } from "@/components/media/AutoplayVideo";

const STEPS = [
  {
    title: "Browse the library",
    body: "Hundreds of recipes with clear measures — sorted by spirit, style, or whatever sounds good\u00A0tonight.",
  },
  {
    title: "Stock your cabinet",
    body: "Add the bottles you already own. MixWise shows what you can make now, and what one more ingredient unlocks.",
  },
  {
    title: "Pour with confidence",
    body: "Save favorites, jot tasting notes, skip drinks you won\u2019t remake, and treat home bartending like a craft \u2014 not a scavenger hunt.",
  },
];

export function AboutPageContent() {
  return (
    <div className="bg-cream">
      {/* 1. Full-bleed opener */}
      <section className="relative isolate min-h-[85vh] overflow-hidden bg-charcoal">
        <Image
          src="/media/bartender-home.webp"
          alt="Making an Old Fashioned at a home bar"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/30 to-transparent" />

        <div className="relative z-10 flex min-h-[85vh] items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8">
            <h1 className="mb-5 max-w-2xl [text-wrap:balance] font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
              Home mixology,{" "}
              <span className="font-medium">kept&nbsp;simple</span>
            </h1>
            <p className="max-w-md [text-wrap:pretty] text-lg leading-relaxed text-mist">
              One place for the recipes you want, the bottles you have, and a
              memory of what you&apos;d actually pour again.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Origin */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
            Why we built it
          </p>
          <h2 className="mb-8 [text-wrap:balance] font-display text-3xl leading-tight text-forest sm:text-4xl lg:text-5xl">
            What can I make with&nbsp;these?
          </h2>
          <p className="[text-wrap:pretty] text-lg leading-relaxed text-sage">
            Friends would point at the couple of bottles on their counter and
            ask Ethan what they could pour tonight. He built MixWise around that
            question — a curated way to get better at home mixology with what
            you already own, without making it&nbsp;complicated.
          </p>
        </div>
      </section>

      {/* 3. How it works — steps + hotel video beside */}
      <section className="bg-mist/40 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-5">
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
                How it works
              </p>
              <h2 className="mb-12 [text-wrap:balance] font-display text-3xl leading-tight text-forest sm:text-4xl lg:mb-14 lg:text-5xl">
                Browse, stock, and&nbsp;pour.
              </h2>

              <ul className="space-y-10">
                {STEPS.map((step) => (
                  <li key={step.title} className="border-t border-forest/15 pt-6">
                    <h3 className="mb-3 font-display text-2xl text-forest">
                      {step.title}
                    </h3>
                    <p className="max-w-sm [text-wrap:pretty] leading-relaxed text-sage">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-7 md:sticky md:top-28">
              <AutoplayVideo
                src="/media/hotel-cocktails.mp4"
                poster="/media/hotel-cocktails-poster.webp"
                className="aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]"
                alt="Fruit cocktails on a hotel bar"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Closing visual + CTA */}
      <section className="relative isolate min-h-[70vh] overflow-hidden bg-charcoal">
        <Image
          src="/media/three-cocktails-dark.webp"
          alt="Three cocktails against a dark backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-charcoal/35" />

        <div className="relative z-10 flex min-h-[70vh] items-end">
          <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-20 lg:px-8">
            <h2 className="mb-6 [text-wrap:balance] font-display text-3xl leading-tight text-cream sm:text-5xl">
              Tonight&apos;s drink starts&nbsp;here
            </h2>
            <p className="mx-auto mb-10 max-w-lg [text-wrap:pretty] text-lg text-mist">
              Start with a recipe, or start with what&apos;s already in
              the&nbsp;cabinet.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/mix"
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark"
              >
                Open your cabinet
              </Link>
              <Link
                href="/cocktails"
                className="inline-flex items-center justify-center rounded-full border-2 border-cream px-8 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-forest"
              >
                Browse recipes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
