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
        <div className="mb-10 max-w-xl text-center sm:mx-auto lg:mb-12">
          <h2 className="mb-3 [text-wrap:balance] font-display text-3xl font-bold text-forest sm:text-4xl">
            Featured recipes
          </h2>
          <p className="[text-wrap:pretty] text-base leading-relaxed text-sage sm:text-lg">
            A few drinks from the collection — worth making any night of
            the&nbsp;week.
          </p>
        </div>

        {/* Phone: swipeable row so five cards never leave one hanging */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 scrollbar-thin sm:hidden">
          {cocktails.map((cocktail) => (
            <FeaturedCocktailCard
              key={cocktail._id}
              cocktail={cocktail}
              className="w-[min(68vw,11.5rem)] flex-shrink-0 snap-start"
              imageSizes="68vw"
            />
          ))}
        </div>

        {/* Tablet: flex wrap centers a short last row; desktop: five-column grid */}
        <div className="hidden sm:flex sm:flex-wrap sm:justify-center sm:gap-5 lg:grid lg:grid-cols-5 lg:gap-6">
          {cocktails.map((cocktail) => (
            <FeaturedCocktailCard
              key={`desktop-${cocktail._id}`}
              cocktail={cocktail}
              className="w-[calc(33.333%-0.85rem)] lg:w-auto"
              imageSizes="(max-width: 1280px) 20vw, 15vw"
            />
          ))}
        </div>

        <div className="mt-10 text-center lg:mt-12">
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
  className?: string;
  imageSizes: string;
}

function FeaturedCocktailCard({
  cocktail,
  className = "",
  imageSizes,
}: FeaturedCocktailCardProps) {
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
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-mist bg-white transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${className}`}
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
            sizes={imageSizes}
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

      <div className="p-3 sm:p-3.5">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-forest transition-colors group-hover:text-terracotta sm:text-base">
          {cocktail.name}
        </h3>

        {cocktail.primarySpirit ? (
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-sage sm:text-xs">
            {cocktail.primarySpirit}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
