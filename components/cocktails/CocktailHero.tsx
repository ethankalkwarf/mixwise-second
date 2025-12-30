import Image from "next/image";
import { getImageUrl } from "@/lib/sanityImage";
import type { SanityCocktail } from "@/lib/sanityTypes";
import { BeakerIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

interface CocktailHeroProps {
  cocktail: SanityCocktail;
  imageUrl: string | null;
}

export function CocktailHero({ cocktail, imageUrl }: CocktailHeroProps) {
  // Generate optimized image URL with proper transformations
  const optimizedImageUrl = cocktail.image ?
    getImageUrl(cocktail.image, {
      width: 800,
      height: 1000,
      quality: 90,
      auto: 'format'
    }) : imageUrl;

  return (
    <>
      {/* IMAGE SIDE */}
      <div className="relative group">
        <div className="aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-2xl shadow-soft bg-gray-200 relative">
          {optimizedImageUrl ? (
            <Image
              src={optimizedImageUrl}
              alt={cocktail.imageAltOverride || cocktail.image?.alt || `${cocktail.name} cocktail`}
              fill
              priority
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
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
          {cocktail.primarySpirit && (
            <>
              <span className="uppercase tracking-wider text-xs">{cocktail.primarySpirit}</span>
              <span>&bull;</span>
            </>
          )}
          {cocktail.drinkCategories && cocktail.drinkCategories.length > 0 && (
            <span className="uppercase tracking-wider text-xs text-mixwise-accent">{cocktail.drinkCategories[0]}</span>
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

