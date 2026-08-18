"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl, COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import type { SanityCocktail } from "@/lib/sanityTypes";
import { isNewCocktail } from "@/lib/formatters";

interface FeaturedCocktailsProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktails({ cocktails }: FeaturedCocktailsProps) {
  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-xl text-center sm:mx-auto lg:mb-14">
          <h2 className="mb-3 [text-wrap:balance] font-display text-3xl font-bold text-forest sm:text-4xl">
            Featured recipes
          </h2>
          <p className="[text-wrap:pretty] text-base leading-relaxed text-sage sm:text-lg">
            A few drinks from the collection — worth making any night of
            the&nbsp;week.
          </p>
        </div>

        {/* Mobile/tablet: horizontal scroll avoids a lone card on the last row */}
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-thin lg:hidden">
          {cocktails.map((cocktail) => (
            <FeaturedCocktailCard
              key={cocktail._id}
              cocktail={cocktail}
              layout="scroll"
            />
          ))}
        </div>

        {/* Desktop: even 5-column grid */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-5">
          {cocktails.map((cocktail) => (
            <FeaturedCocktailCard
              key={`desktop-${cocktail._id}`}
              cocktail={cocktail}
              layout="grid"
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/cocktails"
            className="inline-flex items-center justify-center rounded-full bg-forest px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-charcoal"
          >
            View all recipes
          </Link>
        </div>
      </div>
    </section>
  );
}

interface FeaturedCocktailCardProps {
  cocktail: SanityCocktail & { ingredientCount?: number };
  layout: "scroll" | "grid";
}

function FeaturedCocktailCard({ cocktail, layout }: FeaturedCocktailCardProps) {
  const imageUrl =
    getImageUrl(cocktail.image, {
      width: 800,
      height: 600,
      quality: 90,
      auto: "format",
    }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-mist bg-white transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
        layout === "scroll"
          ? "w-44 flex-shrink-0 sm:w-52"
          : "h-full"
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cocktail.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            placeholder="blur"
            blurDataURL={COCKTAIL_BLUR_DATA_URL}
            quality={90}
            sizes={
              layout === "scroll"
                ? "(max-width: 1024px) 208px, 20vw"
                : "(max-width: 1280px) 20vw, 15vw"
            }
          />
        ) : (
          <div className="h-full w-full bg-mist" />
        )}
        {isNewCocktail(cocktail.createdAt) && (
          <span className="absolute top-2 left-2 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            NEW
          </span>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-bold leading-snug text-forest transition-colors group-hover:text-terracotta sm:min-h-[2.75rem] sm:text-base">
          {cocktail.name}
        </h3>

        {cocktail.primarySpirit ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-sage">
            {cocktail.primarySpirit}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
