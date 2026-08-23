"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionEyebrow, SectionTitle } from "@/components/brand/brandSections";
import { MainContainer } from "@/components/layout/MainContainer";
import {
  PARTNER_AUDIENCES,
  PARTNERS_CONTACT,
  PARTNERS_FAQ,
  PARTNERS_HERO,
  PARTNERS_INTRO,
} from "@/lib/partners";

const FAQ_LINK_CLASS =
  "font-medium text-forest underline decoration-mist underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta/40";

function PartnerFaqAnswer({
  item,
}: {
  item: (typeof PARTNERS_FAQ)[number];
}) {
  if (item.id === "contact") {
    return (
      <>
        Email{" "}
        <a href={`mailto:${PARTNERS_CONTACT.email}`} className={FAQ_LINK_CLASS}>
          {PARTNERS_CONTACT.email}
        </a>
        {" "}
        or use the contact form at{" "}
        <Link href="/contact?topic=partners" className={FAQ_LINK_CLASS}>
          getmixwise.com/contact?topic=partners
        </Link>
        . Include who you are, what you&apos;re proposing, and the audience you
        want to reach.
      </>
    );
  }

  if (item.id === "press") {
    return (
      <>
        MixWise is a home bartending companion with a curated cocktail library,
        cabinet matching (
        <Link href="/mix" className={FAQ_LINK_CLASS}>/mix</Link>
        ), Learn paths for technique, and a small social layer for friends who
        pour together. Press can use boilerplate and logos at{" "}
        <Link href="/brand/logos" className={FAQ_LINK_CLASS}>
          getmixwise.com/brand/logos
        </Link>
        .
      </>
    );
  }

  return item.answer;
}

function AudienceSection({
  audience,
  imageOnRight,
}: {
  audience: (typeof PARTNER_AUDIENCES)[number];
  imageOnRight: boolean;
}) {
  const contactHref = audience.contactTopic
    ? `/contact?topic=${encodeURIComponent(audience.contactTopic)}`
    : "/contact";

  const textCol = (
    <div id={audience.id} className="scroll-mt-28">
      <SectionEyebrow>{audience.eyebrow}</SectionEyebrow>
              <SectionTitle id={`partner-${audience.id}-title`}>
                {audience.title}
              </SectionTitle>
      <p className="mb-6 [text-wrap:pretty] text-lg leading-relaxed text-sage">
        {audience.body}
      </p>
      <ul className="mb-8 space-y-3">
        {audience.highlights.map((item) => (
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
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={contactHref}
          className="inline-flex items-center justify-center rounded-2xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark"
        >
          Get in touch
        </Link>
        {audience.secondaryLink ? (
          <Link
            href={audience.secondaryLink.href}
            className="text-sm font-semibold text-forest underline decoration-mist underline-offset-4 transition-colors hover:text-terracotta"
          >
            {audience.secondaryLink.label}
          </Link>
        ) : null}
      </div>
    </div>
  );

  const imageCol = (
    <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-mist shadow-soft md:aspect-[5/4]">
      <Image
        src={audience.image.src}
        alt={audience.image.alt}
        fill
        className="object-cover"
        style={{
          objectPosition: audience.image.objectPosition ?? "center center",
        }}
        sizes="(max-width: 768px) 100vw, 45vw"
      />
    </div>
  );

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
      <div
        className={imageOnRight ? "lg:col-span-5" : "lg:col-span-5 lg:order-2"}
      >
        {imageCol}
      </div>
      <div
        className={
          imageOnRight ? "lg:col-span-7" : "lg:col-span-7 lg:order-1"
        }
      >
        {textCol}
      </div>
    </div>
  );
}

export function PartnersPageContent() {
  return (
    <article className="bg-cream">
      <section className="relative isolate overflow-hidden bg-charcoal">
        <Image
          src={PARTNERS_HERO.image.src}
          alt={PARTNERS_HERO.image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent" />

        <div className="relative z-10 py-16 sm:py-20 lg:py-24">
          <MainContainer className="max-w-5xl">
            <div className="max-w-2xl">
              <h1 className="mb-5 [text-wrap:balance] font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
                {PARTNERS_HERO.title}
              </h1>
              <p className="[text-wrap:pretty] text-lg leading-relaxed text-mist">
                {PARTNERS_HERO.subtitle}
              </p>
            </div>
          </MainContainer>
        </div>
      </section>

      <section className="border-b border-mist py-14 lg:py-16">
        <MainContainer className="max-w-3xl">
          <p className="[text-wrap:pretty] text-center text-lg leading-relaxed text-sage">
            {PARTNERS_INTRO}
          </p>
        </MainContainer>
      </section>

      {PARTNER_AUDIENCES.map((audience, index) => (
        <section
          key={audience.id}
          aria-labelledby={`partner-${audience.id}-title`}
          className={
            index % 2 === 0
              ? "bg-mist/40 py-16 lg:py-24"
              : "py-16 lg:py-24"
          }
        >
          <MainContainer className="max-w-5xl">
            <AudienceSection
              audience={audience}
              imageOnRight={index % 2 === 1}
            />
          </MainContainer>
        </section>
      ))}

      <section
        className="border-t border-mist py-16 lg:py-20"
        aria-labelledby="partners-faq-title"
      >
        <MainContainer className="max-w-3xl">
          <SectionEyebrow>Common questions</SectionEyebrow>
          <SectionTitle id="partners-faq-title">
            Partnership FAQ
          </SectionTitle>
          <dl className="space-y-8">
            {PARTNERS_FAQ.map((item) => (
              <div key={item.id} className="border-t border-forest/10 pt-6">
                <dt className="mb-3 font-display text-xl text-forest">
                  {item.question}
                </dt>
                <dd className="[text-wrap:pretty] leading-relaxed text-sage">
                  <PartnerFaqAnswer item={item} />
                </dd>
              </div>
            ))}
          </dl>
        </MainContainer>
      </section>

      <section className="border-t border-mist bg-forest py-16 lg:py-20">
        <MainContainer className="max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-terracotta">
            Contact
          </p>
          <h2 className="mb-4 [text-wrap:balance] font-display text-3xl leading-tight text-cream sm:text-4xl">
            Start a conversation
          </h2>
          <p className="mb-8 [text-wrap:pretty] text-lg leading-relaxed text-mist">
            {PARTNERS_CONTACT.note}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact?topic=partners"
              className="inline-flex items-center justify-center rounded-2xl bg-terracotta px-6 py-3 text-sm font-semibold text-cream shadow-lg shadow-terracotta/20 transition-colors hover:bg-terracotta-dark"
            >
              Send a message
            </Link>
            <a
              href={`mailto:${PARTNERS_CONTACT.email}?subject=MixWise%20partnership`}
              className="text-sm font-semibold text-cream underline decoration-cream/30 underline-offset-4 transition-colors hover:text-mist"
            >
              {PARTNERS_CONTACT.email}
            </a>
          </div>
        </MainContainer>
      </section>
    </article>
  );
}
