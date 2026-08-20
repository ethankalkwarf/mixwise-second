"use client";

import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { LearnCoverImage } from "@/components/learn/LearnCoverImage";
import { NativeLearnCardShell } from "@/components/mobile/NativeLearnCardShell";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { getTechniqueLesson } from "@/lib/learnTechniques";
import type { GlossaryTerm } from "@/lib/cocktailTechniqueGlossary";
import { formatTechniqueLabel } from "@/lib/cocktailTechniqueGlossary";

type Technique = GlossaryTerm & { slug: string };

const GROUPS: { title: string; blurb: string; slugs: string[] }[] = [
  {
    title: "Texture",
    blurb: "Foam, silk, and stacked layers.",
    slugs: ["dry-shake", "fine-strain", "float", "layer"],
  },
  {
    title: "Aroma",
    blurb: "What you smell before the first sip.",
    slugs: ["express", "rinse"],
  },
  {
    title: "In the glass",
    blurb: "Moves you make in the serving glass.",
    slugs: ["muddle", "swizzle", "build"],
  },
];

export function LearnTechniqueIndex({ techniques }: { techniques: Technique[] }) {
  const bySlug = new Map(techniques.map((term) => [term.slug, term]));
  const grouped = GROUPS.map((group) => ({
    ...group,
    items: group.slugs.map((slug) => bySlug.get(slug)).filter((item): item is Technique => Boolean(item)),
  })).filter((group) => group.items.length > 0);

  const groupedSlugs = new Set(grouped.flatMap((group) => group.items.map((item) => item.slug)));
  const leftover = techniques.filter((term) => !groupedSlugs.has(term.slug));
  if (leftover.length > 0) {
    grouped.push({
      title: "More moves",
      blurb: "Other techniques in the library.",
      slugs: leftover.map((term) => term.slug),
      items: leftover,
    });
  }

  if (techniques.length === 0) return null;

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.title}>
          <div className="mb-3">
            <h3 className="font-display text-lg font-bold text-forest">{group.title}</h3>
            <p className="text-sm text-sage mt-0.5">{group.blurb}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((term) => (
              <TechniqueCard key={term.slug} term={term} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TechniqueCard({ term }: { term: Technique }) {
  const nativeShell = useNativeShell();
  const { isComplete, isAuthenticated } = useLearnProgress();
  const lesson = getTechniqueLesson(term.slug);
  const done = isAuthenticated && isComplete("technique", term.slug);
  const cover = lesson?.coverImage ?? "/learn/method-shake.webp";
  const href = `/learn/techniques/${term.slug}`;
  const cardClass =
    "group flex gap-3 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft";

  const body = (
    <>
      <div className="native-learn-card__photo relative h-[4.75rem] w-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-mist">
        <LearnCoverImage
          src={cover}
          alt=""
          fill
          className="transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          sizes="88px"
        />
        {done && (
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-forest">
            <CheckIcon className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center py-0.5 pr-1">
        <p className="font-display text-base font-bold text-forest group-hover:text-terracotta transition-colors">
          {formatTechniqueLabel(term.label)}
        </p>
        <p className="text-xs text-sage line-clamp-2 mt-1 leading-relaxed">
          {term.why || term.explanation}
        </p>
      </div>
    </>
  );

  if (nativeShell) {
    return (
      <NativeLearnCardShell
        href={href}
        ariaLabel={formatTechniqueLabel(term.label)}
        className={cardClass}
      >
        {body}
      </NativeLearnCardShell>
    );
  }

  return (
    <Link href={href} className={cardClass}>
      {body}
    </Link>
  );
}
