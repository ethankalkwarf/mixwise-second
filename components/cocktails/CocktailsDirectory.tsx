"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, StarIcon, HeartIcon, FireIcon } from "@heroicons/react/20/solid";
import type { Cocktail } from "@/lib/cocktailTypes";

type SortOption = "name-asc" | "name-desc" | "popular";

type Props = {
  cocktails: Cocktail[];
};

// Key for persisting filter state
const FILTER_STATE_KEY = "mixwise-cocktails-filters";
const SCROLL_STATE_KEY = "mixwise-cocktails-scroll";

interface FilterState {
  searchQuery: string;
  sortBy: SortOption;
  filterSpirit: string | null;
  filterGlass: string | null;
  filterCategory: string | null;
  showFilters: boolean;
}

// Category display configuration - Botanical theme
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  tiki: { label: "Tiki", emoji: "🏝️", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  classic: { label: "Classic", emoji: "🎩", color: "bg-forest/20 text-forest border-forest/30" },
  holiday: { label: "Holiday", emoji: "🎄", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  modern: { label: "Modern", emoji: "✨", color: "bg-olive/20 text-olive border-olive/30" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  mocktail: { label: "Mocktail", emoji: "🍹", color: "bg-olive/20 text-olive border-olive/30" },
  party: { label: "Party", emoji: "🎉", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  summer: { label: "Summer", emoji: "☀️", color: "bg-olive/20 text-olive border-olive/30" },
  winter: { label: "Winter", emoji: "❄️", color: "bg-forest/20 text-forest border-forest/30" },
  fall: { label: "Fall", emoji: "🍂", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  spring: { label: "Spring", emoji: "🌸", color: "bg-olive/20 text-olive border-olive/30" },
  strong: { label: "Strong", emoji: "🔥", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  refreshing: { label: "Refreshing", emoji: "🌿", color: "bg-olive/20 text-olive border-olive/30" },
  sour: { label: "Sour", emoji: "🍋", color: "bg-olive/20 text-olive border-olive/30" },
  sweet: { label: "Sweet", emoji: "🍯", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  boozy: { label: "Boozy", emoji: "🥃", color: "bg-forest/20 text-forest border-forest/30" },
  "low-calorie": { label: "Low-Cal", emoji: "🥗", color: "bg-olive/20 text-olive border-olive/30" },
  quick: { label: "Quick", emoji: "⚡", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
};

// Predefined list of base spirits
const BASE_SPIRITS = [
  { value: "vodka", label: "Vodka" },
  { value: "gin", label: "Gin" },
  { value: "rum", label: "Rum" },
  { value: "tequila", label: "Tequila" },
  { value: "mezcal", label: "Mezcal" },
  { value: "whiskey", label: "Whiskey" },
  { value: "bourbon", label: "Bourbon" },
  { value: "scotch", label: "Scotch" },
  { value: "brandy", label: "Brandy" },
  { value: "cognac", label: "Cognac" },
  { value: "none", label: "Non-Alcoholic" },
];

// Keywords that map to special filters
const KEYWORD_MAPPINGS: Record<string, (c: Cocktail) => boolean> = {
  popular: (c) => c.isPopular === true,
  featured: (c) => c.isPopular === true,
  favorite: (c) => c.isFavorite === true,
  favourites: (c) => c.isFavorite === true,
  trending: (c) => c.isTrending === true,
  hot: (c) => c.isTrending === true,
};

// Number of items to load per batch
const ITEMS_PER_PAGE = 24;

export function CocktailsDirectory({ cocktails }: Props) {
  const router = useRouter();
  
  // Initialize state from sessionStorage if available
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [filterSpirit, setFilterSpirit] = useState<string | null>(null);
  const [filterGlass, setFilterGlass] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Restore filter state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FILTER_STATE_KEY);
      if (saved) {
        const state: FilterState = JSON.parse(saved);
        setSearchQuery(state.searchQuery || "");
        setSortBy(state.sortBy || "name-asc");
        setFilterSpirit(state.filterSpirit);
        setFilterGlass(state.filterGlass);
        setFilterCategory(state.filterCategory);
        setShowFilters(state.showFilters || false);
      }
    } catch (e) {
      console.error("Error restoring filter state:", e);
    }
    setIsInitialized(true);
  }, []);

  // Restore scroll position after filters are applied
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const savedScroll = sessionStorage.getItem(SCROLL_STATE_KEY);
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10);
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
        // Clear the saved scroll after restoring
        sessionStorage.removeItem(SCROLL_STATE_KEY);
      }
    } catch (e) {
      console.error("Error restoring scroll position:", e);
    }
  }, [isInitialized]);

  // Save filter state to sessionStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const state: FilterState = {
      searchQuery,
      sortBy,
      filterSpirit,
      filterGlass,
      filterCategory,
      showFilters,
    };
    try {
      sessionStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving filter state:", e);
    }
  }, [isInitialized, searchQuery, sortBy, filterSpirit, filterGlass, filterCategory, showFilters]);

  // Save scroll position before navigating to a cocktail
  const handleCocktailClick = useCallback((slug: string) => {
    try {
      sessionStorage.setItem(SCROLL_STATE_KEY, window.scrollY.toString());
    } catch (e) {
      console.error("Error saving scroll position:", e);
    }
    router.push(`/cocktails/${slug}`);
  }, [router]);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const glasses = new Set<string>();
    const categories = new Set<string>();

    cocktails.forEach((c) => {
      if (c.glass) glasses.add(c.glass);
      c.categories?.forEach((cat) => categories.add(cat));
    });

    return {
      glasses: Array.from(glasses).sort(),
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
        if (c.ingredients?.some((ing) => ing.name?.toLowerCase().includes(q))) return true;
        // Match primary spirit
        if (c.baseSpirit?.toLowerCase().includes(q)) return true;
        // Match tags
        if (c.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
        // Match drink categories
        if (c.categories?.some((cat) => cat.toLowerCase().includes(q))) return true;
        // Match category labels
        if (c.categories?.some((cat) => {
          const config = CATEGORY_CONFIG[cat];
          return config?.label.toLowerCase().includes(q);
        })) return true;
        
        return false;
      });
    }

    // Spirit filter
    if (filterSpirit) {
      results = results.filter((c) => c.baseSpirit === filterSpirit);
    }

    // Glass filter
    if (filterGlass) {
      results = results.filter((c) => c.glass === filterGlass);
    }

    // Category filter
    if (filterCategory) {
      results = results.filter((c) => c.categories?.includes(filterCategory));
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
    }

    return results;
  }, [cocktails, searchQuery, sortBy, filterSpirit, filterGlass, filterCategory]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, sortBy, filterSpirit, filterGlass, filterCategory]);

  // Lazy loading with Intersection Observer
  const loadMore = useCallback(() => {
    if (visibleCount < filteredCocktails.length) {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCocktails.length));
    }
  }, [visibleCount, filteredCocktails.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const visibleCocktails = filteredCocktails.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCocktails.length;

  const activeFilterCount = [filterSpirit, filterGlass, filterCategory].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSpirit(null);
    setFilterGlass(null);
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
              className="input-botanical pl-10 pr-10"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage hover:text-forest"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-cream border border-mist rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-terracotta cursor-pointer"
          >
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
            <option value="popular">Popular First</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-terracotta/10 border-terracotta/50 text-terracotta"
                : "bg-white border-mist text-sage hover:border-stone"
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-terracotta text-cream text-xs font-bold px-1.5 py-0.5 rounded-full">
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
                    ? "bg-terracotta/20 border-terracotta/50 text-terracotta"
                    : "bg-white border-mist text-sage hover:border-stone hover:text-forest"
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
                    : "bg-white border-mist text-sage hover:border-stone"
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
          <div className="bg-white border border-mist rounded-2xl p-4 space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-forest">Filter by:</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-terracotta hover:text-terracotta-dark"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Spirit Filter */}
              <div>
                <label className="label-botanical">Base Spirit</label>
                <select
                  value={filterSpirit || ""}
                  onChange={(e) => setFilterSpirit(e.target.value || null)}
                  className="w-full bg-cream border border-mist rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-terracotta"
                >
                  <option value="">All Spirits</option>
                  {BASE_SPIRITS.map((spirit) => (
                    <option key={spirit.value} value={spirit.value}>
                      {spirit.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Glass Filter */}
              <div>
                <label className="label-botanical">Glass Type</label>
                <select
                  value={filterGlass || ""}
                  onChange={(e) => setFilterGlass(e.target.value || null)}
                  className="w-full bg-cream border border-mist rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-terracotta"
                >
                  <option value="">All Glasses</option>
                  {filterOptions.glasses.map((glass) => (
                    <option key={glass} value={glass} className="capitalize">
                      {glass.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="label-botanical">Category</label>
                <select
                  value={filterCategory || ""}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                  className="w-full bg-cream border border-mist rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-terracotta"
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
        <p className="text-sm text-sage">
          Showing <span className="text-olive font-medium">{visibleCocktails.length}</span> of{" "}
          <span className="text-forest">{filteredCocktails.length}</span> cocktails
        </p>
        {(searchQuery || activeFilterCount > 0) && (
          <button
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
            className="text-xs text-sage hover:text-terracotta"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredCocktails.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-mist rounded-3xl bg-white">
          <div className="text-6xl mb-6 opacity-70">🔍</div>
          <h2 className="text-xl font-display font-bold text-forest mb-3">
            No cocktails found
          </h2>
          <p className="text-sage max-w-md text-sm">
            Try adjusting your search terms or filters. You can search by name, ingredient, category like &quot;tiki&quot; or &quot;holiday&quot;, or keywords like &quot;popular&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
            className="mt-6 px-4 py-2 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-xl text-sm font-medium hover:bg-terracotta hover:text-cream transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Cocktail Grid with Lazy Loading */}
      {visibleCocktails.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCocktails.map((cocktail) => (
              <CocktailCard 
                key={cocktail._id} 
                cocktail={cocktail} 
                onClick={handleCocktailClick}
              />
            ))}
          </div>
          
          {/* Load More Trigger */}
          {hasMore && (
            <div 
              ref={loadMoreRef}
              className="flex justify-center py-8"
            >
              <div className="flex items-center gap-2 text-sage">
                <div className="spinner" />
                <span className="text-sm">Loading more...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CocktailCard({
  cocktail,
  onClick
}: {
  cocktail: Cocktail;
  onClick: (slug: string) => void;
}) {
const imageUrl = cocktail.imageUrl;
const ingredientCount = cocktail.ingredients?.length || 0;
const slug = cocktail.slug;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(slug);
  };

  return (
    <a
      href={`/cocktails/${slug}`}
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-mist">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={cocktail.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sage text-5xl">
            🍸
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[80%]">
          {cocktail.isTrending && (
            <span className="flex items-center gap-1 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              <FireIcon className="w-3 h-3" /> TRENDING
            </span>
          )}
          {cocktail.isPopular && !cocktail.isTrending && (
            <span className="flex items-center gap-1 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              <StarIcon className="w-3 h-3" /> FEATURED
            </span>
          )}
          {cocktail.isFavorite && (
            <span className="flex items-center gap-1 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              <HeartIcon className="w-3 h-3" /> FAVORITE
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10 -mt-12">
        <div className="backdrop-blur-md rounded-2xl p-4 border border-mist/50 shadow-soft flex-1 flex flex-col bg-white/90">
          <div className="mb-2">
            {cocktail.baseSpirit && (
              <p className="font-mono text-[10px] text-terracotta font-bold tracking-widest uppercase mb-1">
                {cocktail.baseSpirit}
              </p>
            )}
            <h3 className="font-display font-bold text-xl leading-tight text-forest">
              {cocktail.name}
            </h3>
          </div>

          {/* Category Tags */}
          {cocktail.categories && cocktail.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {cocktail.categories.slice(0, 3).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                if (!config) return null;
                return (
                  <span
                    key={cat}
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${config.color}`}
                  >
                    {config.emoji} {config.label}
                  </span>
                );
              })}
            </div>
          )}

          {cocktail.description && (
            <p className="text-xs text-sage line-clamp-2 mb-3">
              {cocktail.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between text-xs text-sage">
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
            {cocktail.glass && (
              <span className="capitalize">{cocktail.glass.replace(/-/g, " ")}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
