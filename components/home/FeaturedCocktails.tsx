"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/sanityImage";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface FeaturedCocktailsProps {
  cocktails: SanityCocktail[];
}

export function FeaturedCocktails({ cocktails }: FeaturedCocktailsProps) {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal mb-4">
            Featured Recipes
          </h2>
          <p className="text-lg text-sage max-w-2xl mx-auto">
            Handcrafted cocktails from our collection, perfect for any occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cocktails.map((cocktail, index) => (
            <FeaturedCocktailCard
              key={cocktail._id}
              cocktail={cocktail}
              isOffset={index % 2 === 1}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/cocktails"
            className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium bg-forest text-cream hover:bg-charcoal transition-all duration-300"
          >
            View All Recipes
          </Link>
        </div>
      </div>
    </section>
  );
}

interface FeaturedCocktailCardProps {
  cocktail: SanityCocktail & { ingredientCount?: number };
  isOffset: boolean;
}

function FeaturedCocktailCard({ cocktail, isOffset }: FeaturedCocktailCardProps) {
  const imageUrl = getImageUrl(cocktail.image, { width: 400, height: 300 }) || cocktail.externalImageUrl;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className={`group relative flex flex-col bg-white rounded-3xl border border-mist p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
        isOffset ? 'md:mt-12' : ''
      }`}
    >
      {/* Image */}
      <div className="bg-[#F4F5F0] rounded-2xl overflow-hidden mb-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cocktail.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-sage text-4xl">
            🍸
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg text-charcoal mb-2 group-hover:text-terracotta transition-colors">
          {cocktail.name}
        </h3>

        {cocktail.primarySpirit && (
          <p className="text-xs font-bold uppercase tracking-widest text-forest/70 mb-3">
            {cocktail.primarySpirit}
          </p>
        )}

        {cocktail.ingredientCount !== undefined && (
          <p className="text-sm text-sage">
            {cocktail.ingredientCount} ingredient{cocktail.ingredientCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Featured Badge */}
      {cocktail.isPopular && (
        <div className="absolute top-4 right-4 bg-terracotta text-cream text-xs font-bold px-3 py-1 rounded-full">
          ★ Featured
        </div>
      )}
    </Link>
  );
}


