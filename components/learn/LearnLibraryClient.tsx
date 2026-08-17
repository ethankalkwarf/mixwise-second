"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  BookOpenIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BeakerIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  LEARN_GUIDES,
  LEARN_METHODS,
  LEARN_PATHS,
  pathStepLabel,
  type LearnGuide,
  type LearnMethod,
  type LearnPath,
} from "@/lib/learnLibrary";
import { getAllTechniqueLearnEntries } from "@/lib/cocktailTechniqueGlossary";
import { SUBSTITUTION_TIPS } from "@/lib/cocktailSubstitutions";
import { normalizeSearchText, searchLearnItems } from "@/lib/search";

type BrowseTab = "guides" | "methods" | "techniques" | "swaps";

const TABS: { id: BrowseTab; label: string; Icon: typeof BookOpenIcon }[] = [
  { id: "guides", label: "Guides", Icon: BookOpenIcon },
  { id: "methods", label: "Methods", Icon: BeakerIcon },
  { id: "techniques", label: "Techniques", Icon: WrenchScrewdriverIcon },
  { id: "swaps", label: "Swaps", Icon: ArrowsRightLeftIcon },
];

const METHOD_ICONS: Record<string, typeof BeakerIcon> = {
  shake: SparklesIcon,
  stir: BeakerIcon,
  build: DocumentTextIcon,
  blend: SparklesIcon,
  layer: ArrowsRightLeftIcon,
  swizzle: BeakerIcon,
  muddle: WrenchScrewdriverIcon,
};

function PathStartCard({
  path,
  featured = false,
  imagePosition = "object-center",
}: {
  path: LearnPath;
  featured?: boolean;
  imagePosition?: string;
}) {
  const minH = featured ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[240px]";

  return (
    <Link
      href={`/learn/paths/${path.slug}`}
      className={`group relative block overflow-hidden rounded-3xl border border-mist bg-forest transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${minH}`}
    >
      <Image
        src={path.coverImage}
        alt=""
        fill
        sizes={featured ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
        className={`pointer-events-none object-cover transition-transform duration-700 group-hover:scale-105 ${imagePosition}`}
        priority={featured}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-forest/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-forest/15" />
      <div className={`relative z-10 flex ${minH} flex-col justify-end p-6 sm:p-8`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] !text-olive font-bold mb-2">
          {path.eyebrow} · ~{path.estimatedMinutes} min
        </p>
        <h3 className="font-display text-2xl sm:text-3xl font-bold !text-cream mb-2 drop-shadow-sm">
          {path.title}
        </h3>
        <p className={`text-sm !text-cream/90 leading-relaxed ${featured ? "max-w-lg" : "line-clamp-2"}`}>
          {path.summary}
        </p>
        {featured && (
          <span className="mt-5 inline-flex w-fit items-center rounded-full bg-terracotta px-4 py-2 text-sm font-semibold !text-cream">
            Start this path →
          </span>
        )}
        {!featured && (
          <ol className="mt-4 space-y-1 border-t border-cream/20 pt-3">
            {path.steps.slice(0, 3).map((step, i) => (
              <li
                key={`${step.type}-${"slug" in step ? step.slug : "swaps"}`}
                className="flex gap-2 text-xs !text-cream/80"
              >
                <span className="font-mono !text-olive w-4 shrink-0">{i + 1}.</span>
                <span className="capitalize">{pathStepLabel(step)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Link>
  );
}

function GuideRow({ guide }: { guide: LearnGuide }) {
  return (
    <Link
      href={`/learn/guides/${guide.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
        <Image
          src={guide.coverImage}
          alt=""
          fill
          sizes="96px"
          className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
          aria-hidden
        />
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
    </Link>
  );
}

function MethodChip({ method }: { method: LearnMethod }) {
  const Icon = METHOD_ICONS[method.slug] ?? BeakerIcon;
  return (
    <Link
      href={`/learn/methods/${method.slug}`}
      className="group flex gap-3 rounded-2xl border border-mist bg-white px-4 py-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream border border-mist text-terracotta group-hover:border-terracotta/30">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <p className="font-display text-lg font-bold text-forest group-hover:text-terracotta transition-colors">
          {method.label}
        </p>
        <p className="text-xs text-terracotta font-medium mt-0.5">{method.cue}</p>
      </span>
    </Link>
  );
}

export function LearnLibraryClient() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<BrowseTab>("guides");
  const techniques = getAllTechniqueLearnEntries();
  const starterPath = LEARN_PATHS[0];
  const otherPaths = LEARN_PATHS.slice(1);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return {
        guides: LEARN_GUIDES,
        methods: LEARN_METHODS,
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
      methods: LEARN_METHODS.filter((m) => methodSlugs.has(m.slug)),
      techniques: techniques.filter((t) => techniqueSlugs.has(t.slug)),
      swaps: SUBSTITUTION_TIPS.filter((tip) =>
        normalizeSearchText([tip.have, tip.use, tip.note || ""].join(" ")).includes(q)
      ),
    };
  }, [query, techniques]);

  const searching = Boolean(query.trim());

  return (
    <div className="space-y-16">
      {/* 1. Guided start */}
      <section>
        <div className="mb-6 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
            Step 1 · Start here
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
            Pick a path — we&apos;ll sequence the rest
          </h2>
          <p className="text-sm text-sage mt-2 leading-relaxed">
            Paths are short curricula. Follow the steps in order; jump into the full library only when you need a reference.
          </p>
        </div>
        <div className="space-y-5">
          <PathStartCard
            path={starterPath}
            featured
            imagePosition="object-[center_20%]"
          />
          <div className="grid gap-5 md:grid-cols-2">
            {otherPaths.map((path) => (
              <PathStartCard key={path.slug} path={path} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Browse library — one tab at a time */}
      <section>
        <div className="mb-5 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
            Step 2 · Browse the library
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
            Or look something up
          </h2>
          <p className="text-sm text-sage mt-2">
            Guides teach judgment. Methods and techniques are quick references while you mix.
          </p>
        </div>

        <div className="relative max-w-xl mb-5">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, shake, agave, swaps…"
            className="w-full rounded-2xl border border-mist bg-white py-3.5 pl-12 pr-4 text-sm text-forest placeholder:text-sage/70 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          />
        </div>

        {!searching && (
          <div
            className="flex flex-wrap gap-2 mb-6 border-b border-mist pb-4"
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
                </button>
              );
            })}
          </div>
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.methods.map((m) => (
                    <MethodChip key={m.slug} method={m} />
                  ))}
                </div>
              </BrowseBlock>
            )}
            {filtered.techniques.length > 0 && (
              <BrowseBlock title="Techniques">
                <TechniqueList techniques={filtered.techniques} />
              </BrowseBlock>
            )}
            {filtered.swaps.length > 0 && (
              <BrowseBlock title="Swaps">
                <SwapPreview tips={filtered.swaps} />
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.methods.map((m) => (
                  <MethodChip key={m.slug} method={m} />
                ))}
              </div>
            )}
            {tab === "techniques" && <TechniqueList techniques={filtered.techniques} />}
            {tab === "swaps" && <SwapPreview tips={filtered.swaps} showAllLink />}
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

function TechniqueList({
  techniques,
}: {
  techniques: ReturnType<typeof getAllTechniqueLearnEntries>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {techniques.map((term) => (
        <Link
          key={term.slug}
          href={`/learn/techniques/${term.slug}`}
          className="rounded-xl border border-mist bg-white px-4 py-3 hover:border-terracotta/30 transition-colors"
        >
          <p className="font-display font-bold text-forest capitalize text-base">{term.label}</p>
          <p className="text-xs text-sage line-clamp-2 mt-1">{term.explanation}</p>
        </Link>
      ))}
    </div>
  );
}

function SwapPreview({
  tips,
  showAllLink = false,
}: {
  tips: typeof SUBSTITUTION_TIPS;
  showAllLink?: boolean;
}) {
  const list = tips.slice(0, showAllLink ? 6 : tips.length);
  return (
    <div className="space-y-3">
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((tip) => (
          <li key={tip.id} className="rounded-xl border border-mist bg-white px-4 py-3 text-sm text-forest">
            <span className="font-medium">{tip.have}</span>{" "}
            <span className="text-sage">→</span> {tip.use}
          </li>
        ))}
      </ul>
      {showAllLink && (
        <Link href="/learn/swaps" className="inline-block text-sm font-medium text-terracotta hover:underline">
          Open full swap guide →
        </Link>
      )}
    </div>
  );
}
