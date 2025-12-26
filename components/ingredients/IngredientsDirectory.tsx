"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "@/lib/sanityImage";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import type { SanityImage } from "@/lib/sanityTypes";

interface Ingredient {
  _id: string;
  name: string;
  slug: { current: string };
  type?: string;
  image?: SanityImage;
  externalImageUrl?: string;
  description?: string;
  cocktailCount: number;
}

interface IngredientsDirectoryProps {
  ingredients: Ingredient[];
}

const INGREDIENT_TYPES = [
  { value: "spirit", label: "Spirits" },
  { value: "liqueur", label: "Liqueurs" },
  { value: "mixer", label: "Mixers" },
  { value: "syrup", label: "Syrups" },
  { value: "juice", label: "Juices" },
  { value: "bitters", label: "Bitters" },
  { value: "garnish", label: "Garnishes" },
  { value: "wine", label: "Wine & Vermouth" },
];

export function IngredientsDirectory({ ingredients }: IngredientsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { ingredientIds, addIngredient, removeIngredient } = useBarIngredients();

  const filteredIngredients = useMemo(() => {
    let results = [...ingredients];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.type?.toLowerCase().includes(query) ||
          i.description?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType) {
      results = results.filter((i) => i.type === filterType);
    }

    return results;
  }, [ingredients, searchQuery, filterType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ingredients.forEach((i) => {
      const type = i.type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [ingredients]);

  const hasActiveFilters = !!filterType;

  const clearFilters = () => {
    setFilterType(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-lime-500/50"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
            hasActiveFilters
              ? "bg-lime-500/10 border-lime-500/30 text-lime-400"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-lime-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-200">Filter by type</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {INGREDIENT_TYPES.map((type) => {
              const count = typeCounts[type.value] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(filterType === type.value ? null : type.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterType === type.value
                      ? "bg-lime-500 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {type.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Ingredients Grid */}
      {filteredIngredients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient._id}
              ingredient={ingredient}
              isInBar={ingredientIds.includes(ingredient._id)}
              onAddToBar={() => addIngredient(ingredient._id, ingredient.name)}
              onRemoveFromBar={() => removeIngredient(ingredient._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/30 border border-slate-700 rounded-xl">
          <p className="text-slate-400">No ingredients found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-lime-400 hover:text-lime-300 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

interface IngredientCardProps {
  ingredient: Ingredient;
  isInBar: boolean;
  onAddToBar: () => void;
  onRemoveFromBar: () => void;
}

function IngredientCard({ ingredient, isInBar, onAddToBar, onRemoveFromBar }: IngredientCardProps) {
  const imageUrl = getImageUrl(ingredient.image, { width: 200, height: 200 }) || ingredient.externalImageUrl;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-slate-700">
      <Link href={`/ingredients/${ingredient.slug.current}`} className="block">
        <div className="relative h-32 w-full overflow-hidden bg-slate-800">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-700 text-4xl" aria-hidden="true">
              🧪
            </div>
          )}
          {ingredient.type && (
            <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium px-2 py-1 rounded capitalize">
              {ingredient.type}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-slate-100 group-hover:text-lime-400 transition-colors line-clamp-1">
            {ingredient.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {ingredient.cocktailCount} cocktail{ingredient.cocktailCount !== 1 ? "s" : ""}
          </p>
        </div>
      </Link>
      
      {/* Add to bar button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          isInBar ? onRemoveFromBar() : onAddToBar();
        }}
        className={`absolute bottom-4 right-4 p-2 rounded-lg transition-colors ${
          isInBar
            ? "bg-lime-500 text-slate-900 hover:bg-lime-400"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
        }`}
        aria-label={isInBar ? "Remove from bar" : "Add to bar"}
      >
        <PlusCircleIcon className={`w-5 h-5 ${isInBar ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}

