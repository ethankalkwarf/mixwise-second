import Link from "next/link";
import Image from "next/image";
import type { LearnGuide, LearnPath } from "@/lib/learnLibrary";
import { pathStepHref } from "@/lib/learnLibrary";
import { LearnJoinCta } from "@/components/learn/LearnJoinCta";

type Props = {
  next?: LearnGuide;
  path?: LearnPath;
};

/**
 * Lesson closer: next step + path context + quiet join band.
 */
export function LearnLessonFooter({ next, path }: Props) {
  return (
    <div className="space-y-6 border-t border-mist pt-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {path ? (
          <div className="flex flex-col justify-center rounded-2xl border border-mist bg-cream/70 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage font-bold mb-1">
              Part of a path
            </p>
            <Link
              href={`/learn/paths/${path.slug}`}
              className="font-display text-lg font-bold !text-charcoal hover:!text-terracotta transition-colors"
            >
              {path.title}
            </Link>
            <p className="text-xs text-sage mt-1 line-clamp-2">{path.summary}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link href={`/learn/paths/${path.slug}`} className="font-medium text-terracotta hover:underline">
                View path →
              </Link>
              <Link href={pathStepHref(path.steps[0])} className="font-medium text-sage hover:text-terracotta">
                Restart from step 1
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/learn#library"
            className="flex items-center rounded-2xl border border-dashed border-mist px-5 py-4 text-sm font-medium text-sage hover:text-terracotta hover:border-terracotta/30"
          >
            ← Back to Learn library
          </Link>
        )}

        {next ? (
          <Link
            href={`/learn/guides/${next.slug}`}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
              <Image
                src={next.coverImage}
                alt={next.coverAlt}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center py-1 pr-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold mb-1">
                Up next · {next.readingMinutes} min
              </p>
              <p className="font-display text-lg font-bold !text-charcoal group-hover:!text-terracotta transition-colors leading-snug">
                {next.title}
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/learn"
            className="flex items-center justify-end rounded-2xl border border-mist bg-white px-5 py-4 text-sm font-semibold !text-charcoal hover:border-terracotta/30"
          >
            Browse more guides →
          </Link>
        )}
      </div>

      <LearnJoinCta />
    </div>
  );
}
