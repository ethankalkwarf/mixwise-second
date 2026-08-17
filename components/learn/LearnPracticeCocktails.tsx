import Link from "next/link";
import Image from "next/image";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { getPracticeCocktails } from "@/lib/learnPractice.server";
import type { LearnPracticeDrink } from "@/lib/learnTypes";

type Props = {
  drinks: LearnPracticeDrink[];
  heading?: string;
  subcopy?: string;
};

export async function LearnPracticeCocktails({
  drinks,
  heading = "Practice these",
  subcopy = "Read the drill, then make the drink once focusing on that cue — repetition beats another paragraph.",
}: Props) {
  const cocktails = await getPracticeCocktails(drinks.map((d) => d.slug));
  if (cocktails.length === 0) return null;

  const noticeBySlug = new Map(drinks.map((d) => [d.slug, d.notice]));

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-3">
          In the glass
        </p>
        <h2 className="font-display text-2xl font-bold !text-charcoal tracking-tight">{heading}</h2>
        {subcopy && (
          <p className="text-[17px] !text-charcoal/70 leading-[1.7] mt-2 max-w-xl">{subcopy}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cocktails.map((cocktail) => {
          const imageUrl = cocktail.image_url || undefined;
          const notice = noticeBySlug.get(cocktail.slug);
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
                <p className="text-xs text-sage mt-1 leading-relaxed line-clamp-3">
                  {notice || cocktail.short_description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
