import type { LearnSection } from "@/lib/learnTypes";
import { LearnFigure, hasLearnPhotoFigure } from "@/components/learn/LearnFigure";
import { LearnStepDeck } from "@/components/learn/LearnStepDeck";
import { deckUsesFigure, resolveStepDeck } from "@/lib/learnStepDecks";

/** Shared Learn lesson type scale — keep every section on the same steps. */
export const LEARN_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-3";
export const LEARN_HEADING =
  "font-display text-2xl font-bold !text-charcoal mb-4 tracking-tight";
export const LEARN_BODY = "text-[17px] !text-charcoal/85 leading-[1.7]";
/** Multi-line thesis / deck — Jost, not the display serif. */
export const LEARN_LEDE =
  "font-sans text-[1.2rem] sm:text-[1.3rem] font-medium !text-charcoal leading-[1.55]";

type SectionBlockProps = {
  section: LearnSection;
  /** Technique slug — enables step deck for “How to do it” on technique lessons. */
  techniqueSlug?: string;
};

/**
 * One heading → content. No “The rule” / figure kickers stacked under section titles.
 */
export function LearnSectionBlock({ section, techniqueSlug }: SectionBlockProps) {
  const kind = section.kind ?? "default";
  const photoFigure = Boolean(section.figure && hasLearnPhotoFigure(section.figure));
  // Prefer real photos over text step-cards when both exist for a figure id.
  const stepDeck = photoFigure ? null : resolveStepDeck(section, { techniqueSlug });
  const showFigure =
    Boolean(section.figure) && !stepDeck?.steps.length && (!deckUsesFigure(section) || photoFigure);
  const usesDeck = Boolean(stepDeck);
  const footerNotes =
    usesDeck &&
    section.body.length > 0 &&
    (deckUsesFigure(section) || (techniqueSlug && section.heading === "How to do it"))
      ? section.body
      : undefined;

  /** Prefer the deck’s concrete title over generic “How to do it”. */
  const heading =
    usesDeck && section.heading === "How to do it" && stepDeck?.title
      ? stepDeck.title
      : section.heading;

  if (kind === "mistakes") {
    return (
      <article className="learn-lesson-section-block">
        <h2 className={LEARN_HEADING}>{section.heading}</h2>
        {showFigure ? (
          <div className="my-6">
            <LearnFigure id={section.figure!} embedded />
          </div>
        ) : null}
        <ul className="space-y-3">
          {section.body.flatMap((para) =>
            para
              .split(/(?<=\.)\s+/)
              .filter(Boolean)
              .map((sentence) => (
                <li key={sentence.slice(0, 40)} className={`flex gap-3 ${LEARN_BODY}`}>
                  <span
                    className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-terracotta"
                    aria-hidden
                  />
                  <span>{sentence}</span>
                </li>
              ))
          )}
        </ul>
      </article>
    );
  }

  return (
    <article className="learn-lesson-section-block">
      <h2 className={LEARN_HEADING}>{heading}</h2>

      {stepDeck ? (
        <div className="my-5">
          <LearnStepDeck
            kicker={stepDeck.kicker}
            title={stepDeck.title}
            steps={stepDeck.steps}
            footerNotes={footerNotes}
            showHeader={false}
          />
        </div>
      ) : showFigure ? (
        <div className="my-6">
          <LearnFigure id={section.figure!} embedded />
        </div>
      ) : null}

      {!usesDeck ? (
        <div className="space-y-4">
          {section.body.map((para) => (
            <p key={para.slice(0, 48)} className={LEARN_BODY}>
              {para}
            </p>
          ))}
        </div>
      ) : null}
    </article>
  );
}
