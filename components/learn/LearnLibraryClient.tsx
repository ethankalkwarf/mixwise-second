"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { LearnCoverImage } from "@/components/learn/LearnCoverImage";
import { NativeLearnCardShell } from "@/components/mobile/NativeLearnCardShell";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { formatLearnProgressLine } from "@/lib/learnProgressCopy";
import {
  LEARN_GUIDES,
  LEARN_LIBRARY_METHODS,
  LEARN_PATHS,
  type LearnGuide,
  type LearnMethod,
  type LearnPath,
} from "@/lib/learnLibrary";
import { getAllTechniqueLearnEntries } from "@/lib/cocktailTechniqueGlossary";
import { SUBSTITUTION_TIPS } from "@/lib/cocktailSubstitutions";
import { normalizeSearchText, searchLearnItems } from "@/lib/search";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { LearnTechniqueIndex } from "@/components/learn/LearnTechniqueIndex";
import { LearnSwapIndex } from "@/components/learn/LearnSwapIndex";

type BrowseTab = "guides" | "methods" | "techniques" | "swaps";

const TABS: {
  id: BrowseTab;
  label: string;
  hint: string;
  Icon: typeof BookOpenIcon;
}[] = [
  {
    id: "guides",
    label: "Guides",
    hint: "Ideas and judgment — templates, ice, balance, garnish.",
    Icon: BookOpenIcon,
  },
  {
    id: "methods",
    label: "Methods",
    hint: "The four ways you mix: shake, stir, build, blend.",
    Icon: BeakerIcon,
  },
  {
    id: "techniques",
    label: "Techniques",
    hint: "Smaller moves inside a drink: dry-shake, express, muddle.",
    Icon: WrenchScrewdriverIcon,
  },
  {
    id: "swaps",
    label: "Swaps",
    hint: "What to pour when a bottle is missing.",
    Icon: ArrowsRightLeftIcon,
  },
];

function PathStartCard({
  path,
  recommended = false,
}: {
  path: LearnPath;
  recommended?: boolean;
}) {
  const { pathStats, isAuthenticated } = useLearnProgress();
  const stats = pathStats.find((item) => item.path.slug === path.slug);
  const pct = stats?.pct ?? 0;
  const done = stats?.done ?? 0;
  const total = stats?.total ?? path.steps.length;

  return (
    <NativeLearnCardShell
      href={`/learn/paths/${path.slug}`}
      ariaLabel={path.title}
      className="group flex flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all hover:-translate-y-0.5 hover:border-terracotta/30 hover:shadow-card-hover"
    >
      <div className="native-learn-card__photo native-learn-card__photo--path relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[5/3]">
        <LearnCoverImage
          src={path.coverImage}
          alt=""
          priority={recommended}
          fill
          className="pointer-events-none object-[center_22%] transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/50 to-transparent" />
        {recommended && (
          <span className="absolute top-3 left-3 rounded-full bg-terracotta px-3 py-1 text-[11px] font-semibold !text-cream">
            Start here
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1.5">
          Course · {path.steps.length} lessons · ~{path.estimatedMinutes} min
          {isAuthenticated && done > 0 ? ` · ${done}/${total}` : ""}
        </p>
        <h3 className="font-display text-xl font-bold text-forest group-hover:text-terracotta transition-colors">
          {path.title}
        </h3>
        {isAuthenticated && (
          <div className="mt-4 h-1 rounded-full bg-mist overflow-hidden">
            <div
              className="h-full rounded-full bg-olive transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </NativeLearnCardShell>
  );
}

function GuideRow({ guide }: { guide: LearnGuide }) {
  const { isComplete, isAuthenticated } = useLearnProgress();
  const done = isAuthenticated && isComplete("guide", guide.slug);

  return (
    <NativeLearnCardShell
      href={`/learn/guides/${guide.slug}`}
      ariaLabel={guide.title}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="native-learn-card__photo relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
        <LearnCoverImage
          src={guide.coverImage}
          alt=""
          fill
          className="transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          sizes="96px"
        />
        {done && (
          <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-olive text-forest">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center py-1 pr-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold mb-0.5">
          {guide.eyebrow} · {guide.readingMinutes} min
        </p>
        <h3 className="font-display text-lg font-bold text-forest group-hover:text-terracotta transition-colors">
          {guide.title}
        </h3>
        <p className="text-xs text-sage line-clamp-2 mt-1">{guide.summary}</p>
      </div>
    </NativeLearnCardShell>
  );
}

function MethodChip({ method }: { method: LearnMethod }) {
  const { isComplete, isAuthenticated } = useLearnProgress();
  const done = isAuthenticated && isComplete("method", method.slug);

  return (
    <NativeLearnCardShell
      href={`/learn/methods/${method.slug}`}
      ariaLabel={method.label}
      className="group flex gap-3 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="native-learn-card__photo relative h-[4.75rem] w-[5.5rem] sm:h-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
        <LearnCoverImage
          src={method.coverImage}
          alt={method.coverAlt}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="96px"
        />
        {done && (
          <span className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-forest">
            <CheckIcon className="h-3 w-3" />
          </span>
        )}
      </div>
      <span className="min-w-0 flex flex-col justify-center py-0.5 pr-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold">
          {method.cue}
        </p>
        <p className="font-display text-lg font-bold text-forest group-hover:text-terracotta transition-colors mt-0.5">
          {method.label}
        </p>
        <p className="text-xs text-sage line-clamp-1 mt-1">{method.summary}</p>
      </span>
    </NativeLearnCardShell>
  );
}

export function LearnLibraryClient() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<BrowseTab>("guides");
  const nativeShell = useNativeShell();
  const techniques = getAllTechniqueLearnEntries();
  const starterPath = LEARN_PATHS[0];
  const tabCounts: Record<BrowseTab, number> = {
    guides: LEARN_GUIDES.length,
    methods: LEARN_LIBRARY_METHODS.length,
    techniques: techniques.length,
    swaps: SUBSTITUTION_TIPS.length,
  };
  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0];

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return {
        guides: LEARN_GUIDES,
        methods: LEARN_LIBRARY_METHODS,
        techniques,
        swaps: SUBSTITUTION_TIPS,
      };
    }

    const learnHits = searchLearnItems(query, { limit: 50 });
    const guideSlugs = new Set(
      learnHits.filter((h) => h.kind === "guide").map((h) => h.id)
    );
    const methodSlugs = new Set(
      learnHits.filter((h) => h.kind === "method").map((h) => h.id)
    );
    const techniqueSlugs = new Set(
      learnHits.filter((h) => h.kind === "technique").map((h) => h.id)
    );

    const q = normalizeSearchText(query);
    return {
      guides: LEARN_GUIDES.filter((g) => guideSlugs.has(g.slug)),
      methods: LEARN_LIBRARY_METHODS.filter((m) => methodSlugs.has(m.slug)),
      techniques: techniques.filter((t) => techniqueSlugs.has(t.slug)),
      swaps: SUBSTITUTION_TIPS.filter((tip) =>
        normalizeSearchText([tip.have, tip.use, tip.note || ""].join(" ")).includes(q)
      ),
    };
  }, [query, techniques]);

  const searching = Boolean(query.trim());

  return (
    <div className={nativeShell ? "native-learn-library space-y-8" : "space-y-16"}>
      {/* Courses — playlists of library lessons */}
      <section>
        <div className="mb-6 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
            Courses
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
            Start a course
          </h2>
          <LibraryContinueStrip />
        </div>
        <div className={nativeShell ? "grid gap-4 md:grid-cols-2" : "grid gap-5 md:grid-cols-3"}>
          {LEARN_PATHS.map((path) => (
            <PathStartCard
              key={path.slug}
              path={path}
              recommended={path.slug === starterPath.slug}
            />
          ))}
        </div>
      </section>

      {/* Lesson library */}
      <section id="lessons">
        <div className="mb-5 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
            Lessons
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
            Or open one lesson
          </h2>
        </div>

        <div className="relative max-w-xl mb-5">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, ice, shake, vermouth…"
            className="w-full rounded-2xl border border-mist bg-white py-3.5 pl-12 pr-4 text-sm text-forest placeholder:text-sage/70 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          />
        </div>

        {!searching && (
          <div
            className="flex flex-wrap gap-2 mb-3 border-b border-mist pb-4"
            role="tablist"
            aria-label="Library sections"
          >
            {TABS.map((item) => {
              const active = tab === item.id;
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-forest text-cream"
                      : "bg-white text-forest border border-mist hover:border-terracotta/40"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                  <span className={active ? "text-cream/70" : "text-sage"}>{tabCounts[item.id]}</span>
                </button>
              );
            })}
          </div>
        )}
        {!searching && (
          <p className="text-sm text-sage mb-6">{activeTab.hint}</p>
        )}

        {searching ? (
          <div className="space-y-10">
            {filtered.guides.length > 0 && (
              <BrowseBlock title="Guides">
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.guides.map((g) => (
                    <GuideRow key={g.slug} guide={g} />
                  ))}
                </div>
              </BrowseBlock>
            )}
            {filtered.methods.length > 0 && (
              <BrowseBlock title="Methods">
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.methods.map((m) => (
                    <MethodChip key={m.slug} method={m} />
                  ))}
                </div>
              </BrowseBlock>
            )}
            {filtered.techniques.length > 0 && (
              <BrowseBlock title="Techniques">
                <LearnTechniqueIndex techniques={filtered.techniques} />
              </BrowseBlock>
            )}
            {filtered.swaps.length > 0 && (
              <BrowseBlock title="Swaps">
                <LearnSwapIndex tips={filtered.swaps} />
              </BrowseBlock>
            )}
            {filtered.guides.length === 0 &&
              filtered.methods.length === 0 &&
              filtered.techniques.length === 0 &&
              filtered.swaps.length === 0 && (
                <p className="text-sm text-sage">Nothing matches that search.</p>
              )}
          </div>
        ) : (
          <>
            {tab === "guides" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.guides.map((g) => (
                  <GuideRow key={g.slug} guide={g} />
                ))}
              </div>
            )}
            {tab === "methods" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.methods.map((m) => (
                  <MethodChip key={m.slug} method={m} />
                ))}
              </div>
            )}
            {tab === "techniques" && <LearnTechniqueIndex techniques={filtered.techniques} />}
            {tab === "swaps" && <LearnSwapIndex tips={filtered.swaps} showAllLink />}
          </>
        )}
      </section>
    </div>
  );
}

function BrowseBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-forest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function LibraryContinueStrip() {
  const { isAuthenticated, isLoading, level, lessonsDone, lessonsTotal, continueHref: nextHref } =
    useLearnProgress();

  if (!isAuthenticated || isLoading) return null;

  return (
    <Link
      href={nextHref || "/learn"}
      className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-terracotta/25 bg-white px-4 py-3 hover:border-terracotta/50 transition-colors"
    >
      <p className="text-sm text-forest">{formatLearnProgressLine(level, lessonsDone, lessonsTotal)}</p>
      <span className="text-sm font-semibold text-terracotta shrink-0">
        {lessonsDone === 0 ? "Start" : "Continue"} →
      </span>
    </Link>
  );
}
