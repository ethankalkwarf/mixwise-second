import Image from "next/image";
import Link from "next/link";
import type { OccasionCocktail, OccasionDisplay } from "@/lib/occasions";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";

type Props = {
  occasion: OccasionDisplay;
  count: number;
  cover?: OccasionCocktail | null;
  compact?: boolean;
};

export function OccasionCard({ occasion, count, cover, compact }: Props) {
  const imageUrl = occasion.staticCoverPath || cover?.image_url || null;

  return (
    <Link
      href={`/occasions/${occasion.slug}`}
      className={[
        "group relative block overflow-hidden rounded-3xl bg-charcoal",
        compact ? "min-h-[220px]" : "min-h-[260px]",
      ].join(" ")}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={cover?.image_alt || cover?.name || occasion.name}
          fill
          className={["object-cover", occasion.coverFocusClass || ""].join(" ")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          placeholder="blur"
          blurDataURL={COCKTAIL_BLUR_DATA_URL}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${occasion.accentClass}`} />
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-charcoal via-charcoal/92 to-transparent px-4 pb-4 pt-16">
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-cream [text-wrap:balance]">
          {occasion.name}
        </h2>
        {occasion.headline ? (
          <p className="mt-1 text-sm leading-snug text-cream/90 line-clamp-2">{occasion.headline}</p>
        ) : null}
        <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-cream/80">
          {count} drink{count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
