"use client";

import { useMemo, useState } from "react";
import type { MixIngredient } from "@/lib/mixTypes";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

type Props = {
  ingredients: MixIngredient[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

const CATEGORY_ORDER = [
  "Spirit",
  "Liqueur",
  "Wine",
  "Mixer",
  "Beer",
  "Bitters",
  "Garnish",
  "Syrup",
  "Citrus",
  "Other"
];

const TOP_SPIRITS = [
  "Vodka",
  "Gin",
  "Tequila",
  "White Rum",
  "Bourbon",
  "Whiskey",
  "Rum",
  "Mezcal",
  "Scotch"
];

const CATEGORY_ICONS: Record<string, string> = {
  Spirit: "🥃",
  Liqueur: "🏺",
  Mixer: "🥤",
  Garnish: "🍒",
  Wine: "🍷",
  Beer: "🍺",
  Bitters: "💧",
  Other: "📦",
  Syrup: "🍯",
  Citrus: "🍋"
};

// Normalize ingredient names for consistent display
function normalizeIngredientName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function MixInventoryPanel({ ingredients, selectedIds, onChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set<string>(selectedIds), [selectedIds]);

  const handleToggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const { essentials, categorized, allCategories } = useMemo(() => {
    const essentialItems: MixIngredient[] = [];
    const byCategory = new Map<string, MixIngredient[]>();
    let filtered = ingredients;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = ingredients.filter((i) => i.name.toLowerCase().includes(q));
    }

    if (activeFilter) {
      filtered = filtered.filter((i) => i.category === activeFilter);
    }

    for (const ing of filtered) {
      if (TOP_SPIRITS.includes(ing.name) && !searchQuery && !activeFilter) {
        essentialItems.push(ing);
      }
      const key = ing.category || "Other";
      const list = byCategory.get(key) ?? [];
      list.push(ing);
      byCategory.set(key, list);
    }

    const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a[0]);
      const indexB = CATEGORY_ORDER.indexOf(b[0]);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a[0].localeCompare(b[0]);
    });

    const allCats = Array.from(
      new Set(ingredients.map((i) => i.category || "Other"))
    ).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return a.localeCompare(b);
    });

    return {
      essentials: essentialItems,
      categorized: sortedCategories,
      allCategories: allCats
    };
  }, [ingredients, searchQuery, activeFilter]);

  return (
    <section 
      className="bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col h-[calc(100vh-10rem)] overflow-hidden shadow-xl shadow-black/20"
      aria-label="Ingredient selection panel"
    >
      {/* Header */}
      <div className="p-5 space-y-4 border-b border-white/5 bg-slate-900/90 backdrop-blur z-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-3">
            <span>My Bar</span>
            <span 
              className="text-sm font-sans font-bold text-slate-900 bg-lime-400 px-2.5 py-1 rounded-full"
              aria-label={`${selectedIds.length} ingredients selected`}
            >
              {selectedIds.length}
            </span>
          </h2>
          {selectedIds.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-sm font-medium text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              aria-label="Reset all selected ingredients"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-slate-700 rounded-xl pl-11 pr-10 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all"
            aria-label="Search ingredients"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div 
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1"
          role="tablist"
          aria-label="Filter by category"
        >
          <button
            onClick={() => setActiveFilter(null)}
            role="tab"
            aria-selected={activeFilter === null}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all touch-target ${
              activeFilter === null
                ? "bg-lime-500 text-slate-900 border-lime-500"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
              role="tab"
              aria-selected={activeFilter === cat}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all touch-target ${
                activeFilter === cat
                  ? "bg-lime-500 text-slate-900 border-lime-500"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              <span aria-hidden="true">{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
        {/* Essentials Grid */}
        {!searchQuery && !activeFilter && essentials.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Essentials
            </h3>
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Essential spirits">
              {essentials.map((ing) => {
                const isSelected = selectedSet.has(ing.id);
                return (
                  <button
                    key={ing.id}
                    onClick={() => handleToggle(ing.id)}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 touch-target ${
                      isSelected
                        ? "bg-lime-500/15 border-lime-500/50 text-lime-100 shadow-[0_0_15px_-3px_rgba(132,204,22,0.3)] ring-2 ring-lime-500/30"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {ing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={ing.imageUrl} 
                        alt=""
                        className="w-12 h-12 object-contain mb-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="text-3xl mb-2" aria-hidden="true">🥃</span>
                    )}
                    <span className="text-xs font-semibold leading-tight">
                      {normalizeIngredientName(ing.name)}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-lime-400 rounded-full shadow-lg shadow-lime-400/50" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Accordions */}
        <div className="space-y-3" role="list">
          {categorized.map(([category, list]) => {
            const isSearching = searchQuery.length > 0 || activeFilter !== null;
            const hasSelection = list.some((i) => selectedSet.has(i.id));
            const selectedCount = list.filter((i) => selectedSet.has(i.id)).length;

            return (
              <Disclosure key={category} defaultOpen={isSearching || hasSelection}>
                {({ open }) => (
                  <div
                    className={`rounded-xl border transition-all duration-300 ${
                      open
                        ? "bg-slate-900/60 border-slate-700"
                        : "bg-transparent border-slate-800/50"
                    }`}
                    role="listitem"
                  >
                    <Disclosure.Button 
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors group focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                      aria-expanded={open}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl opacity-80" aria-hidden="true">
                          {CATEGORY_ICONS[category] || "📦"}
                        </span>
                        <span
                          className={`text-base font-medium ${
                            hasSelection
                              ? "text-lime-400"
                              : "text-slate-300 group-hover:text-white"
                          }`}
                        >
                          {category}
                        </span>
                        {selectedCount > 0 && (
                          <span className="bg-lime-500/15 text-lime-400 text-xs px-2 py-0.5 rounded-full font-bold">
                            {selectedCount}
                          </span>
                        )}
                      </div>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-slate-500 transition-transform duration-200`}
                        aria-hidden="true"
                      />
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-3 pb-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group">
                          {list.map((ing) => {
                            // Skip essentials in category view
                            if (!searchQuery && !activeFilter && TOP_SPIRITS.includes(ing.name)) {
                              return null;
                            }
                            const isSelected = selectedSet.has(ing.id);
                            return (
                              <button
                                key={ing.id}
                                onClick={() => handleToggle(ing.id)}
                                aria-pressed={isSelected}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left border touch-target ${
                                  isSelected
                                    ? "bg-lime-500/15 border-lime-500/30 text-lime-100 ring-1 ring-lime-500/20"
                                    : "bg-slate-950/40 border-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-700"
                                }`}
                              >
                                <span className="flex items-center gap-3 truncate pr-2">
                                  {ing.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={ing.imageUrl} 
                                      alt=""
                                      className="w-6 h-6 object-contain flex-shrink-0"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                  <span className="truncate">{normalizeIngredientName(ing.name)}</span>
                                </span>
                                {isSelected && <span className="text-lime-400 text-lg" aria-hidden="true">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            );
          })}
        </div>

        {/* Empty state */}
        {ingredients.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-5xl mb-4" aria-hidden="true">🍾</p>
            <p className="text-base">No ingredients found.</p>
            <p className="text-sm mt-2 text-slate-600">Add some in Sanity Studio!</p>
          </div>
        )}

        {/* No search results */}
        {ingredients.length > 0 && categorized.length === 0 && searchQuery && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
            <p className="text-base">No ingredients match &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={handleClearSearch}
              className="mt-4 text-lime-400 hover:text-lime-300 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
