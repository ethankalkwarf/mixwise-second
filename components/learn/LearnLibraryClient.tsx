"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { LEARN_GUIDES } from "@/lib/learnLibrary";
import { getAllTechniqueLearnEntries, METHOD_TIPS } from "@/lib/cocktailTechniqueGlossary";
import { SUBSTITUTION_TIPS } from "@/lib/cocktailSubstitutions";

export function LearnLibraryClient() {
  const [query, setQuery] = useState("");
  const techniques = getAllTechniqueLearnEntries();
  const methods = Object.values(
    Object.fromEntries(Object.entries(METHOD_TIPS).map(([, tip]) => [tip.label, tip]))
  );

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LEARN_GUIDES;
    return LEARN_GUIDES.filter((g) => {
      const hay = [g.title, g.summary, g.eyebrow, ...g.topics].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const filteredTechniques = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return techniques;
    return techniques.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.explanation.toLowerCase().includes(q) ||
        (t.why || "").toLowerCase().includes(q)
    );
  }, [query, techniques]);

  const filteredMethods = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return methods;
    return methods.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tip.toLowerCase().includes(q)
    );
  }, [query, methods]);

  const showSwaps =
    !query.trim() ||
    ["swap", "substitut", "replace", "cointreau", "mezcal", "egg"].some((k) =>
      query.toLowerCase().includes(k)
    );

  return (
    <div className="space-y-14">
      <div className="relative max-w-xl">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search techniques, balance, agave, zero-proof…"
          className="w-full rounded-2xl border border-mist bg-white py-3.5 pl-12 pr-4 text-sm text-forest placeholder:text-sage/70 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
        />
      </div>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
              Guides
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest">
              Train like you mean it
            </h2>
          </div>
        </div>
        {filteredGuides.length === 0 ? (
          <p className="text-sm text-sage">No guides match that search.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredGuides.map((guide, index) => (
              <Link
                key={guide.slug}
                href={`/learn/guides/${guide.slug}`}
                className={`group relative overflow-hidden rounded-3xl border border-mist p-6 transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
                  index === 0 ? "md:col-span-2 bg-gradient-to-br from-forest to-forest/85 text-cream" : "bg-white"
                }`}
              >
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] mb-2 ${
                    index === 0 ? "text-olive" : "text-terracotta"
                  }`}
                >
                  {guide.eyebrow} · {guide.readingMinutes} min
                </p>
                <h3
                  className={`font-display text-2xl font-bold mb-2 ${
                    index === 0 ? "text-cream" : "text-forest group-hover:text-terracotta"
                  }`}
                >
                  {guide.title}
                </h3>
                <p className={`text-sm leading-relaxed max-w-2xl ${index === 0 ? "text-cream/80" : "text-sage"}`}>
                  {guide.summary}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
          Core methods
        </p>
        <h2 className="font-display text-2xl font-bold text-forest mb-5">Shake, stir, build, blend…</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMethods.map((method) => (
            <div key={method.label} className="rounded-2xl border border-mist bg-white p-5 shadow-soft">
              <h3 className="font-display text-xl font-bold text-forest mb-1">{method.label}</h3>
              <p className="text-sm text-terracotta font-medium mb-2">{method.cue}</p>
              <p className="text-sm text-sage leading-relaxed mb-2">{method.summary}</p>
              <p className="text-sm text-sage/90 leading-relaxed">{method.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
          Technique deep-dives
        </p>
        <h2 className="font-display text-2xl font-bold text-forest mb-5">Jargon, decoded</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredTechniques.map((term) => (
            <Link
              key={term.slug}
              href={`/learn/techniques/${term.slug}`}
              className="rounded-2xl border border-mist bg-white p-5 shadow-soft hover:border-terracotta/30 transition-all"
            >
              <h3 className="font-display text-lg font-bold text-forest capitalize mb-1">{term.label}</h3>
              <p className="text-sm text-sage line-clamp-3">{term.explanation}</p>
            </Link>
          ))}
        </div>
      </section>

      {showSwaps && (
        <section className="rounded-3xl border border-mist bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
                When you&apos;re stuck
              </p>
              <h2 className="font-display text-2xl font-bold text-forest">Smart swaps</h2>
              <p className="text-sm text-sage mt-1 max-w-xl">
                Practical bottle substitutions — kept here so recipe pages stay focused on making the drink as written.
              </p>
            </div>
            <Link href="/learn/swaps" className="text-sm font-medium text-terracotta hover:underline">
              Open full swap guide →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SUBSTITUTION_TIPS.slice(0, 4).map((tip) => (
              <li key={tip.id} className="rounded-xl bg-cream border border-mist px-4 py-3">
                <p className="text-sm text-forest font-medium">
                  {tip.have} <span className="text-sage font-normal">→</span> {tip.use}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
