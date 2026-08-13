import type { LearnSection } from "@/lib/learnLibrary";

/** Shared Learn lesson type scale — keep every section on the same steps. */
const LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-3";
const HEADING = "font-display text-2xl font-bold !text-charcoal mb-4 tracking-tight";
const BODY = "text-[17px] !text-charcoal/85 leading-[1.7]";

/**
 * Editorial lesson sections with one consistent type hierarchy.
 */
export function LearnSectionBlock({ section }: { section: LearnSection }) {
  const kind = section.kind ?? "default";
  const label =
    kind === "rule" ? "The rule" : kind === "tip" ? "Tip" : null;

  if (kind === "mistakes") {
    return (
      <article>
        <h2 className={HEADING}>{section.heading}</h2>
        <ul className="space-y-3">
          {section.body.flatMap((para) =>
            para
              .split(/(?<=\.)\s+/)
              .filter(Boolean)
              .map((sentence) => (
                <li key={sentence.slice(0, 40)} className={`flex gap-3 ${BODY}`}>
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
    <article className={kind === "rule" ? "border-l border-terracotta/50 pl-5 sm:pl-6" : undefined}>
      {label && <p className={LABEL}>{label}</p>}
      <h2 className={HEADING}>{section.heading}</h2>
      <div className="space-y-4">
        {section.body.map((para) => (
          <p key={para.slice(0, 48)} className={BODY}>
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
