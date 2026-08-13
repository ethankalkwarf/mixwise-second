import Link from "next/link";
import Image from "next/image";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import type { OccasionCocktail } from "@/lib/occasions";

type Props = {
  cocktails: OccasionCocktail[];
};

export function OccasionCocktailGrid({ cocktails }: Props) {
  if (cocktails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-mist rounded-3xl bg-white">
        <h2 className="text-xl font-display font-bold text-forest mb-3">No drinks in this occasion yet</h2>
        <p className="text-sage max-w-md text-sm mb-6">
          Browse the full library while we keep tagging seasonal and hosting collections.
        </p>
        <Link
          href="/cocktails"
          className="px-6 py-3 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-xl text-sm font-medium hover:bg-terracotta hover:text-cream transition-colors"
        >
          All recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cocktails.map((cocktail, index) => {
        const imageUrl = cocktail.image_url || undefined;
        return (
          <Link
            key={cocktail.id}
            href={`/cocktails/${cocktail.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
            style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
          >
            <div className="relative h-56 w-full overflow-hidden bg-mist">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={cocktail.image_alt || cocktail.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    quality={90}
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                </>
              ) : (
                <ComingSoonCocktailImage name={cocktail.name} size="card" />
              )}
              {isNewCocktail(cocktail.created_at) && (
                <span className="absolute top-3 left-3 z-10 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  NEW
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-10 -mt-12">
              <div className="backdrop-blur-md rounded-2xl p-4 border border-mist/50 shadow-soft flex-1 flex flex-col bg-white/90">
                {cocktail.base_spirit && (
                  <p className="font-mono text-[10px] text-terracotta font-bold tracking-widest uppercase mb-1">
                    {cocktail.base_spirit}
                  </p>
                )}
                <h3 className="font-display font-bold text-xl leading-tight text-forest mb-2">
                  {formatCocktailName(cocktail.name)}
                </h3>
                {cocktail.short_description && (
                  <p className="text-xs text-sage line-clamp-2 mb-3">{cocktail.short_description}</p>
                )}
                {cocktail.category_primary && (
                  <p className="mt-auto text-xs text-sage capitalize">{cocktail.category_primary}</p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
