"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  pathStepMedia,
  type LearnPath,
  type LearnPathStep,
} from "@/lib/learnLibrary";
import { LearnPathProgress, useLearnPathDone } from "@/components/learn/LearnPathProgress";
import { LearnContentGate } from "@/components/learn/LearnContentGate";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";

type Props = {
  path: LearnPath;
};

/**
 * Path curriculum — photo-led steps, not numbered white cards.
 */
export function LearnPathCurriculum({ path }: Props) {
  const { done, toggle, isAuthenticated } = useLearnPathDone(path.slug, path.steps.length);

  return (
    <div className="space-y-10">
      <LearnPathProgress pathSlug={path.slug} steps={path.steps} done={done} />

      <LearnContentGate gateId={`path:${path.slug}`} teaserLabel="Continue this path">
        <div className="space-y-5">
          {path.steps.map((step, index) => (
            <PathStepCard
              key={`${step.type}-${"slug" in step ? step.slug : "swaps"}`}
              step={step}
              index={index}
              featured={index === 0}
              done={done[index]}
              canToggle={isAuthenticated}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </LearnContentGate>

      <LearnJoinCta />
    </div>
  );
}

function PathStepCard({
  step,
  index,
  featured = false,
  done,
  canToggle,
  onToggle,
}: {
  step: LearnPathStep;
  index: number;
  featured?: boolean;
  done: boolean;
  canToggle: boolean;
  onToggle: () => void;
}) {
  const meta = pathStepMedia(step);

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-mist min-h-[280px] sm:min-h-[320px]">
        <Image
          src={meta.image}
          alt={meta.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-forest/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/50 to-transparent" />
        <div className="relative z-10 flex h-full min-h-[280px] sm:min-h-[320px] flex-col justify-end p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-cream/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream/90 backdrop-blur-sm">
              Start here · {meta.kind}
            </span>
            {canToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onToggle();
                }}
                className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-olive bg-olive text-forest"
                    : "border-cream/40 bg-cream/10 text-cream hover:bg-cream/20"
                }`}
                aria-label={done ? "Mark incomplete" : "Mark complete"}
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream mb-2 capitalize drop-shadow-sm">
            {meta.title}
          </h2>
          <p className="text-sm sm:text-base text-cream/85 leading-relaxed max-w-xl mb-5">
            {meta.blurb}
          </p>
          <Link
            href={meta.href}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
          >
            Open lesson
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-mist bg-white transition-all hover:border-terracotta/25 hover:shadow-soft">
      <Link href={meta.href} className="relative sm:w-44 md:w-52 h-40 sm:h-auto shrink-0 bg-mist">
        <Image
          src={meta.image}
          alt={meta.imageAlt}
          fill
          sizes="208px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 min-w-0">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-terracotta mb-1">
              {index + 1}. {meta.kind}
            </p>
            <Link href={meta.href}>
              <h2 className="font-display text-xl sm:text-2xl font-bold !text-charcoal capitalize group-hover:!text-terracotta transition-colors leading-snug">
                {meta.title}
              </h2>
            </Link>
            {meta.blurb && (
              <p className="text-sm text-sage mt-2 line-clamp-2 leading-relaxed">{meta.blurb}</p>
            )}
            <Link
              href={meta.href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline"
            >
              Continue
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          {canToggle && (
            <button
              type="button"
              onClick={onToggle}
              className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                done
                  ? "border-olive bg-olive/20 text-forest"
                  : "border-mist bg-cream text-sage hover:border-terracotta/40"
              }`}
              aria-label={done ? "Mark incomplete" : "Mark complete"}
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
