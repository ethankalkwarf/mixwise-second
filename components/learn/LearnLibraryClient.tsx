"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  isLearnLessonTab,
  LEARN_FILTER_STATE_KEY,
  type LearnHubMode,
  type LearnLessonTab,
  writeLearnLibraryState,
} from "@/lib/learnLibraryNavigation";

type HubMode = LearnHubMode;
type LessonTab = LearnLessonTab;

const LESSON_TABS: {
  id: LessonTab;
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

function PathStarterBand({ path }: { path: LearnPath }) {
  const { pathStats, isAuthenticated } = useLearnProgress();
  const stats = pathStats.find((item) => item.path.slug === path.slug);
  const pct = stats?.pct ?? 0;
  const done = stats?.done ?? 0;
  const total = stats?.total ?? path.steps.length;

  return (
    <NativeLearnCardShell
      href={`/learn/paths/${path.slug}`}
      ariaLabel={path.title}
      className="group grid overflow-hidden rounded-3xl border border-mist bg-white transition-all hover:border-terracotta/30 hover:shadow-card-hover md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
    >
      <div className="native-learn-card__photo native-learn-card__photo--path relative aspect-[16/10] overflow-hidden bg-mist md:aspect-auto md:min-h-[220px]">
        <LearnCoverImage
          src={path.coverImage}
          alt=""
          priority
          fill
          className="pointer-events-none object-cover object-[center_22%] transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 42vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-terracotta px-3 py-1 text-[11px] font-semibold !text-cream">
          Start here
        </span>
      </div>
      <div className="flex flex-col justify-center p-5 sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-1.5">
          {path.eyebrow} · {path.steps.length} lessons · ~{path.estimatedMinutes} min
          {isAuthenticated && done > 0 ? ` · ${done}/${total}` : ""}
        </p>
        <h3 className="font-display text-2xl font-bold text-forest group-hover:text-terracotta transition-colors">
          {path.title}
        </h3>
        <p className="mt-2 text-sm text-sage leading-relaxed line-clamp-3">{path.summary}</p>
        {isAuthenticated && (
          <div className="mt-4 h-1 max-w-xs rounded-full bg-mist overflow-hidden">
            <div
              className="h-full rounded-full bg-olive transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        <span className="mt-5 inline-flex w-fit text-sm font-semibold text-terracotta">
          Open path →
        </span>
      </div>
    </NativeLearnCardShell>
  );
}

function PathMediaRow({ path }: { path: LearnPath }) {
  const { pathStats, isAuthenticated } = useLearnProgress();
  const stats = pathStats.find((item) => item.path.slug === path.slug);
  const pct = stats?.pct ?? 0;
  const done = stats?.done ?? 0;
  const total = stats?.total ?? path.steps.length;

  return (
    <NativeLearnCardShell
      href={`/learn/paths/${path.slug}`}
      ariaLabel={path.title}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="native-learn-card__photo relative h-[4.75rem] w-28 shrink-0 overflow-hidden rounded-xl bg-mist sm:h-24 sm:w-36">
        <LearnCoverImage
          src={path.coverImage}
          alt=""
          fill
          className="pointer-events-none object-cover object-[center_25%] transition-transform duration-500 group-hover:scale-105"
          sizes="144px"
        />
      </div>
      <div className="min-w-0 flex flex-1 flex-col justify-center py-0.5 pr-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold">
          {path.eyebrow} · {path.steps.length} lessons · ~{path.estimatedMinutes} min
          {isAuthenticated && done > 0 ? ` · ${done}/${total}` : ""}
        </p>
        <h3 className="font-display text-lg font-bold text-forest group-hover:text-terracotta transition-colors mt-0.5">
          {path.title}
        </h3>
        <p className="text-xs text-sage line-clamp-1 mt-1">{path.summary}</p>
        {isAuthenticated && done > 0 && (
          <div className="mt-2 h-1 max-w-[10rem] rounded-full bg-mist overflow-hidden">
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

function GuidePhotoRow({ guide }: { guide: LearnGuide }) {
  const { isComplete, isAuthenticated } = useLearnProgress();
  const done = isAuthenticated && isComplete("guide", guide.slug);

  return (
    <NativeLearnCardShell
      href={`/learn/guides/${guide.slug}`}
      ariaLabel={guide.title}
      className="group flex gap-3 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="native-learn-card__photo relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
        <LearnCoverImage
          src={guide.coverImage}
          alt=""
          fill
          className="transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          sizes="80px"
        />
        {done && (
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-olive text-forest">
            <CheckIcon className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center py-0.5 pr-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-terracotta font-bold mb-0.5">
          {guide.eyebrow} · {guide.readingMinutes} min
        </p>
        <h3 className="font-display text-base font-bold text-forest group-hover:text-terracotta transition-colors">
          {guide.title}
        </h3>
        <p className="text-xs text-sage line-clamp-2 mt-1">{guide.summary}</p>
      </div>
    </NativeLearnCardShell>
  );
}

function MethodPhotoRow({ method }: { method: LearnMethod }) {
  const { isComplete, isAuthenticated } = useLearnProgress();
  const done = isAuthenticated && isComplete("method", method.slug);

  return (
    <NativeLearnCardShell
      href={`/learn/methods/${method.slug}`}
      ariaLabel={method.label}
      className="group flex gap-3 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="native-learn-card__photo relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
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
        <p className="font-display text-base font-bold text-forest group-hover:text-terracotta transition-colors mt-0.5">
          {method.label}
        </p>
        <p className="text-xs text-sage line-clamp-1 mt-1">{method.summary}</p>
      </span>
    </NativeLearnCardShell>
  );
}

export function LearnLibraryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nativeShell = useNativeShell();

  const mode: HubMode = searchParams.get("tab") === "lessons" ? "lessons" : "paths";
  const sectionParam = searchParams.get("section");
  const [lessonTab, setLessonTab] = useState<LessonTab>(() =>
    isLearnLessonTab(sectionParam) ? sectionParam : "guides"
  );
  const [query, setQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const techniques = getAllTechniqueLearnEntries();
  const starterPath = LEARN_PATHS[0];
  const otherPaths = useMemo(
    () => LEARN_PATHS.filter((p) => p.slug !== starterPath.slug),
    [starterPath.slug]
  );

  useEffect(() => {
    if (isLearnLessonTab(sectionParam)) {
      setLessonTab(sectionParam);
    }
  }, [sectionParam]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LEARN_FILTER_STATE_KEY);
      if (!saved) {
        setIsInitialized(true);
        return;
      }
      const state = JSON.parse(saved) as { mode?: HubMode; lessonTab?: LessonTab };
      if (!searchParams.get("tab") && state.mode === "lessons") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", "lessons");
        if (isLearnLessonTab(state.lessonTab) && state.lessonTab !== "guides") {
          params.set("section", state.lessonTab);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else if (!sectionParam && isLearnLessonTab(state.lessonTab)) {
        setLessonTab(state.lessonTab);
      }
    } catch {
      /* ignore */
    }
    setIsInitialized(true);
  }, [pathname, router, searchParams, sectionParam]);

  useEffect(() => {
    if (!isInitialized) return;
    writeLearnLibraryState({ mode, lessonTab });
  }, [isInitialized, mode, lessonTab]);

  const setMode = useCallback(
    (next: HubMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "lessons") {
        params.set("tab", "lessons");
        if (lessonTab !== "guides") {
          params.set("section", lessonTab);
        } else {
          params.delete("section");
        }
      } else {
        params.delete("tab");
        params.delete("section");
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [lessonTab, pathname, router, searchParams]
  );

  const setLessonTabPersisted = useCallback(
    (next: LessonTab) => {
      setLessonTab(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "lessons");
      if (next === "guides") {
        params.delete("section");
      } else {
        params.set("section", next);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const lessonTabCounts: Record<LessonTab, number> = {
    guides: LEARN_GUIDES.length,
    methods: LEARN_LIBRARY_METHODS.length,
    techniques: techniques.length,
    swaps: SUBSTITUTION_TIPS.length,
  };
  const activeLessonTab = LESSON_TABS.find((item) => item.id === lessonTab) ?? LESSON_TABS[0];

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
    <div className={nativeShell ? "native-learn-library space-y-6" : "space-y-8"}>
      <div
        className="inline-flex rounded-full border border-mist bg-white p-1"
        role="tablist"
        aria-label="Learn modes"
      >
        {(
          [
            { id: "paths" as const, label: "Paths" },
            { id: "lessons" as const, label: "Lessons" },
          ] as const
        ).map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-forest text-cream"
                  : "text-forest hover:bg-mist/60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <LibraryContinueStrip />

      {mode === "paths" ? (
        <section aria-label="Paths">
          <div className="mb-6 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
              Follow a path
            </h2>
            <p className="mt-2 text-sm text-sage max-w-xl">
              Guided sequences — follow step by step.
            </p>
          </div>

          <PathStarterBand path={starterPath} />

          <div className="mt-8 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage font-bold mb-3">
              All paths · {otherPaths.length}
            </p>
            {otherPaths.map((path) => (
              <PathMediaRow key={path.slug} path={path} />
            ))}
          </div>
        </section>
      ) : (
        <section aria-label="Lessons">
          <div className="mb-5 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
              Look up a lesson
            </h2>
            <p className="mt-2 text-sm text-sage max-w-xl">
              Single topics — look up what you need.
            </p>
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
              aria-label="Lesson types"
            >
              {LESSON_TABS.map((item) => {
                const active = lessonTab === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setLessonTabPersisted(item.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-forest text-cream"
                        : "bg-white text-forest border border-mist hover:border-terracotta/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                    <span className={active ? "text-cream/70" : "text-sage"}>
                      {lessonTabCounts[item.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {!searching && (
            <p className="text-sm text-sage mb-6">{activeLessonTab.hint}</p>
          )}

          {searching ? (
            <div className="space-y-10">
              {filtered.guides.length > 0 && (
                <BrowseBlock title="Guides">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.guides.map((g) => (
                      <GuidePhotoRow key={g.slug} guide={g} />
                    ))}
                  </div>
                </BrowseBlock>
              )}
              {filtered.methods.length > 0 && (
                <BrowseBlock title="Methods">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.methods.map((m) => (
                      <MethodPhotoRow key={m.slug} method={m} />
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
              {lessonTab === "guides" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.guides.map((g) => (
                    <GuidePhotoRow key={g.slug} guide={g} />
                  ))}
                </div>
              )}
              {lessonTab === "methods" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.methods.map((m) => (
                    <MethodPhotoRow key={m.slug} method={m} />
                  ))}
                </div>
              )}
              {lessonTab === "techniques" && (
                <LearnTechniqueIndex techniques={filtered.techniques} />
              )}
              {lessonTab === "swaps" && (
                <LearnSwapIndex tips={filtered.swaps} showAllLink />
              )}
            </>
          )}
        </section>
      )}
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
      className="flex items-center justify-between gap-3 rounded-2xl border border-mist bg-white px-4 py-3 hover:border-terracotta/40 transition-colors"
    >
      <p className="text-sm text-forest">{formatLearnProgressLine(level, lessonsDone, lessonsTotal)}</p>
      <span className="text-sm font-semibold text-terracotta shrink-0">
        {lessonsDone === 0 ? "Start" : "Continue"} →
      </span>
    </Link>
  );
}
