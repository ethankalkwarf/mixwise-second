import Image from "next/image";
import type { Cocktail } from "@/lib/cocktailTypes";
import { BeakerIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

interface CocktailHeroProps {
  cocktail: Cocktail;
  imageUrl: string | null;
}

export function CocktailHero({ cocktail, imageUrl }: CocktailHeroProps) {
  return (
    <>
      {/* IMAGE SIDE */}
      <div className="relative group">
        <div className="aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-2xl shadow-soft bg-gray-200 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={cocktail.imageAlt || `${cocktail.name} cocktail`}
              fill
              priority
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage text-6xl">
              🍸
            </div>
          )}

        </div>
      </div>

      {/* HERO CONTENT */}
      <div className="flex flex-col justify-center h-full space-y-6">
        {/* CATEGORY ROW */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
          {cocktail.baseSpirit && (
            <>
              <span className="uppercase tracking-wider text-xs">{cocktail.baseSpirit}</span>
              <span>&bull;</span>
            </>
          )}
          {cocktail.categories && cocktail.categories.length > 0 && (
            <span className="uppercase tracking-wider text-xs text-mixwise-accent">{cocktail.categories[0]}</span>
          )}
        </div>

        {/* TITLE + TAGS */}
        <div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            {cocktail.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {cocktail.tags && cocktail.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>

          {cocktail.description && (
            <p className="text-lg text-gray-600 leading-relaxed">{cocktail.description}</p>
          )}
        </div>

        {/* META GRID */}
        <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-gray-100">
          {cocktail.glass && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Square3Stack3DIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Glassware</p>
                <p className="font-medium text-gray-900 capitalize">{cocktail.glass.replace(/-/g, " ")}</p>
              </div>
            </div>
          )}

          {cocktail.method && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <BeakerIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Method</p>
                <p className="font-medium text-gray-900 capitalize">{cocktail.method}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

