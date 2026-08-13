import type { LearnSection } from "@/lib/learnLibrary";

/**
 * Editorial lesson sections — no stacked AI callout cards.
 */
export function LearnSectionBlock({ section }: { section: LearnSection }) {
  const kind = section.kind ?? "default";

  if (kind === "rule") {
    return (
      <article className="border-l-2 border-terracotta pl-5 sm:pl-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta mb-2">
          The rule
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold !text-charcoal mb-3">
          {section.heading}
        </h2>
        <div className="space-y-4">
          {section.body.map((para) => (
            <p key={para.slice(0, 48)} className="text-base sm:text-lg !text-charcoal/90 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </article>
    );
  }

  if (kind === "mistakes") {
    return (
      <article>
        <h2 className="font-display text-2xl font-bold !text-charcoal mb-4">{section.heading}</h2>
        <ul className="space-y-3">
          {section.body.flatMap((para) =>
            para
              .split(/(?<=\.)\s+/)
              .filter(Boolean)
              .map((sentence) => (
                <li
                  key={sentence.slice(0, 40)}
                  className="flex gap-3 text-base !text-charcoal/90 leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden />
                  <span>{sentence}</span>
                </li>
              ))
          )}
        </ul>
      </article>
    );
  }

  if (kind === "tip") {
    return (
      <article className="py-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta mb-2">
          Tip
        </p>
        <h2 className="font-display text-xl font-bold !text-charcoal mb-2">{section.heading}</h2>
        <div className="space-y-3">
          {section.body.map((para) => (
            <p
              key={para.slice(0, 48)}
              className="font-display text-lg sm:text-xl !text-charcoal leading-snug"
            >
              {para}
            </p>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article>
      <h2 className="font-display text-2xl sm:text-3xl font-bold !text-charcoal mb-4">
        {section.heading}
      </h2>
      <div className="space-y-4">
        {section.body.map((para) => (
          <p key={para.slice(0, 48)} className="text-base sm:text-lg !text-charcoal/90 leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
