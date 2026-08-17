import Link from "next/link";
import {
  SWAP_GROUPS,
  type SubstitutionTip,
} from "@/lib/cocktailSubstitutions";

type Props = {
  tips: SubstitutionTip[];
  showAllLink?: boolean;
};

export function LearnSwapIndex({ tips, showAllLink = false }: Props) {
  const grouped = SWAP_GROUPS.map((group) => ({
    ...group,
    items: tips.filter((tip) => tip.group === group.id),
  })).filter((group) => group.items.length > 0);

  if (tips.length === 0) return null;

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.id}>
          <div className="mb-3">
            <h3 className="font-display text-lg font-bold text-forest">{group.title}</h3>
            <p className="text-sm text-sage mt-0.5">{group.blurb}</p>
          </div>
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
