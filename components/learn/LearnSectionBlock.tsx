import type { LearnSection } from "@/lib/learnLibrary";
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

const KIND_STYLES: Record<
  NonNullable<LearnSection["kind"]>,
  {
    wrap: string;
    label: string | null;
    Icon: typeof LightBulbIcon | null;
  }
> = {
  default: { wrap: "", label: null, Icon: null },
  rule: {
    wrap: "rounded-2xl border border-forest/15 bg-forest/[0.04] px-5 py-5 sm:px-6",
    label: "The rule",
    Icon: CheckBadgeIcon,
  },
  mistakes: {
    wrap: "rounded-2xl border border-terracotta/20 bg-terracotta/[0.06] px-5 py-5 sm:px-6",
    label: "Watch for this",
    Icon: ExclamationTriangleIcon,
  },
  tip: {
    wrap: "rounded-2xl border border-olive/30 bg-olive/10 px-5 py-5 sm:px-6",
    label: "Pro tip",
    Icon: LightBulbIcon,
  },
};

export function LearnSectionBlock({ section }: { section: LearnSection }) {
  const kind = section.kind ?? "default";
  const style = KIND_STYLES[kind];
  const Icon = style.Icon;

  return (
    <article className={style.wrap || undefined}>
      {style.label && Icon && (
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta font-bold mb-2">
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {style.label}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold !text-charcoal mb-3">{section.heading}</h2>
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
