"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, StarIcon, HeartIcon, FireIcon } from "@heroicons/react/20/solid";
import type { SanityCocktail } from "@/lib/sanityTypes";
import { getImageUrl } from "@/lib/sanityImage";

type SortOption = "name-asc" | "name-desc" | "popular" | "difficulty";

type Props = {
  cocktails: SanityCocktail[];
};

// Category display configuration
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  tiki: { label: "Tiki", emoji: "🏝️", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  classic: { label: "Classic", emoji: "🎩", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  holiday: { label: "Holiday", emoji: "🎄", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  modern: { label: "Modern", emoji: "✨", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  mocktail: { label: "Mocktail", emoji: "🍹", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  party: { label: "Party", emoji: "🎉", color: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
  summer: { label: "Summer", emoji: "☀️", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  winter: { label: "Winter", emoji: "❄️", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  fall: { label: "Fall", emoji: "🍂", color: "bg-orange-600/20 text-orange-300 border-orange-600/30" },
  spring: { label: "Spring", emoji: "🌸", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  strong: { label: "Strong", emoji: "🔥", color: "bg-red-600/20 text-red-300 border-red-600/30" },
  refreshing: { label: "Refreshing", emoji: "🌿", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  sour: { label: "Sour", emoji: "🍋", color: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
  sweet: { label: "Sweet", emoji: "🍯", color: "bg-amber-400/20 text-amber-200 border-amber-400/30" },
  boozy: { label: "Boozy", emoji: "🥃", color: "bg-stone-500/20 text-stone-300 border-stone-500/30" },
  "low-calorie": { label: "Low-Cal", emoji: "🥗", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  quick: { label: "Quick", emoji: "⚡", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
};

// Keywords that map to special filters
const KEYWORD_MAPPINGS: Record<string, (c: SanityCocktail) => boolean> = {
  popular: (c) => c.isPopular === true,
  featured: (c) => c.isPopular === true,
  favorite: (c) => c.isFavorite === true,
  favourites: (c) => c.isFavorite === true,
  trending: (c) => c.isTrending === true,
  hot: (c) => c.isTrending === true,
  easy: (c) => c.difficulty === "easy",
  moderate: (c) => c.difficulty === "moderate",
  advanced: (c) => c.difficulty === "advanced",
  hard: (c) => c.difficulty === "advanced",
};

export function CocktailsDirectory({ cocktails }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [filterSpirit, setFilterSpirit] = useState<string | null>(null);
  const [filterGlass, setFilterGlass] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const spirits = new Set<string>();
    const glasses = new Set<string>();
    const difficulties = new Set<string>();
    const categories = new Set<string>();

    cocktails.forEach((c) => {
      if (c.primarySpirit) spirits.add(c.primarySpirit);
      if (c.glass) glasses.add(c.glass);
      if (c.difficulty) difficulties.add(c.difficulty);
      c.drinkCategories?.forEach((cat) => categories.add(cat));
    });

    return {
      spirits: Array.from(spirits).sort(),
      glasses: Array.from(glasses).sort(),
      difficulties: Array.from(difficulties).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [cocktails]);

  // Filter and sort cocktails
  const filteredCocktails = useMemo(() => {
    let results = [...cocktails];

    // Search filter with keyword support
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/);
      
      results = results.filter((c) => {
        // Check for keyword matches first
        for (const word of words) {
          const keywordFilter = KEYWORD_MAPPINGS[word];
          if (keywordFilter && keywordFilter(c)) {
            return true;
          }
        }

        // Match name
        if (c.name.toLowerCase().includes(q)) return true;
        // Match description
        if (c.description?.toLowerCase().includes(q)) return true;
        // Match ingredient names
        if (c.ingredients?.some((ing) => ing.ingredient?.name?.toLowerCase().includes(q))) return true;
        // Match primary spirit
        if (c.primarySpirit?.toLowerCase().includes(q)) return true;
        // Match tags
        if (c.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
        // Match drink categories
        if (c.drinkCategories?.some((cat) => cat.toLowerCase().includes(q))) return true;
        // Match category labels
        if (c.drinkCategories?.some((cat) => {
          const config = CATEGORY_CONFIG[cat];
          return config?.label.toLowerCase().includes(q);
        })) return true;
        
        return false;
      });
    }

    // Spirit filter
    if (filterSpirit) {
      results = results.filter((c) => c.primarySpirit === filterSpirit);
    }

    // Glass filter
    if (filterGlass) {
      results = results.filter((c) => c.glass === filterGlass);
    }

    // Difficulty filter
    if (filterDifficulty) {
      results = results.filter((c) => c.difficulty === filterDifficulty);
    }

    // Category filter
    if (filterCategory) {
      results = results.filter((c) => c.drinkCategories?.includes(filterCategory));
    }

    // Sort
    switch (sortBy) {
      case "name-asc":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popular":
        results.sort((a, b) => {
          // Trending first, then popular, then favorites
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case "difficulty":
        const diffOrder = { easy: 1, moderate: 2, advanced: 3 };
        results.sort((a, b) => {
          const aDiff = diffOrder[a.difficulty as keyof typeof diffOrder] || 99;
          const bDiff = diffOrder[b.difficulty as keyof typeof diffOrder] || 99;
          if (aDiff !== bDiff) return aDiff - bDiff;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return results;
  }, [cocktails, searchQuery, sortBy, filterSpirit, filterGlass, filterDifficulty, filterCategory]);

  const activeFilterCount = [filterSpirit, filterGlass, filterDifficulty, filterCategory].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSpirit(null);
    setFilterGlass(null);
    setFilterDifficulty(null);
    setFilterCategory(null);
  };

  // Quick filter chips for common searches
  const quickFilters = [
    { label: "Popular", query: "popular", icon: StarIcon },
    { label: "Favorites", query: "favorite", icon: HeartIcon },
    { label: "Trending", query: "trending", icon: FireIcon },
  ];

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search: cocktails, ingredients, 'popular', 'tiki', 'holiday'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-lime-500/50 cursor-pointer"
          >
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
            <option value="popular">Popular First</option>
            <option value="difficulty">Easiest First</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-lime-500/10 border-lime-500/50 text-lime-400"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-lime-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = searchQuery.toLowerCase() === filter.query;
            return (
              <button
                key={filter.query}
                onClick={() => setSearchQuery(isActive ? "" : filter.query)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "bg-lime-500/20 border-lime-500/50 text-lime-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
          
          {/* Category chips */}
          {filterOptions.categories.slice(0, 6).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            if (!config) return null;
            const isActive = filterCategory === cat || searchQuery.toLowerCase() === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (filterCategory === cat) {
                    setFilterCategory(null);
                  } else {
                    setFilterCategory(cat);
                    setSearchQuery("");
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? config.color
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span>{config.emoji}</span>
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-300">Filter by:</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Spirit Filter */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">Base Spirit</label>
                <select
                  value={filterSpirit || ""}
                  onChange={(e) => setFilterSpirit(e.target.value || null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-lime-500/50"
                >
                  <option value="">All Spirits</option>
                  {filterOptions.spirits.map((spirit) => (
                    <option key={spirit} value={spirit} className="capitalize">
                      {spirit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Glass Filter */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">Glass Type</label>
                <select
                  value={filterGlass || ""}
                  onChange={(e) => setFilterGlass(e.target.value || null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-lime-500/50"
                >
                  <option value="">All Glasses</option>
                  {filterOptions.glasses.map((glass) => (
                    <option key={glass} value={glass} className="capitalize">
                      {glass.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">Difficulty</label>
                <select
                  value={filterDifficulty || ""}
                  onChange={(e) => setFilterDifficulty(e.target.value || null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-lime-500/50"
                >
                  <option value="">All Levels</option>
                  {filterOptions.difficulties.map((diff) => (
                    <option key={diff} value={diff} className="capitalize">
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs text-slate-500 mb-2">Category</label>
                <select
                  value={filterCategory || ""}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-lime-500/50"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((cat) => {
                    const config = CATEGORY_CONFIG[cat];
                    return (
                      <option key={cat} value={cat}>
                        {config ? `${config.emoji} ${config.label}` : cat}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="text-lime-400 font-medium">{filteredCocktails.length}</span> of{" "}
          <span className="text-slate-300">{cocktails.length}</span> cocktails
        </p>
        {(searchQuery || activeFilterCount > 0) && (
          <button
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredCocktails.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-700 rounded-2xl">
          <div className="text-6xl mb-6 opacity-70">🔍</div>
          <h2 className="text-xl font-serif font-bold text-slate-200 mb-3">
            No cocktails found
          </h2>
          <p className="text-slate-400 max-w-md text-sm">
            Try adjusting your search terms or filters. You can search by name, ingredient, category like &quot;tiki&quot; or &quot;holiday&quot;, or keywords like &quot;popular&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
            className="mt-6 px-4 py-2 bg-lime-500/10 text-lime-400 border border-lime-500/30 rounded-lg text-sm font-medium hover:bg-lime-500 hover:text-slate-900 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Cocktail Grid */}
      {filteredCocktails.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCocktails.map((cocktail) => (
            <CocktailCard key={cocktail._id} cocktail={cocktail} />
          ))}
        </div>
      )}
    </div>
  );
}

function CocktailCard({ cocktail }: { cocktail: SanityCocktail }) {
  const imageUrl = getImageUrl(cocktail.image, { width: 600, height: 400 }) || cocktail.externalImageUrl;
  const ingredientCount = cocktail.ingredients?.length || 0;

  return (
    <Link
      href={`/cocktails/${cocktail.slug?.current || cocktail._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-lime-500/40 hover:shadow-xl hover:shadow-lime-900/10"
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={cocktail.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-700 text-5xl">
            🍸
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[80%]">
          {cocktail.isTrending && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              <FireIcon className="w-3 h-3" /> TRENDING
            </span>
          )}
          {cocktail.isPopular && !cocktail.isTrending && (
            <span className="flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              <StarIcon className="w-3 h-3" /> FEATURED
            </span>
          )}
          {cocktail.isFavorite && (
            <span className="flex items-center gap-1 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              <HeartIcon className="w-3 h-3" /> FAVORITE
            </span>
          )}
          {cocktail.difficulty && (
            <span className="bg-slate-800/90 text-slate-200 text-[10px] font-medium px-2 py-1 rounded">
              {cocktail.difficulty.charAt(0).toUpperCase() + cocktail.difficulty.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10 -mt-12">
        <div className="backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg flex-1 flex flex-col bg-slate-950/80">
          <div className="mb-2">
            {cocktail.primarySpirit && (
              <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase mb-1">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3 className="font-serif font-bold text-xl leading-tight text-slate-100">
              {cocktail.name}
            </h3>
          </div>

          {/* Category Tags */}
          {cocktail.drinkCategories && cocktail.drinkCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {cocktail.drinkCategories.slice(0, 3).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                if (!config) return null;
                return (
                  <span
                    key={cat}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${config.color}`}
                  >
                    {config.emoji} {config.label}
                  </span>
                );
              })}
            </div>
          )}

          {cocktail.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {cocktail.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
            {cocktail.glass && (
              <span className="capitalize">{cocktail.glass.replace(/-/g, " ")}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
