"use client";

import Link from "next/link";
import Image from "next/image";
import type { Cocktail } from "@/lib/cocktailTypes";

interface FeaturedCocktailsProps {
  cocktails: Cocktail[];
}

export function FeaturedCocktails({ cocktails }: FeaturedCocktailsProps) {
  return (
    <section className="bg-cream py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-3">
            Featured Recipes
          </h2>
          <p className="text-base text-sage max-w-xl mx-auto">
            Handcrafted cocktails from our collection, perfect for any occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {cocktails.map((cocktail, index) => (
            <FeaturedCocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              isOffset={index % 2 === 1}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/cocktails"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium bg-forest text-cream hover:bg-charcoal transition-all duration-300"
          >
            View All Recipes
          </Link>
        </div>
      </div>
    </section>
  );
}

interface FeaturedCocktailCardProps {
  cocktail: Cocktail;
  isOffset: boolean;
}

function FeaturedCocktailCard({ cocktail, isOffset }: FeaturedCocktailCardProps) {
  const imageUrl = cocktail.imageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className={`group relative flex flex-col bg-white rounded-2xl border border-mist overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
        isOffset ? 'lg:mt-8' : ''
      }`}
    >
      {/* Image */}
      <div className="bg-mist aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cocktail.name}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage text-3xl">
            🍸
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1">
        <h3 className="font-display font-bold text-sm sm:text-base text-forest group-hover:text-terracotta transition-colors line-clamp-2">
          {cocktail.name}
        </h3>

        {cocktail.baseSpirit && (
          <p className="text-xs font-medium uppercase tracking-wide text-sage mt-1">
            {cocktail.baseSpirit}
          </p>
        )}
      </div>

      {/* Featured Badge */}
      {cocktail.isPopular && (
        <div className="absolute top-2 right-2 bg-terracotta text-cream text-xs font-bold px-2 py-0.5 rounded-full">
          ★
        </div>
      )}
    </Link>
  );
}
