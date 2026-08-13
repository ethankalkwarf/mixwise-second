"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { LearnLessonLayers, LearnSource } from "@/lib/learnTypes";
import { LearnSectionBlock, LEARN_LABEL, LEARN_HEADING, LEARN_BODY } from "@/components/learn/LearnSectionBlock";

type Props = {
  layers: LearnLessonLayers;
  /** Optional mid-article visual (methods) */
  midFigure?: React.ReactNode;
  /** Content after core, before deepen (checks get passed separately by parent) */
  afterCore?: React.ReactNode;
};

/**
 * Layered lesson: big idea → core → go deeper → sources.
 */
export function LearnLessonArticle({ layers, midFigure, afterCore }: Props) {
  const hasDeep = (layers.deepDive?.length ?? 0) > 0;
  const hasSources = (layers.sources?.length ?? 0) > 0;
  const deepCount = layers.deepDive?.length ?? 0;
  const [deepOpen, setDeepOpen] = useState(false);

  return (
    <div className="space-y-14">
      {/* Big idea */}
      <header className="space-y-8">
        <div>
          <p className={LEARN_LABEL}>The big idea</p>
          <p className="font-display text-2xl sm:text-[1.75rem] !text-charcoal leading-snug tracking-tight">
            {layers.bigIdea}
          </p>
        </div>

        <div>
          <p className={LEARN_LABEL}>Take with you</p>
          <ol className="space-y-3">
            {layers.keyTakeaways.map((item, i) => (
              <li key={item.slice(0, 32)} className={`flex gap-3 ${LEARN_BODY}`}>
                <span className="font-display text-lg !text-terracotta shrink-0 w-6 tabular-nums">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="border-t border-mist" />

      {/* Core lesson */}
      <div className="space-y-14">
        <p className={LEARN_LABEL}>The lesson</p>
        {layers.sections.map((section, index) => (
          <div key={section.heading}>
            {midFigure && index === 1 ? <div className="mb-14">{midFigure}</div> : null}
            <LearnSectionBlock section={section} />
          </div>
        ))}
        {midFigure && layers.sections.length <= 1 ? midFigure : null}
      </div>

      {/* Go deeper — optional study before checks/practice */}
      {hasDeep && (
        <section className="border-t border-mist pt-10">
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
            <div className="mt-10 space-y-14 border-t border-mist/80 pt-10">
              {layers.deepDive!.map((section) => (
                <LearnSectionBlock key={section.heading} section={section} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sources */}
      {hasSources && <LearnSourcesList sources={layers.sources!} />}

      {afterCore ? <div className="space-y-14 border-t border-mist pt-10">{afterCore}</div> : null}
    </div>
  );
}

function LearnSourcesList({ sources }: { sources: LearnSource[] }) {
  return (
    <section className="border-t border-mist pt-10">
      <p className={LEARN_LABEL}>Sources & further reading</p>
      <h2 className={LEARN_HEADING}>Cited and recommended</h2>
      <ol className="space-y-5">
        {sources.map((source, index) => (
          <li key={source.label} className="flex gap-4">
            <span className="font-display text-lg !text-terracotta shrink-0 w-6 tabular-nums pt-0.5">
              {index + 1}.
            </span>
            <div>
              {source.href ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LEARN_BODY} !text-charcoal underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta`}
                >
                  {source.label}
                </a>
              ) : (
                <p className={LEARN_BODY}>{source.label}</p>
              )}
              {source.note && (
                <p className="text-[15px] !text-charcoal/60 leading-relaxed mt-1">{source.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
