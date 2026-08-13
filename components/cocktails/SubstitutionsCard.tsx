import Link from "next/link";
import type { SubstitutionTip } from "@/lib/cocktailSubstitutions";

type Props = {
  tips: SubstitutionTip[];
};

export function SubstitutionsCard({ tips }: Props) {
  if (!tips.length) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">Smart swaps</h3>
      <p className="text-sm text-sage mb-4">
        Practical substitutions if you&apos;re missing a bottle — not perfect clones, but close enough to make the drink.
      </p>
      <ul className="space-y-3">
        {tips.map((tip) => (
          <li key={tip.id} className="text-sm">
            <p className="text-forest font-medium">
              {tip.have}{" "}
              <span className="text-sage font-normal">→</span> {tip.use}
            </p>
            {tip.note && <p className="text-sage text-xs mt-0.5 leading-relaxed">{tip.note}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-sage">
        More technique help in the{" "}
        <Link href="/learn" className="text-terracotta hover:underline font-medium">
          MixWise learn guide
        </Link>
        .
      </p>
    </div>
  );
}
