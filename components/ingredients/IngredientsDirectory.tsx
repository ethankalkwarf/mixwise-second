"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import type { DirectoryIngredient } from "@/lib/ingredientTypes";

interface IngredientsDirectoryProps {
  ingredients: DirectoryIngredient[];
}

const INGREDIENT_TYPES = [
  { value: "spirit", label: "Spirits" },
  { value: "liqueur", label: "Liqueurs" },
  { value: "mixer", label: "Mixers" },
  { value: "syrup", label: "Syrups" },
  { value: "juice", label: "Juices" },
  { value: "citrus", label: "Citrus" },
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.type?.toLowerCase().includes(query)
      );
    }

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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full bg-white border border-mist rounded-lg pl-10 pr-4 py-3 text-charcoal placeholder:text-sage/70 focus:outline-none focus:border-forest/40"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
            hasActiveFilters
              ? "bg-forest/10 border-forest/30 text-forest"
              : "bg-white border-mist text-charcoal hover:border-stone"
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-mist rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-forest">Filter by type</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-sage hover:text-forest">
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
                      ? "bg-forest text-cream"
                      : "bg-mist text-charcoal hover:bg-stone"
                  }`}
                >
                  {type.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-sage">
          {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {filteredIngredients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              isInBar={ingredientIds.includes(ingredient.id)}
              onAddToBar={() => addIngredient(ingredient.id, ingredient.name)}
              onRemoveFromBar={() => removeIngredient(ingredient.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-mist rounded-xl">
          <p className="text-sage">No ingredients found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-terracotta hover:text-terracotta-dark text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function IngredientCard({
  ingredient,
  isInBar,
  onAddToBar,
  onRemoveFromBar,
}: {
  ingredient: DirectoryIngredient;
  isInBar: boolean;
  onAddToBar: () => void;
  onRemoveFromBar: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-mist bg-white transition-all duration-300 hover:border-stone">
      <Link href={`/ingredients/${ingredient.slug}`} className="block">
        <div className="relative h-32 w-full overflow-hidden bg-mist">
          {ingredient.imageUrl ? (
            <Image
              src={ingredient.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={75}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sage/40 text-sm font-medium">
              {ingredient.name}
            </div>
          )}
          {ingredient.type && (
            <span className="absolute top-2 left-2 bg-cream/90 text-forest text-xs font-medium px-2 py-1 rounded capitalize">
              {ingredient.type}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-forest group-hover:text-terracotta transition-colors line-clamp-1">
            {ingredient.name}
          </h3>
          <p className="text-xs text-sage mt-1">
            {ingredient.cocktailCount} cocktail{ingredient.cocktailCount !== 1 ? "s" : ""}
          </p>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          isInBar ? onRemoveFromBar() : onAddToBar();
        }}
        className={`absolute bottom-4 right-4 p-2 rounded-lg transition-colors ${
          isInBar
            ? "bg-forest text-cream hover:bg-forest/90"
            : "bg-mist text-charcoal hover:bg-stone"
        }`}
        aria-label={isInBar ? "Remove from bar" : "Add to bar"}
      >
        <PlusCircleIcon className={`w-5 h-5 ${isInBar ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
