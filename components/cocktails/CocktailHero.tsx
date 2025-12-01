import Image from "next/image";
import { CocktailActions } from "./CocktailActions";
import { RatingStars } from "./RatingStars";
import type { SanityCocktail } from "@/lib/sanityTypes";

interface CocktailHeroProps {
  cocktail: SanityCocktail;
  imageUrl: string | null;
}

export function CocktailHero({ cocktail, imageUrl }: CocktailHeroProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left Column: Text Content */}
      <div className="space-y-6">
        {/* Cocktail Name */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-forest leading-tight">
          {cocktail.name}
        </h1>

        {/* Short Description */}
        {cocktail.description && (
          <p className="text-lg text-sage leading-relaxed">
            {cocktail.description}
          </p>
        )}

        {/* Rating Stars */}
        <div className="flex items-center gap-4">
          <RatingStars cocktailId={cocktail._id} size="md" showCount={false} />
          <span className="text-sm text-sage">Rate this cocktail</span>
        </div>

        {/* Save/Favorite Button */}
        <CocktailActions
          cocktail={{
            id: cocktail._id,
            name: cocktail.name,
            slug: cocktail.slug.current,
            imageUrl: imageUrl || undefined,
          }}
        />
      </div>

      {/* Right Column: Image */}
      <div className="relative order-first md:order-last">
        <div className="aspect-square md:aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-card bg-mist">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={cocktail.imageAltOverride || cocktail.image?.alt || `${cocktail.name} cocktail`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage text-6xl">
              🍸
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {cocktail.isTrending && (
              <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                🔥 Trending
              </span>
            )}
            {cocktail.isPopular && !cocktail.isTrending && (
              <span className="bg-forest text-cream text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                ★ Featured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

