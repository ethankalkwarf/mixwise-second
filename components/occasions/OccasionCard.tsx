import Image from "next/image";
import Link from "next/link";
import { staticOccasionCoverIfPresent } from "@/lib/occasionCovers";
import type { OccasionCocktail, OccasionDefinition } from "@/lib/occasions";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

type Props = {
  occasion: OccasionDefinition;
  count: number;
  cover?: OccasionCocktail | null;
  compact?: boolean;
};

export function OccasionCard({ occasion, count, cover, compact }: Props) {
  const imageUrl =
    staticOccasionCoverIfPresent(occasion.slug) ||
    (occasion.parentSlug ? staticOccasionCoverIfPresent(occasion.parentSlug) : null) ||
    cover?.image_url ||
    null;

  return (
    <Link
      href={`/occasions/${occasion.slug}`}
      className={[
        "group relative overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        compact ? "min-h-[200px]" : "min-h-[280px]",
      ].join(" ")}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={cover?.image_alt || cover?.name || occasion.name}
          fill
          className={[
            "object-cover transition-transform duration-700 group-hover:scale-105",
            occasion.coverFocusClass || "",
          ].join(" ")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          placeholder="blur"
          blurDataURL={COCKTAIL_BLUR_DATA_URL}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/75 to-charcoal/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/90 to-transparent" />
      <div
        className={[
          "relative z-10 flex h-full flex-col justify-end",
          compact ? "min-h-[200px] p-4" : "min-h-[280px] p-5",
        ].join(" ")}
      >
        <h2
          className={[
            "font-display font-semibold tracking-tight leading-tight text-cream mb-1.5 transition-colors group-hover:text-olive",
            compact ? "text-xl" : "text-2xl",
          ].join(" ")}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}
        >
          {occasion.name}
        </h2>
        <p
          className="text-sm font-medium text-cream mb-2 leading-snug"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          {occasion.headline}
        </p>
        <p
          className="text-xs font-semibold uppercase tracking-wide text-cream"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
        >
          {count} drink{count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
