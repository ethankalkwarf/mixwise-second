"use client";

import Link from "next/link";
import { CheckIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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

type Props = {
  techniques: Technique[];
  /** Hub index: text rows. Default keeps photo cards for other surfaces. */
  variant?: "cards" | "directory";
};

export function LearnTechniqueIndex({ techniques, variant = "cards" }: Props) {
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

  const directory = variant === "directory";

  return (
    <div className={directory ? "space-y-6" : "space-y-8"}>
      {grouped.map((group) => (
        <div key={group.title}>
          <div className={directory ? "mb-2" : "mb-3"}>
            <h3
              className={`font-display font-bold text-forest ${
                directory ? "text-base" : "text-lg"
              }`}
            >
              {group.title}
            </h3>
            <p className="text-sm text-sage mt-0.5">{group.blurb}</p>
          </div>
          {directory ? (
            <div className="border-t border-mist grid sm:grid-cols-2 sm:gap-x-10">
              {group.items.map((term) => (
                <TechniqueDirectoryRow key={term.slug} term={term} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((term) => (
                <TechniqueCard key={term.slug} term={term} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TechniqueDirectoryRow({ term }: { term: Technique }) {
  const { isComplete, isAuthenticated } = useLearnProgress();
  const done = isAuthenticated && isComplete("technique", term.slug);
  const href = `/learn/techniques/${term.slug}`;
  const title = formatTechniqueLabel(term.label);
  const summary = term.why || term.explanation;

  return (
    <NativeLearnCardShell
      href={href}
      ariaLabel={title}
      className="group flex items-start gap-3 border-b border-mist/70 py-3 last:border-b-0 hover:bg-white/50 -mx-1 px-1 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage font-semibold">
          Technique
        </p>
        <p className="mt-0.5 text-[15px] font-semibold text-forest group-hover:text-terracotta transition-colors leading-snug">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-sage line-clamp-1 leading-relaxed">{summary}</p>
      </div>
      {done ? (
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive/80 text-forest">
          <CheckIcon className="h-3 w-3" />
        </span>
      ) : (
        <ChevronRightIcon
          className="mt-1 h-4 w-4 shrink-0 text-sage/40 group-hover:text-terracotta transition-colors"
          aria-hidden
        />
      )}
    </NativeLearnCardShell>
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
