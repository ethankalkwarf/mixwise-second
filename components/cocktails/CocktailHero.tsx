import Image from "next/image";
import { CocktailActions } from "./CocktailActions";
import type { SanityCocktail } from "@/lib/sanityTypes";
import { BeakerIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

interface CocktailHeroProps {
  cocktail: SanityCocktail;
  imageUrl: string | null;
}

export function CocktailHero({ cocktail, imageUrl }: CocktailHeroProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left: Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg bg-mist">
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

      {/* Right: Context */}
      <div className="flex flex-col h-full justify-center space-y-6 py-2">
        {/* Breadcrumbs / Meta */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-terracotta uppercase">
          {cocktail.primarySpirit && <span>{cocktail.primarySpirit} COCKTAILS</span>}
          {cocktail.drinkCategories && cocktail.drinkCategories.length > 0 && (
            <>
              <span className="text-sage">•</span>
              <span>{cocktail.drinkCategories[0]}</span>
            </>
          )}
        </div>

        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-forest leading-tight">
            {cocktail.name}
          </h1>
          <div className="pt-2">
            <CocktailActions
              cocktail={{
                id: cocktail._id,
                name: cocktail.name,
                slug: cocktail.slug.current,
                imageUrl: imageUrl || undefined,
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {cocktail.tags && cocktail.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cocktail.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-mist text-forest text-xs font-medium rounded-full uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {cocktail.description && (
          <p className="text-lg text-sage leading-relaxed max-w-xl">
            {cocktail.description}
          </p>
        )}

        {/* Quick Specs Row */}
        <div className="pt-6 mt-auto border-t border-mist flex flex-wrap gap-8">
          {cocktail.glass && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center text-olive">
                <Square3Stack3DIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-sage uppercase tracking-wider">Glassware</p>
                <p className="text-forest font-medium capitalize">{cocktail.glass.replace(/-/g, " ")}</p>
              </div>
            </div>
          )}
          
          {cocktail.method && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
                <BeakerIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-sage uppercase tracking-wider">Method</p>
                <p className="text-forest font-medium capitalize">{cocktail.method}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

