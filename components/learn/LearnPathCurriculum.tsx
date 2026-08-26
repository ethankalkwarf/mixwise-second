"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  pathStepHref,
  pathStepMedia,
  type LearnPath,
  type LearnPathStep,
} from "@/lib/learnLibrary";
import { LearnPathProgress } from "@/components/learn/LearnPathProgress";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { isStepComplete, pathProgress, stepLessonRef } from "@/lib/learnProgress";

type Props = {
  path: LearnPath;
};

/**
 * Path curriculum — photo-led steps, not numbered white cards.
 * Whole tiles are clickable (stretched link); media is pointer-events-none.
 * Completed steps show Review; the next incomplete step is marked Up next.
 */
export function LearnPathCurriculum({ path }: Props) {
  const { completed, isAuthenticated, completeLesson, uncompleteLesson } = useLearnProgress();
  const done = path.steps.map((step) => isStepComplete(step, completed));
  const { nextIndex, done: doneCount, total } = pathProgress(path, completed);
  const allDone = doneCount >= total;
  const nextHref =
    !allDone && nextIndex < path.steps.length ? pathStepHref(path.steps[nextIndex]) : null;

  const toggle = async (index: number) => {
    const ref = stepLessonRef(path.steps[index]);
    if (!ref || ref.kind === "path") return;
    if (done[index]) {
      await uncompleteLesson(ref.kind, ref.slug);
    } else {
      await completeLesson(ref.kind, ref.slug);
    }
  };

  return (
    <div className="space-y-10">
      <LearnPathProgress
        steps={path.steps}
        done={done}
        nextHref={isAuthenticated ? nextHref : null}
        allDone={allDone}
      />

      <div className="space-y-5">
        {path.steps.map((step, index) => (
          <PathStepCard
            key={`${step.type}-${"slug" in step ? step.slug : "swaps"}`}
            step={step}
            index={index}
            featured={index === 0}
            done={done[index]}
            isNext={isAuthenticated && !allDone && index === nextIndex}
            canToggle={isAuthenticated}
            onToggle={() => toggle(index)}
          />
        ))}
      </div>

      <LearnJoinCta />
    </div>
  );
}

function PathStepCard({
  step,
  index,
  featured = false,
  done,
  isNext,
  canToggle,
  onToggle,
}: {
  step: LearnPathStep;
  index: number;
  featured?: boolean;
  done: boolean;
  isNext: boolean;
  canToggle: boolean;
  onToggle: () => void;
}) {
  const nativeShell = useNativeShell();
  const meta = pathStepMedia(step);
  const minH = nativeShell ? "min-h-[220px]" : "min-h-[280px] sm:min-h-[320px]";
  const cta = done ? "Review lesson" : isNext ? "Continue here" : "Open lesson";

  if (featured) {
    return (
      <article
        className={`group relative overflow-hidden rounded-3xl border bg-forest ${minH} ${
          done ? "border-olive/40" : isNext ? "border-terracotta/50 ring-2 ring-terracotta/20" : "border-mist"
        }`}
      >
        <Link
          href={meta.href}
          className="absolute inset-0 z-10"
          aria-label={`${cta}: ${meta.title}`}
        />
        <Image
          src={meta.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className={`pointer-events-none object-cover transition-transform duration-700 group-hover:scale-105 ${
            done ? "opacity-80" : ""
          }`}
          priority
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-forest/45" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-forest/15" />
        <div className={`pointer-events-none relative z-0 flex ${minH} flex-col justify-end p-6 sm:p-8`}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-cream/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider !text-cream backdrop-blur-sm">
              {done ? "Done" : isNext ? "Up next" : "Start here"} · {meta.kind}
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-1 text-[11px] font-semibold text-forest">
                <CheckIcon className="h-3.5 w-3.5" />
                Completed
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold !text-cream mb-2 capitalize drop-shadow-sm">
            {meta.title}
          </h2>
          <p className="text-sm sm:text-base !text-cream/95 leading-relaxed max-w-xl mb-5 drop-shadow-sm">
            {meta.blurb}
          </p>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold !text-cream">
            {cta}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
        {canToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            className={`absolute top-6 right-6 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              done
                ? "border-olive bg-olive text-forest"
                : "border-cream/40 bg-cream/10 !text-cream hover:bg-cream/20"
            }`}
            aria-label={done ? "Mark incomplete" : "Mark complete"}
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        )}
      </article>
    );
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all hover:shadow-soft ${
        nativeShell ? "" : "sm:flex-row"
      } ${
        done
          ? "border-olive/35 bg-cream/40"
          : isNext
            ? "border-terracotta/40 ring-2 ring-terracotta/15 hover:border-terracotta/50"
            : "border-mist hover:border-terracotta/25"
      }`}
    >
      <Link
        href={meta.href}
        className="absolute inset-0 z-10"
        aria-label={`${cta}: ${meta.title}`}
      />
      <div
        className={`pointer-events-none relative shrink-0 bg-mist min-h-[10rem] ${
          nativeShell ? "h-44 w-full" : "sm:w-44 md:w-52 h-40 sm:h-auto"
        }`}
      >
        <Image
          src={meta.image}
          alt=""
          fill
          sizes="208px"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            done ? "opacity-75" : ""
          }`}
          aria-hidden
        />
      </div>
      <div className="pointer-events-none relative z-0 flex flex-1 flex-col justify-center p-5 sm:p-6 min-w-0">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-terracotta mb-1">
              {index + 1}. {meta.kind}
              {done ? " · Done" : isNext ? " · Up next" : ""}
            </p>
            <h2
              className={`font-display text-xl sm:text-2xl font-bold capitalize group-hover:!text-terracotta transition-colors leading-snug ${
                done ? "!text-charcoal/75" : "!text-charcoal"
              }`}
            >
              {meta.title}
            </h2>
            {meta.blurb && (
              <p className="text-sm text-sage mt-2 line-clamp-2 leading-relaxed">{meta.blurb}</p>
            )}
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
              {done ? "Review" : isNext ? "Continue" : "Open"}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
      {canToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className={`absolute top-5 right-5 z-20 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            done
              ? "border-olive bg-olive/20 text-forest"
              : "border-mist bg-cream text-sage hover:border-terracotta/40"
          }`}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
      )}
    </article>
  );
}
