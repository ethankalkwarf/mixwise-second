"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { LearnLessonLayers, LearnSource } from "@/lib/learnTypes";
import { LearnSectionBlock, LEARN_LABEL, LEARN_HEADING, LEARN_BODY, LEARN_LEDE } from "@/components/learn/LearnSectionBlock";
import { LearnStepDeck } from "@/components/learn/LearnStepDeck";
import {
  LearnLessonChallengeButton,
  LearnLessonReadSentinel,
} from "@/components/learn/LearnLessonChallenge";

type Props = {
  layers: LearnLessonLayers;
  /** Optional mid-article visual (methods) */
  midFigure?: React.ReactNode;
  /** Technique slug for numbered “How to do it” lists */
  techniqueSlug?: string;
  /** Content after core, before deepen (checks get passed separately by parent) */
  afterCore?: React.ReactNode;
};

/**
 * Layered lesson: big idea → core → go deeper → sources.
 * Flat reading flow — one heading level at a time, no stacked meta labels.
 */
export function LearnLessonArticle({ layers, midFigure, techniqueSlug, afterCore }: Props) {
  const hasDeep = (layers.deepDive?.length ?? 0) > 0;
  const hasSources = (layers.sources?.length ?? 0) > 0;
  const deepCount = layers.deepDive?.length ?? 0;
  const takeaways = layers.keyTakeaways ?? [];
  const [deepOpen, setDeepOpen] = useState(false);

  return (
    <div className="learn-lesson-stack space-y-8 sm:space-y-10">
      <header className="learn-lesson-intro space-y-6">
        <div>
          <p className={LEARN_LABEL}>The big idea</p>
          <p className={LEARN_LEDE}>{layers.bigIdea}</p>
        </div>

        {takeaways.length >= 2 ? (
          <LearnStepDeck
            kicker=""
            title={`${takeaways.length} things to remember`}
            steps={takeaways.map((item) => ({ title: "", body: item }))}
            variant="takeaway"
          />
        ) : takeaways.length === 1 ? (
          <div>
            <p className={LEARN_LABEL}>Take with you</p>
            <ol className="space-y-3">
              {takeaways.map((item, i) => (
                <li key={item.slice(0, 32)} className={`flex gap-3 ${LEARN_BODY}`}>
                  <span className="font-display text-lg !text-terracotta shrink-0 w-6 tabular-nums">
                    {i + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </header>

      {/* Core lesson — open flow, not a nested panel of panels */}
      <div className="learn-lesson-core space-y-10 sm:space-y-12">
        {layers.sections.map((section, index) => (
          <div key={section.heading} className="learn-lesson-section">
            {midFigure && index === 1 ? <div className="mb-10">{midFigure}</div> : null}
            <LearnSectionBlock section={section} techniqueSlug={techniqueSlug} />
          </div>
        ))}
        {midFigure && layers.sections.length <= 1 ? midFigure : null}
      </div>

      {hasDeep && (
        <section className="learn-lesson-deepen border-t border-mist/80 pt-8">
          <button
            type="button"
            onClick={() => setDeepOpen((v) => !v)}
            className="group flex w-full items-end justify-between gap-4 text-left"
            aria-expanded={deepOpen}
          >
            <div>
              <p className={LEARN_LABEL}>Go deeper</p>
              <h2 className={`${LEARN_HEADING} mb-0 group-hover:text-terracotta transition-colors`}>
                In-depth study & review
              </h2>
              <p className={`${LEARN_BODY} !text-charcoal/60 mt-2`}>
                {deepCount} deeper section{deepCount === 1 ? "" : "s"} — history, technique nuance, and
                the “why” behind the rule.
              </p>
            </div>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-terracotta/25 text-terracotta transition-colors group-hover:border-terracotta/50 group-hover:bg-terracotta/5 ${
                deepOpen ? "bg-terracotta/5" : ""
              }`}
            >
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform duration-300 ${deepOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </span>
          </button>

          {deepOpen && (
            <div className="mt-8 space-y-10 border-t border-mist/80 pt-8">
              {layers.deepDive!.map((section) => (
                <LearnSectionBlock key={section.heading} section={section} techniqueSlug={techniqueSlug} />
              ))}
            </div>
          )}
        </section>
      )}

      {hasSources && <LearnSourcesList sources={layers.sources!} />}

      <LearnLessonReadSentinel />
      <div className="learn-quiz-inline-cta">
        <LearnLessonChallengeButton />
      </div>

      {afterCore ? (
        <div className="learn-lesson-stack space-y-8 pt-2">{afterCore}</div>
      ) : null}
    </div>
  );
}

function LearnSourcesList({ sources }: { sources: LearnSource[] }) {
  return (
    <aside className="border-t border-mist/80 pt-8">
      <p className={LEARN_LABEL}>Cited and recommended</p>
      <ol className="space-y-2.5">
        {sources.map((source, index) => (
          <li key={source.label} className="flex gap-2.5 text-[13px] leading-relaxed !text-charcoal/65">
            <span className="shrink-0 w-4 tabular-nums !text-charcoal/40">{index + 1}.</span>
            <span>
              {source.href ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-terracotta/25 underline-offset-2 hover:decoration-terracotta !text-charcoal/75"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
              {source.note ? <span className="!text-charcoal/50"> — {source.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
