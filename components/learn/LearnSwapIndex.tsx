import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  SWAP_GROUPS,
  type SubstitutionTip,
} from "@/lib/cocktailSubstitutions";

type Props = {
  tips: SubstitutionTip[];
  showAllLink?: boolean;
  /** Hub index: denser text rows aligned with the lesson directory. */
  variant?: "cards" | "directory";
};

export function LearnSwapIndex({
  tips,
  showAllLink = false,
  variant = "cards",
}: Props) {
  const grouped = SWAP_GROUPS.map((group) => ({
    ...group,
    items: tips.filter((tip) => tip.group === group.id),
  })).filter((group) => group.items.length > 0);

  if (tips.length === 0) return null;

  const directory = variant === "directory";

  return (
    <div className={directory ? "space-y-6" : "space-y-8"}>
      {grouped.map((group) => (
        <div key={group.id}>
          <div className={directory ? "mb-2" : "mb-3"}>
            <h3
              className={`font-display font-bold text-forest ${
                directory ? "text-base" : "text-lg"
              }`}
            >
              {group.title}
            </h3>
            <p className="text-sm text-sage mt-0.5">{group.blurb}</p>
          </div>
          {directory ? (
            <ul className="border-t border-mist grid sm:grid-cols-2 sm:gap-x-10">
              {group.items.map((tip) => (
                <li
                  key={tip.id}
                  className="flex items-start gap-3 border-b border-mist/70 py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage font-semibold">
                      If you have
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold text-forest leading-snug">
                      {tip.have}
                    </p>
                    <p className="mt-0.5 text-xs text-sage leading-relaxed line-clamp-2">
                      Use {tip.use}
                      {tip.note ? ` — ${tip.note}` : ""}
                    </p>
                  </div>
                  <ChevronRightIcon
                    className="mt-1 h-4 w-4 shrink-0 text-sage/30"
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.items.map((tip) => (
                <li
                  key={tip.id}
                  className="rounded-2xl border border-mist bg-white px-4 py-4 sm:px-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                    If you have
                  </p>
                  <p className="font-display text-lg font-bold text-forest mt-1 leading-snug">
                    {tip.have}
                  </p>
                  <p className="text-sm text-forest mt-2 leading-relaxed">
                    <span className="text-sage">Use </span>
                    {tip.use}
                  </p>
                  {tip.note && (
                    <p className="text-xs text-sage mt-2 leading-relaxed">{tip.note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {showAllLink && (
        <Link href="/learn/swaps" className="inline-block text-sm font-medium text-terracotta hover:underline">
          Open the full swap guide →
        </Link>
      )}
    </div>
  );
}
