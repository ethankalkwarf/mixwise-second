import Link from "next/link";
import clsx from "clsx";

type MixWiseToolCalloutProps = {
  mixHref: string;
  cocktailName?: string;
  ingredientName?: string;
  ingredientNames?: string[];
  className?: string;
};

function formatList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function MixWiseToolCallout({
  mixHref,
  cocktailName,
  ingredientName,
  ingredientNames = [],
  className,
}: MixWiseToolCalloutProps) {
  const bottles = formatList(ingredientNames.length > 0 ? ingredientNames : ingredientName ? [ingredientName] : []);

  const body = cocktailName
    ? bottles
      ? `Have ${bottles}? MixWise is a free cocktail tool that matches drinks to the bottles already in your cabinet. Add them and it shows every recipe you can pour tonight — including the ${cocktailName} — plus drinks one bottle away.`
      : `MixWise is a free cocktail tool that matches drinks to the bottles already in your cabinet. Add what you have and see every recipe you can pour tonight — including the ${cocktailName} — plus drinks one bottle away.`
    : ingredientName
      ? `Do not guess from a list of ${ingredientName} cocktails. MixWise is a free tool that shows which drinks you can make once ${ingredientName} is in your bar, using the other bottles you already own.`
      : `MixWise is a free cocktail tool that matches drinks to the bottles already in your cabinet. Add what you have to see what you can pour tonight.`;

  return (
    <aside className={clsx("rounded-2xl border border-mist bg-white p-6 sm:p-8", className ?? "mt-12")}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-terracotta mb-2">
        Make it with what you have
      </p>
      <p className="text-sage leading-relaxed [text-wrap:pretty]">{body}</p>
      <Link
        href={mixHref}
        className="mt-4 inline-flex text-sm font-semibold text-terracotta hover:text-forest transition-colors"
      >
        Open MixWise
        <span className="ml-1.5" aria-hidden>
          →
        </span>
      </Link>
    </aside>
  );
}
