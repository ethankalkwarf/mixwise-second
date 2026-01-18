"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { MagnifyingGlassIcon, XMarkIcon, CheckIcon, FunnelIcon } from "@heroicons/react/20/solid";

type Props = {
  ingredients: MixIngredient[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  stapleIds?: string[];
};

// Category icons and colors - Botanical theme
const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  Spirit: { icon: "🥃", color: "bg-terracotta/20" },
  Liqueur: { icon: "🍸", color: "bg-forest/20" },
  Mixer: { icon: "🥤", color: "bg-olive/20" },
  Garnish: { icon: "🍒", color: "bg-terracotta/20" },
  Wine: { icon: "🍷", color: "bg-terracotta/30" },
  Beer: { icon: "🍺", color: "bg-olive/30" },
  Bitters: { icon: "💧", color: "bg-sage/30" },
  Syrup: { icon: "🍯", color: "bg-terracotta/20" },
  Citrus: { icon: "🍋", color: "bg-olive/30" },
};

const FILTER_CATEGORIES = ["Spirit", "Liqueur", "Mixer", "Garnish", "Bitters", "Syrup", "Citrus"];

// Normalize ingredient names for consistent display
function normalizeIngredientName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Normalize string for accent-insensitive comparison
// This handles variations like "Blue Curacao" vs "Blue Curaçao"
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize Form Decomposed - separates base characters from diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .trim();
}

// Get first letter for grouping
function getFirstLetter(name: string): string {
  const normalized = name.trim().toUpperCase();
  const firstChar = normalized.charAt(0);
  // Handle numbers and special chars
  if (/[A-Z]/.test(firstChar)) return firstChar;
  if (/[0-9]/.test(firstChar)) return "#";
  return "#";
}

export function MixInventoryPanel({ ingredients, selectedIds, onChange, stapleIds }: Props) {
  // Ensure stapleIds is always an array
  const safeStapleIds = stapleIds || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set<string>(selectedIds), [selectedIds]);

  const handleToggle = useCallback(
    (id: string, name?: string) => {
      const next = new Set(selectedSet);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onChange(Array.from(next));
    },
    [selectedSet, onChange]
  );

  const handleReset = useCallback(() => {
    onChange([]);
    setShowSelectedOnly(false);
  }, [onChange]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleScrollToLetter = useCallback((letter: string) => {
    const section = sectionRefs.current.get(letter);
    if (section && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const sectionTop = section.offsetTop - container.offsetTop;
      container.scrollTo({
        top: sectionTop - 60, // Account for sticky header
        behavior: "smooth",
      });
    }
  }, []);

  // Filter and group ingredients
  const { groupedIngredients, availableLetters, filteredCount } = useMemo(() => {
    let filtered = ingredients;

    // Filter out staples (like ice, water)
    const stapleSet = new Set(safeStapleIds);
    filtered = filtered.filter((i) => !stapleSet.has(i.id));

    // Apply search filter (accent-insensitive)
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeForSearch(searchQuery);
      filtered = filtered.filter((i) => {
        const normalizedName = normalizeForSearch(i.name);
        return normalizedName.includes(normalizedQuery);
      });
    }

    // Apply category filter
    if (activeFilter) {
      filtered = filtered.filter((i) => i.category === activeFilter);
    }

    // Apply selected-only filter
    if (showSelectedOnly) {
      filtered = filtered.filter((i) => selectedSet.has(i.id));
    }

    // Sort alphabetically by name
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    // Group by first letter
    const grouped = new Map<string, MixIngredient[]>();
    for (const ing of filtered) {
      const letter = getFirstLetter(ing.name);
      const list = grouped.get(letter) ?? [];
      list.push(ing);
      grouped.set(letter, list);
    }

    // Sort groups alphabetically
    const sortedGroups = Array.from(grouped.entries()).sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    // Get all available letters
    const letters = sortedGroups.map(([letter]) => letter);

    return {
      groupedIngredients: sortedGroups,
      availableLetters: letters,
      filteredCount: filtered.length,
    };
  }, [ingredients, searchQuery, activeFilter, showSelectedOnly, selectedSet, safeStapleIds]);

  // Generate A-Z for scrubber
  const alphabet = useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    letters.push("#");
    return letters;
  }, []);

  const setSectionRef = useCallback((letter: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(letter, el);
    } else {
      sectionRefs.current.delete(letter);
    }
  }, []);

  return (
    <section
      className="bg-white border border-mist rounded-3xl flex flex-col h-[calc(100vh-10rem)] max-w-[480px] mx-auto overflow-hidden shadow-card"
      aria-label="Ingredient selection panel"
    >
      {/* Header */}
      <div className="p-5 border-b border-mist bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-forest flex items-center gap-3">
            <span>My Bar</span>
            <span
              className="text-sm font-sans font-bold text-cream bg-terracotta px-2.5 py-1 rounded-full min-w-[32px] text-center"
              aria-label={`${selectedIds.length} ingredients selected`}
            >
              {selectedIds.length}
            </span>
          </h2>
          {selectedIds.length > 0 && (
            <button
              onClick={handleReset}
              className="text-sm font-medium text-sage hover:text-terracotta transition-colors px-3 py-1.5 rounded-xl hover:bg-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
              aria-label="Reset all selected ingredients"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage pointer-events-none" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-botanical pl-11 pr-10"
            aria-label="Search ingredients"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sage hover:text-forest transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all min-h-[44px] ${
              activeFilter === null
                ? "bg-terracotta text-cream border-terracotta"
                : "bg-white border-mist text-sage hover:bg-mist hover:text-forest"
            }`}
          >
            All
          </button>
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all min-h-[44px] ${
                activeFilter === cat
                  ? "bg-terracotta text-cream border-terracotta"
                  : "bg-white border-mist text-sage hover:bg-mist hover:text-forest"
              }`}
            >
              <span aria-hidden="true" className="mr-1">
                {CATEGORY_CONFIG[cat]?.icon}
              </span>
              {cat}
            </button>
          ))}
        </div>

        {/* Selected Only Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all min-h-[44px] ${
              showSelectedOnly
                ? "bg-olive/20 text-olive border-olive/50"
                : "bg-white border-mist text-sage hover:bg-mist hover:text-forest"
            }`}
            aria-pressed={showSelectedOnly}
          >
            <FunnelIcon className="w-4 h-4" />
            Selected Only
            {showSelectedOnly && selectedIds.length > 0 && (
              <span className="ml-1 bg-olive text-cream text-xs font-bold px-1.5 py-0.5 rounded-full">
                {selectedIds.length}
              </span>
            )}
          </button>
          <span className="text-sm text-sage">
            {filteredCount} ingredient{filteredCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content Area with A-Z Scrubber */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Scrollable List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="flex flex-col">
            {groupedIngredients.map(([letter, items]) => (
              <div
                key={letter}
                ref={(el) => setSectionRef(letter, el)}
                className="relative"
              >
                {/* Sticky Letter Header */}
                <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm border-b border-mist px-5 py-2">
                  <span className="text-lg font-display font-bold text-terracotta">{letter}</span>
                </div>

                {/* Ingredient Rows */}
                <div className="flex flex-col">
                  {items.map((ing) => {
                    const isSelected = selectedSet.has(ing.id);
                    const config = CATEGORY_CONFIG[ing.category] || CATEGORY_CONFIG.Garnish;

                    return (
                      <button
                        key={ing.id}
                        onClick={() => handleToggle(ing.id, ing.name)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-4 px-5 py-3 min-h-[56px] w-full text-left transition-all border-b border-mist/50 ${
                          isSelected
                            ? "bg-olive/10"
                            : "bg-white hover:bg-cream"
                        }`}
                      >
                        {/* Category Icon */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.color}`}
                          aria-hidden="true"
                        >
                          {config.icon}
                        </div>

                        {/* Name and Category */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-base font-medium leading-tight ${
                              isSelected ? "text-forest font-semibold" : "text-charcoal"
                            }`}
                          >
                            {normalizeIngredientName(ing.name)}
                          </div>
                          <div className="text-sm text-sage mt-0.5">
                            {ing.category || "Other"}
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-olive border-olive"
                              : "bg-white border-stone hover:border-sage"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-cream" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Empty States */}
            {groupedIngredients.length === 0 && (
              <div className="text-center py-16 px-5">
                {showSelectedOnly && selectedIds.length === 0 ? (
                  <>
                    <p className="text-4xl mb-4" aria-hidden="true">
                      🍾
                    </p>
                    <p className="text-base text-sage">No ingredients selected yet.</p>
                    <button
                      onClick={() => setShowSelectedOnly(false)}
                      className="mt-4 text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      View all ingredients
                    </button>
                  </>
                ) : searchQuery ? (
                  <>
                    <p className="text-4xl mb-4" aria-hidden="true">
                      🔍
                    </p>
                    <p className="text-base text-sage">
                      No ingredients match &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Clear search
                    </button>
                  </>
                ) : activeFilter ? (
                  <>
                    <p className="text-4xl mb-4" aria-hidden="true">
                      {CATEGORY_CONFIG[activeFilter]?.icon || "📦"}
                    </p>
                    <p className="text-base text-sage">
                      No {activeFilter.toLowerCase()} ingredients found.
                    </p>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="mt-4 text-terracotta hover:text-terracotta-dark font-medium"
                    >
                      Show all categories
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-4" aria-hidden="true">
                      🍾
                    </p>
                    <p className="text-base text-sage">No ingredients found.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* A-Z Scrubber */}
        {groupedIngredients.length > 0 && (
          <div
            className="absolute right-0 top-0 bottom-0 w-8 flex flex-col items-center justify-center py-2 bg-white/80"
            role="navigation"
            aria-label="Alphabetical navigation"
          >
            {alphabet.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => isAvailable && handleScrollToLetter(letter)}
                  disabled={!isAvailable}
                  className={`w-6 h-5 flex items-center justify-center text-xs font-bold transition-all ${
                    isAvailable
                      ? "text-sage hover:text-terracotta hover:scale-125"
                      : "text-stone cursor-default"
                  }`}
                  aria-label={`Jump to ${letter === "#" ? "numbers" : letter}`}
                  aria-disabled={!isAvailable}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
