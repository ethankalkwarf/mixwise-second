"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, StarIcon, HeartIcon, FireIcon } from "@heroicons/react/20/solid";
import type { SanityCocktail } from "@/lib/sanityTypes";
import { getImageUrl, COCKTAIL_BLUR_DATA_URL } from "@/lib/sanityImage";
import { formatCocktailName, isNewCocktail } from "@/lib/formatters";
import { ComingSoonCocktailImage } from "@/components/cocktails/ComingSoonCocktailImage";
import { useInfiniteVisibleCount } from "@/hooks/useInfiniteVisibleCount";
import { HardNavLink } from "@/components/layout/HardNavLink";
import { searchSanityCocktails } from "@/lib/search";
import { NativePageHero } from "@/components/mobile/NativePageHero";
import {
  NativeBrowseTabs,
  NativeCollectionsGrid,
  NativeSpiritFilters,
  type NativeBrowseTab,
} from "@/components/mobile/NativeSearchBrowse";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";
import { refreshNativeShellData } from "@/lib/mobile/refreshNativeData";
import {
  deterministicShuffle,
  getBrowseRefreshSeed,
  getCocktailsRandomizationSeed,
} from "@/lib/randomization";
import { NativeDrinkTile } from "@/components/mobile/NativeDrinkTile";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { MIXWISE_FOCUS_SEARCH } from "@/lib/mobile/navConfig";
import { CollectionBrowseTracker } from "@/components/onboarding/CollectionBrowseTracker";
import { trackSearch } from "@/lib/analytics";

type SortOption = "default" | "name-asc" | "name-desc" | "popular";

// Key for persisting filter state
const FILTER_STATE_KEY = "mixwise-cocktails-filters";
const SCROLL_STATE_KEY = "mixwise-cocktails-scroll";

interface FilterState {
  searchQuery: string;
  sortBy: SortOption;
  filterSpirit: string | null;
  filterGlass: string | null;
  showFilters: boolean;
  browseTab: NativeBrowseTab;
}

type ScrollRestore = {
  y: number;
  visibleCount?: number;
};

function readScrollRestore(): ScrollRestore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SCROLL_STATE_KEY);
    if (!raw) return null;
    // Legacy: plain pixel string
    if (/^\d+(\.\d+)?$/.test(raw)) {
      return { y: Number(raw) };
    }
    const parsed = JSON.parse(raw) as ScrollRestore;
    if (typeof parsed?.y === "number" && Number.isFinite(parsed.y)) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

// Category display configuration - Botanical theme
const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  tiki: { label: "Tiki", emoji: "🏝️", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  classic: { label: "Classic", emoji: "🎩", color: "bg-forest/20 text-forest border-forest/30" },
  holiday: { label: "Holiday", emoji: "🎄", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  modern: { label: "Modern", emoji: "✨", color: "bg-olive/20 text-olive border-olive/30" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
  mocktail: { label: "Mocktail", emoji: "🍹", color: "bg-olive/20 text-olive border-olive/30" },
  party: { label: "Crowd-Pleasers", emoji: "🎉", color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
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
  { value: "non-alcoholic", label: "Non-Alcoholic" },
];

type Props = {
  cocktails: SanityCocktail[];
  initialSpirit?: string | null;
  initialFilter?: string | null;
  initialQuery?: string | null;
  initialBrowse?: NativeBrowseTab | null;
};

// Number of items to load per batch
const ITEMS_PER_PAGE = 24;

export function CocktailsDirectory({
  cocktails,
  initialSpirit = null,
  initialFilter = null,
  initialQuery = null,
  initialBrowse = null,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize state from sessionStorage if available
  const [searchQuery, setSearchQuery] = useState(
    initialQuery || (initialFilter === "new" ? "new" : "")
  );
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [filterSpirit, setFilterSpirit] = useState<string | null>(initialSpirit);
  const [filterGlass, setFilterGlass] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(Boolean(initialSpirit));
  const [browseTab, setBrowseTab] = useState<NativeBrowseTab>(
    initialBrowse === "recipes" || initialBrowse === "collections"
      ? initialBrowse
      : "collections"
  );
  const [browseSeed, setBrowseSeed] = useState(() => getCocktailsRandomizationSeed());
  const [isInitialized, setIsInitialized] = useState(false);
  const [scrollRestore, setScrollRestore] = useState<ScrollRestore | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener(MIXWISE_FOCUS_SEARCH, focusSearch);
    return () => window.removeEventListener(MIXWISE_FOCUS_SEARCH, focusSearch);
  }, []);

  useEffect(() => {
    const browse = searchParams.get("browse");
    if (browse === "collections" || browse === "recipes") {
      setBrowseTab(browse);
    }
    const spirit = searchParams.get("spirit")?.toLowerCase() || null;
    if (spirit) {
      setFilterSpirit(spirit);
      setShowFilters(true);
      setBrowseTab("recipes");
    }
  }, [searchParams]);

  // Restore filter + scroll targets from sessionStorage on mount (URL params win)
  useEffect(() => {
    if (typeof window === "undefined") return;

    setScrollRestore(readScrollRestore());

    if (initialSpirit || initialFilter || initialQuery) {
      setIsInitialized(true);
      return;
    }

    try {
      const saved = sessionStorage.getItem(FILTER_STATE_KEY);
      if (saved) {
        const state: FilterState = JSON.parse(saved);
        setSearchQuery(state.searchQuery || "");
        setSortBy(state.sortBy || "default");
        setFilterSpirit(state.filterSpirit);
        setFilterGlass(state.filterGlass);
        setShowFilters(state.showFilters || false);
        if (state.browseTab === "recipes" || state.browseTab === "collections") {
          setBrowseTab(state.browseTab);
        }
      }
    } catch (e) {
      console.error("Error restoring filter state:", e);
    }
    setIsInitialized(true);
  }, [initialSpirit, initialFilter, initialQuery]);

  // Restore scroll after filters + enough list rows are on screen.
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined" || !scrollRestore) return;

    const targetY = scrollRestore.y;
    if (!Number.isFinite(targetY) || targetY <= 0) {
      sessionStorage.removeItem(SCROLL_STATE_KEY);
      return;
    }

    let attempts = 0;
    let raf = 0;
    const maxAttempts = 45;

    const tryRestore = () => {
      attempts += 1;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      // Wait until layout can reach the saved offset (images / Load more rows).
      if (maxScroll + 8 >= targetY || attempts >= maxAttempts) {
        window.scrollTo(0, Math.min(targetY, maxScroll));
        sessionStorage.removeItem(SCROLL_STATE_KEY);
        return;
      }
      raf = window.requestAnimationFrame(tryRestore);
    };

    raf = window.requestAnimationFrame(tryRestore);
    return () => window.cancelAnimationFrame(raf);
  }, [isInitialized, scrollRestore]);

  // Save filter state to sessionStorage when it changes
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    
    const state: FilterState = {
      searchQuery,
      sortBy,
      filterSpirit,
      filterGlass,
      showFilters,
      browseTab,
    };
    try {
      sessionStorage.setItem(FILTER_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving filter state:", e);
    }
  }, [isInitialized, searchQuery, sortBy, filterSpirit, filterGlass, showFilters, browseTab]);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const glasses = new Set<string>();

    cocktails.forEach((c) => {
      if (c.glass) glasses.add(c.glass);
    });

    return {
      glasses: Array.from(glasses).sort(),
    };
  }, [cocktails]);

  const nativeShell = useNativeShell();

  const catalogOrder = useMemo(() => {
    if (sortBy === "default") {
      return deterministicShuffle(cocktails, browseSeed);
    }
    return cocktails;
  }, [cocktails, browseSeed, sortBy]);

  const handleBrowseRefresh = useCallback(async () => {
    await refreshNativeShellData();
    if (!searchQuery.trim()) {
      setBrowseSeed(getBrowseRefreshSeed());
    }
  }, [searchQuery]);

  // Filter and sort cocktails
  const filteredCocktails = useMemo(() => {
    let results = [...catalogOrder];

    if (searchQuery.trim()) {
      results = searchSanityCocktails(results, searchQuery);
    }

    // Spirit filter (case-insensitive; Non-Alcoholic matches NA base spirits)
    if (filterSpirit) {
      const spirit = filterSpirit.toLowerCase();
      results = results.filter((c) => {
        const primary = (c.primarySpirit || "").toLowerCase();
        if (!primary) return false;
        if (spirit === "non-alcoholic") {
          return primary.includes("non-alcoholic") || primary === "none";
        }
        return primary === spirit || primary.includes(spirit);
      });
    }

    // Glass filter
    if (filterGlass) {
      results = results.filter((c) => c.glass === filterGlass);
    }

    // Sort
    switch (sortBy) {
      case "default":
        // Preserve server-provided order (randomized by default)
        break;
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
  }, [catalogOrder, searchQuery, sortBy, filterSpirit, filterGlass]);

  // Debounced search analytics (skip empty queries)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const timer = window.setTimeout(() => {
      void trackSearch(q, filteredCocktails.length, {
        filters: {
          spirit: filterSpirit,
          glass: filterGlass,
          sort: sortBy,
        },
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [searchQuery, filteredCocktails.length, filterSpirit, filterGlass, sortBy]);

  const { visibleItems: visibleCocktails, hasMore, loadMore, visibleCount } =
    useInfiniteVisibleCount(filteredCocktails, ITEMS_PER_PAGE, {
      mode: "manual",
      initialVisibleCount: scrollRestore?.visibleCount,
    });

  // Save scroll + visible row count before navigating to a cocktail.
  // Do not preventDefault — intercepted client navigation was hanging the tab.
  const handleCocktailClick = useCallback(() => {
    try {
      const payload: ScrollRestore = {
        y: window.scrollY,
        visibleCount,
      };
      sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Error saving scroll position:", e);
    }
  }, [visibleCount]);

  const activeFilterCount = [filterSpirit, filterGlass].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSpirit(null);
    setFilterGlass(null);
  };

  // Quick filter chips for common searches
  const quickFilters = [
    { label: "Popular", query: "popular", icon: StarIcon },
    { label: "Favorites", query: "favorite", icon: HeartIcon },
    { label: "Trending", query: "trending", icon: FireIcon },
  ];

  if (nativeShell) {
    const browsing = !searchQuery.trim();
    const showRecipes = !browsing || browseTab === "recipes";

    return (
      <PullToRefreshContainer onRefresh={handleBrowseRefresh}>
        <div className="native-frame pt-4">
          <NativePageHero
            eyebrow="Browse"
            title="Search"
            description="Collections, spirits, and every recipe in the book."
          />
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Drinks, spirits, ingredients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-10 text-base text-forest shadow-sm placeholder:text-sage"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sage"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          {browsing ? (
            <NativeBrowseTabs tab={browseTab} onTab={setBrowseTab} />
          ) : null}

          {showRecipes ? (
            <>
              <NativeSpiritFilters
                spirits={BASE_SPIRITS}
                filterSpirit={filterSpirit}
                onFilterSpirit={setFilterSpirit}
              />

              <p className="mb-3 text-xs text-sage">
                {filteredCocktails.length} recipe{filteredCocktails.length === 1 ? "" : "s"}
              </p>

              {filteredCocktails.length === 0 ? (
                <div className="rounded-3xl bg-white px-5 py-12 text-center">
                  <p className="font-display text-lg font-bold text-forest">No matches</p>
                  <p className="mt-1 text-sm text-sage">Try a different spirit or search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      clearFilters();
                    }}
                    className="mt-4 text-sm font-semibold text-terracotta"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="native-recipe-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                      columnGap: 12,
                      rowGap: 20,
                    }}
                  >
                    {visibleCocktails.map((cocktail) => {
                      const imageUrl =
                        getImageUrl(cocktail.image, { width: 700, height: 900, quality: 80 }) ||
                        cocktail.externalImageUrl;
                      const slug = cocktail.slug?.current || cocktail._id;
                      return (
                        <NativeDrinkTile
                          key={cocktail._id}
                          href={`/cocktails/${slug}`}
                          name={cocktail.name}
                          spirit={cocktail.primarySpirit}
                          imageUrl={imageUrl}
                          createdAt={cocktail.createdAt}
                          onNavigate={handleCocktailClick}
                        />
                      );
                    })}
                  </div>
                  {hasMore ? (
                    <div className="flex justify-center py-6">
                      <button
                        type="button"
                        onClick={loadMore}
                        className="rounded-xl border border-mist bg-white px-5 py-3 text-sm font-semibold text-forest shadow-sm transition-colors hover:border-terracotta/40 hover:text-terracotta"
                      >
                        Load more
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <CollectionBrowseTracker />
              <NativeCollectionsGrid shuffleSeed={browseSeed} />
            </>
          )}
        </div>
      </PullToRefreshContainer>
    );
  }

  return (
    <PullToRefreshContainer onRefresh={handleBrowseRefresh}>
    <div>
      {/* Search and Filters Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search cocktails or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-botanical pl-10 pr-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-terracotta/20"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage transition-colors duration-200 group-focus-within:text-terracotta" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage hover:text-forest active:scale-90 transition-all duration-200 rounded-full p-1 hover:bg-mist/50"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-cream border border-mist rounded-xl px-4 py-3 text-sm text-forest focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:scale-[1.02] cursor-pointer transition-all duration-200"
          >
            <option value="default">Default</option>
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
            <option value="popular">Popular First</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
              showFilters || activeFilterCount > 0
                ? "bg-terracotta/10 border-terracotta/50 text-terracotta shadow-sm"
                : "bg-white border-mist text-sage hover:border-stone hover:shadow-sm"
            }`}
          >
            <FunnelIcon className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-terracotta text-cream text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-terracotta/20 border-terracotta/50 text-terracotta shadow-sm scale-105"
                    : "bg-white border-mist text-sage hover:border-stone hover:text-forest hover:scale-105 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-mist rounded-2xl p-4 space-y-4 shadow-soft animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-forest">Filter by:</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-terracotta hover:text-terracotta-dark active:scale-95 transition-all duration-200 font-medium px-2 py-1 rounded-lg hover:bg-terracotta/10"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Spirit Filter */}
              <div>
                <label className="label-botanical">Base spirit</label>
                <select
                  value={filterSpirit || ""}
                  onChange={(e) => setFilterSpirit(e.target.value || null)}
                  className="w-full bg-cream border border-mist rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:scale-[1.02] transition-all duration-200 cursor-pointer"
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
                  className="w-full bg-cream border border-mist rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <option value="">All Glasses</option>
                  {filterOptions.glasses.map((glass) => (
                    <option key={glass} value={glass} className="capitalize">
                      {glass.replace(/-/g, " ")}
                    </option>
                  ))}
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
            className="text-xs text-sage hover:text-terracotta active:scale-95 transition-all duration-200 font-medium px-2 py-1 rounded-lg hover:bg-mist/50"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredCocktails.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-mist rounded-3xl bg-white animate-fade-in">
          <div className="text-6xl mb-6 opacity-70 animate-float">🔍</div>
          <h2 className="text-xl font-display font-bold text-forest mb-3">
            No cocktails found
          </h2>
          <p className="text-sage max-w-md text-sm mb-6">
            Try adjusting your search terms or filters. You can search by name, ingredient, category like &quot;tiki&quot; or &quot;holiday&quot;, or keywords like &quot;popular&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              clearFilters();
            }}
            className="px-6 py-3 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-xl text-sm font-medium hover:bg-terracotta hover:text-cream hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Cocktail Grid with Lazy Loading */}
      {visibleCocktails.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCocktails.map((cocktail, index) => (
              <CocktailCard 
                key={cocktail._id} 
                cocktail={cocktail} 
                onNavigate={handleCocktailClick}
                index={index}
              />
            ))}
          </div>
          
          {hasMore ? (
            <div className="flex flex-col items-center gap-3 py-10 animate-fade-in">
              <button
                type="button"
                onClick={loadMore}
                className="rounded-xl border border-mist bg-white px-6 py-3 text-sm font-semibold text-forest shadow-sm transition-all duration-200 hover:border-terracotta/40 hover:text-terracotta hover:shadow-md active:scale-[0.98]"
              >
                Load more cocktails
              </button>
              <p className="text-xs text-sage">
                {visibleCocktails.length} of {filteredCocktails.length} shown
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
    </PullToRefreshContainer>
  );
}

function CocktailCard({ 
  cocktail, 
  onNavigate,
  index = 0
}: { 
  cocktail: SanityCocktail;
  onNavigate: () => void;
  index?: number;
}) {
  const imageUrl = getImageUrl(cocktail.image, { width: 900, height: 600, quality: 75 }) || cocktail.externalImageUrl;
  const ingredientCount = cocktail.ingredientNames?.length || cocktail.ingredients?.length || 0;
  const slug = cocktail.slug?.current || cocktail._id;

  return (
    <HardNavLink
      href={`/cocktails/${slug}`}
      onClick={onNavigate}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-mist bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover cursor-pointer animate-fade-in"
      style={{
        animationDelay: `${Math.min(index, 8) * 40}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-mist">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={cocktail.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
              quality={75}
              placeholder="blur"
              blurDataURL={COCKTAIL_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
          </>
        ) : (
          <ComingSoonCocktailImage name={cocktail.name} size="card" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[80%]">
          {isNewCocktail(cocktail.createdAt) && (
            <span className="flex items-center gap-1 bg-terracotta text-cream text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              NEW
            </span>
          )}
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
        <div className="backdrop-blur-md rounded-2xl p-4 border border-mist/50 shadow-soft flex-1 flex flex-col bg-white/90 group-hover:bg-white/95 transition-colors duration-300">
          <div className="mb-2">
            {cocktail.primarySpirit && (
              <p className="font-mono text-[10px] text-terracotta font-bold tracking-widest uppercase mb-1">
                {cocktail.primarySpirit}
              </p>
            )}
            <h3 className="font-display font-bold text-xl leading-tight text-forest">
              {formatCocktailName(cocktail.name)}
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

          <div className="mt-auto text-xs text-sage">
            <span>{ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </HardNavLink>
  );
}
