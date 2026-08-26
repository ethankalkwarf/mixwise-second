"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { LearnCoverImage } from "@/components/learn/LearnCoverImage";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { learnLibraryHref, readLearnLibraryState } from "@/lib/learnLibraryNavigation";
import { useMemo } from "react";

type Props = {
  title: string;
  eyebrow: string;
  summary?: string;
  imageSrc: string;
  imageAlt: string;
  beginHref: string;
};

export function NativeLearnPathHero({
  title,
  eyebrow,
  summary,
  imageSrc,
  imageAlt,
  beginHref,
}: Props) {
  const nativeShell = useNativeShell();
  const backHref = useMemo(() => learnLibraryHref(readLearnLibraryState()), []);

  if (!nativeShell) return null;

  return (
    <section className="native-learn-lesson-hero native-learn-path-hero">
      <AppLink href={backHref} className="native-learn-lesson-hero__back">
        <ChevronLeftIcon aria-hidden />
        <span>Learn</span>
      </AppLink>

      <div className="native-learn-lesson-hero__stage">
        <LearnCoverImage
          src={imageSrc}
          alt={imageAlt}
          priority
          fill
          className="native-learn-lesson-hero__photo"
        />
        <div className="native-learn-lesson-hero__shade" aria-hidden />
        <div className="native-learn-lesson-hero__copy">
          <p className="native-learn-lesson-hero__eyebrow">{eyebrow}</p>
          <h1 className="native-learn-lesson-hero__title">{title}</h1>
          {summary ? <p className="native-learn-lesson-hero__summary">{summary}</p> : null}
          <AppLink
            href={beginHref}
            className="native-learn-path-hero__cta pointer-events-auto mt-3 inline-flex items-center justify-center rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Begin the path →
          </AppLink>
        </div>
      </div>
    </section>
  );
}
