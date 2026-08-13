import Link from "next/link";
import Image from "next/image";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { getPracticeCocktails } from "@/lib/learnPractice.server";

type Props = {
  slugs: string[];
  heading?: string;
  subcopy?: string;
};

export async function LearnPracticeCocktails({
  slugs,
  heading = "Practice these",
  subcopy = "Make one of these with the lesson still in mind — repetition beats another paragraph.",
}: Props) {
  const cocktails = await getPracticeCocktails(slugs);
  if (cocktails.length === 0) return null;

  return (
    <section className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta font-bold mb-1">
          In the glass
        </p>
        <h2 className="font-display text-2xl font-bold text-forest">{heading}</h2>
        {subcopy && <p className="text-sm text-sage mt-1 max-w-xl">{subcopy}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cocktails.map((cocktail) => {
          const imageUrl = cocktail.image_url || undefined;
          return (
            <Link
              key={cocktail.id}
              href={`/cocktails/${cocktail.slug}`}
              className="group flex gap-4 overflow-hidden rounded-2xl border border-mist bg-white p-3 transition-all hover:border-terracotta/30 hover:shadow-soft"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cocktail.image_alt || cocktail.name}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={85}
                    placeholder="blur"
                    blurDataURL={COCKTAIL_BLUR_DATA_URL}
                  />
                ) : (
                  <ComingSoonCocktailImage name={cocktail.name} size="card" />
                )}
                {isNewCocktail(cocktail.created_at) && (
                  <span className="absolute top-1.5 left-1.5 bg-terracotta text-cream text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center py-1">
                {cocktail.base_spirit && (
                  <p className="font-mono text-[10px] text-terracotta font-bold tracking-widest uppercase mb-0.5">
                    {cocktail.base_spirit}
                  </p>
                )}
                <h3 className="font-display font-bold text-lg text-forest leading-tight group-hover:text-terracotta transition-colors">
                  {formatCocktailName(cocktail.name)}
                </h3>
                {cocktail.short_description && (
                  <p className="text-xs text-sage line-clamp-2 mt-1">{cocktail.short_description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
