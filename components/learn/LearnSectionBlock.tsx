import type { LearnSection } from "@/lib/learnLibrary";

const KIND_STYLES: Record<
  NonNullable<LearnSection["kind"]>,
  { wrap: string; label: string | null }
> = {
  default: { wrap: "", label: null },
  rule: {
    wrap: "rounded-2xl border border-forest/15 bg-forest/[0.04] px-5 py-5 sm:px-6",
    label: "The rule",
  },
  mistakes: {
    wrap: "rounded-2xl border border-terracotta/20 bg-terracotta/[0.06] px-5 py-5 sm:px-6",
    label: "Watch for this",
  },
  tip: {
    wrap: "rounded-2xl border border-olive/30 bg-olive/10 px-5 py-5 sm:px-6",
    label: "Pro tip",
  },
};

export function LearnSectionBlock({ section }: { section: LearnSection }) {
  const kind = section.kind ?? "default";
  const style = KIND_STYLES[kind];

  return (
    <article className={style.wrap || undefined}>
      {style.label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-2">
          {style.label}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold text-charcoal mb-3">{section.heading}</h2>
      <div className="space-y-4">
        {section.body.map((para) => (
          <p key={para.slice(0, 48)} className="text-base text-charcoal/80 leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
