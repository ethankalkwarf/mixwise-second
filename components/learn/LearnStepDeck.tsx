"use client";

import type { LearnStepDeckSpec } from "@/lib/learnStepDecks";

type Props = LearnStepDeckSpec & {
  /** Extra prose shown under the list (e.g. section body when steps come from a figure). */
  footerNotes?: string[];
  /** Takeaways emphasize body copy; steps keep short titles. */
  variant?: "steps" | "takeaway";
  /** When false, omit kicker/title (section heading already carries the title). */
  showHeader?: boolean;
  className?: string;
};

/**
 * App-first takeaway / how-to list.
 * Vertical numbered rows — no swipe carousel, no nested cards.
 */
export function LearnStepDeck({
  kicker,
  title,
  steps,
  footerNotes,
  variant = "steps",
  showHeader = true,
  className,
}: Props) {
  const count = steps.length;
  if (count === 0) return null;

  const isTakeaway = variant === "takeaway";

  return (
    <figure
      className={`learn-step-list ${isTakeaway ? "learn-step-list--takeaway" : "learn-step-list--steps"} ${className ?? ""}`.trim()}
    >
      {showHeader ? (
        <header className="learn-step-list__header">
          {kicker ? <p className="learn-step-list__kicker">{kicker}</p> : null}
          <figcaption className="learn-step-list__title">{title}</figcaption>
        </header>
      ) : (
        <figcaption className="sr-only">{title}</figcaption>
      )}

      <ol className="learn-step-list__items">
        {steps.map((step, index) => (
          <li key={`${step.title}-${step.body.slice(0, 32)}`} className="learn-step-list__item">
            <span className="learn-step-list__index" aria-hidden>
              {index + 1}
            </span>
            <div className="learn-step-list__copy">
              {!isTakeaway && step.title ? (
                <p className="learn-step-list__step-title">{step.title}</p>
              ) : null}
              <p className="learn-step-list__body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {footerNotes && footerNotes.length > 0 ? (
        <div className="learn-step-list__notes">
          {footerNotes.map((note) => (
            <p key={note.slice(0, 48)}>{note}</p>
          ))}
        </div>
      ) : null}
    </figure>
  );
}
