"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionEyebrow, SectionTitle } from "@/components/brand/brandSections";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  BRAND_COMPANION,
  BRAND_GALLERY,
  BRAND_HERO,
  BRAND_LEARN,
  BRAND_PILLARS,
  BRAND_SOCIAL,
  BRAND_STORY,
} from "@/lib/brand/kit";

function FeatureSection({
  eyebrow,
  title,
  body,
  highlights,
  image,
  href,
  imageOnRight = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  highlights: string[];
  image: { src: string; alt: string };
  href: string;
  imageOnRight?: boolean;
}) {
  const textCol = (
    <div>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <SectionTitle>{title}</SectionTitle>
      <p className="mb-6 [text-wrap:pretty] text-lg leading-relaxed text-sage">
        {body}
      </p>
      <ul className="mb-6 space-y-3">
        {highlights.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-relaxed text-sage sm:text-base"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-semibold text-forest underline decoration-mist underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta/40"
      >
        Explore {eyebrow.toLowerCase()}
      </Link>
    </div>
  );

  const imageCol = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist sm:aspect-[5/6]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
    </div>
  );

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
      {imageOnRight ? (
        <>
          {textCol}
          {imageCol}
        </>
      ) : (
        <>
          {imageCol}
          {textCol}
        </>
      )}
    </div>
  );
}

export function AboutPageContent() {
  return (
    <div className="bg-cream">
      <section className="relative isolate min-h-[72vh] overflow-hidden bg-charcoal sm:min-h-[78vh]">
        <Image
          src="/media/kitchen-bartender-man.webp"
          alt="Pouring a cocktail at a bright home kitchen counter"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent" />

        <div className="relative z-10 flex min-h-[72vh] items-end sm:min-h-[78vh]">
          <MainContainer className="pb-14 pt-28 sm:pb-20 sm:pt-32">
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
              About
            </p>
            <h1 className="mb-5 max-w-2xl [text-wrap:balance] font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
              {BRAND_HERO.title}
            </h1>
            <p className="max-w-xl [text-wrap:pretty] text-lg leading-relaxed text-mist">
              {BRAND_HERO.subtitle}
            </p>
          </MainContainer>
        </div>
      </section>

      {BRAND_STORY.map((block, i) => (
        <section
          key={block.title}
          className={
            i % 2 === 0 ? "py-20 lg:py-28" : "bg-mist/40 py-20 lg:py-28"
          }
        >
          <MainContainer className="max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <SectionEyebrow>{block.eyebrow}</SectionEyebrow>
                <SectionTitle>{block.title}</SectionTitle>
                <p className="[text-wrap:pretty] text-lg leading-relaxed text-sage">
                  {block.body}
                </p>
              </div>
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist sm:aspect-[5/6] ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </MainContainer>
        </section>
      ))}

      <section className="py-20 lg:py-28">
        <MainContainer className="max-w-5xl">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-14">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist sm:aspect-[5/6] md:sticky md:top-28">
              <Image
                src={BRAND_COMPANION.image.src}
                alt={BRAND_COMPANION.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>

            <div>
              <SectionEyebrow>{BRAND_COMPANION.eyebrow}</SectionEyebrow>
              <SectionTitle>{BRAND_COMPANION.title}</SectionTitle>
              <p className="mb-10 [text-wrap:pretty] text-lg leading-relaxed text-sage sm:mb-12">
                {BRAND_COMPANION.intro}
              </p>

              <ul>
                {BRAND_PILLARS.map((pillar, index) => (
                  <li
                    key={pillar.title}
                    className="border-t border-forest/15 py-8 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <p
                      className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mb-3 font-display text-2xl leading-tight text-forest sm:text-3xl">
                      {pillar.title}
                    </h3>
                    <p className="max-w-md [text-wrap:pretty] leading-relaxed text-sage">
                      {pillar.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MainContainer>
      </section>

      <section className="bg-mist/40 py-20 lg:py-28">
        <MainContainer className="max-w-5xl">
          <FeatureSection
            eyebrow={BRAND_LEARN.eyebrow}
            title={BRAND_LEARN.title}
            body={BRAND_LEARN.body}
            highlights={BRAND_LEARN.highlights}
            image={BRAND_LEARN.image}
            href={BRAND_LEARN.href}
            imageOnRight
          />
        </MainContainer>
      </section>

      <section className="py-20 lg:py-28">
        <MainContainer className="max-w-5xl">
          <FeatureSection
            eyebrow={BRAND_SOCIAL.eyebrow}
            title={BRAND_SOCIAL.title}
            body={BRAND_SOCIAL.body}
            highlights={BRAND_SOCIAL.highlights}
            image={BRAND_SOCIAL.image}
            href={BRAND_SOCIAL.href}
          />
        </MainContainer>
      </section>

      <section className="bg-mist/40 pb-14 pt-16 lg:pb-16 lg:pt-20">
        <MainContainer className="max-w-5xl">
          <div className="grid gap-3 sm:grid-cols-3">
            {BRAND_GALLERY.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mist sm:aspect-[4/5]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link
              href="/brand/logos"
              className="text-xs text-sage underline decoration-mist underline-offset-4 transition-colors hover:text-forest"
            >
              Logos
            </Link>
          </p>
        </MainContainer>
      </section>
    </div>
  );
}
