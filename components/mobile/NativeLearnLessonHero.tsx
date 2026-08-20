"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AppLink } from "@/components/mobile/AppLink";
import { LearnCoverImage } from "@/components/learn/LearnCoverImage";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import type { LearnLessonKind } from "@/lib/learnProgress";

type Props = {
  title: string;
  eyebrow: string;
  summary?: string;
  imageSrc: string;
  imageAlt: string;
  kind?: Exclude<LearnLessonKind, "path">;
  slug?: string;
  readingMinutes?: number;
};

export function NativeLearnLessonHero({
  title,
  eyebrow,
  summary,
  imageSrc,
  imageAlt,
  kind,
  slug,
  readingMinutes,
}: Props) {
  const nativeShell = useNativeShell();
  const { isAuthenticated, isComplete } = useLearnProgress();
  const done = kind && slug && isAuthenticated ? isComplete(kind, slug) : false;

  if (!nativeShell) return null;

  return (
    <section className="native-learn-lesson-hero">
      <AppLink href="/learn" className="native-learn-lesson-hero__back">
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
        {done ? <span className="native-learn-lesson-hero__badge">Complete</span> : null}
        <div className="native-learn-lesson-hero__copy">
          <p className="native-learn-lesson-hero__eyebrow">
            {eyebrow}
            {readingMinutes ? ` · ${readingMinutes} min` : ""}
          </p>
          <h1 className="native-learn-lesson-hero__title">{title}</h1>
          {summary ? <p className="native-learn-lesson-hero__summary">{summary}</p> : null}
        </div>
      </div>
    </section>
  );
}
