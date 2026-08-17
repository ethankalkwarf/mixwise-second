"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  loadCocktailSearchIndex,
  searchOmnibarClient,
} from "@/lib/search/loadCocktailSearchIndex.client";
import type { OmnibarResult } from "@/lib/search";

type CocktailSearchProps = {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

type FlatResult =
  | { kind: "header"; label: string }
  | { kind: "chip"; href: string; label: string }
  | { kind: "cocktail"; href: string; id: string; title: string; subtitle?: string; imageUrl?: string }
  | { kind: "ingredient"; href: string; id: string; title: string; subtitle?: string }
  | { kind: "learn"; href: string; id: string; title: string; subtitle?: string; learnKind: string };

function flattenOmnibar(result: OmnibarResult): FlatResult[] {
  const rows: FlatResult[] = [];

  if (result.intent.chipLabel && result.intent.chipHref) {
    rows.push({
      kind: "chip",
      href: result.intent.chipHref,
      label: result.intent.chipLabel,
    });
  }

  const preferLearn = result.intent.preferLearn;
  const sections: Array<"learn" | "cocktails" | "ingredients"> = preferLearn
    ? ["learn", "cocktails", "ingredients"]
    : ["cocktails", "ingredients", "learn"];

  for (const section of sections) {
    if (section === "cocktails" && result.cocktails.length > 0) {
      rows.push({ kind: "header", label: "Cocktails" });
      for (const cocktail of result.cocktails) {
        rows.push({
          kind: "cocktail",
          id: cocktail.id,
          href: `/cocktails/${cocktail.slug}`,
          title: cocktail.name,
          subtitle: cocktail.short_description,
          imageUrl: cocktail.image_url,
        });
      }
    } else if (section === "ingredients" && result.ingredients.length > 0) {
      rows.push({ kind: "header", label: "Ingredients" });
      for (const ingredient of result.ingredients) {
        rows.push({
          kind: "ingredient",
          id: ingredient.id,
          href: ingredient.href,
          title: ingredient.name,
          subtitle: ingredient.summary,
        });
      }
    } else if (section === "learn" && result.learn.length > 0) {
      rows.push({ kind: "header", label: "Learn" });
      for (const item of result.learn) {
        rows.push({
          kind: "learn",
          id: `${item.kind}:${item.id}`,
          href: item.href,
          title: item.title,
          subtitle: item.summary,
          learnKind: item.kind,
        });
      }
    }
  }

  return rows;
}

function selectableResults(rows: FlatResult[]): FlatResult[] {
  return rows.filter((row) => row.kind !== "header");
}

export function CocktailSearch({ variant = "desktop", onClose }: CocktailSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [omnibar, setOmnibar] = useState<OmnibarResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatResults = useMemo(
    () => (omnibar ? flattenOmnibar(omnibar) : []),
    [omnibar]
  );
  const selectable = useMemo(() => selectableResults(flatResults), [flatResults]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setOmnibar(null);
      setShowResults(false);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchOmnibarClient(searchQuery);
        setOmnibar(searchResults);
        setShowResults(true);
        setHasSearched(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching catalog:", error);
        setOmnibar(null);
        setShowResults(true);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (variant !== "desktop" || !inputRef.current) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [variant]);

  const navigateTo = (href: string) => {
    window.location.assign(href);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || selectable.length === 0) {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < selectable.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < selectable.length) {
          const row = selectable[selectedIndex];
          if (row.kind !== "header") navigateTo(row.href);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowResults(false);
        onClose?.();
        break;
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setOmnibar(null);
    setShowResults(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const inputClassName =
    variant === "desktop"
      ? "w-full pl-10 pr-10 py-2.5 text-sm border border-mist rounded-xl bg-white text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent focus:scale-[1.02] transition-all duration-200 shadow-lg shadow-terracotta/10"
      : "w-full pl-10 pr-10 py-2.5 text-sm border border-mist rounded-xl bg-white text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent focus:scale-[1.02] transition-all duration-200";

  const selectedHref =
    selectedIndex >= 0 && selectedIndex < selectable.length && selectable[selectedIndex].kind !== "header"
      ? selectable[selectedIndex].href
      : null;

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            void loadCocktailSearchIndex();
            if (flatResults.length > 0 || hasSearched) {
              setShowResults(true);
            }
          }}
          placeholder={
            variant === "desktop"
              ? "Search cocktails, ingredients, learn…"
              : "Search MixWise…"
          }
          className={inputClassName}
          aria-label="Search MixWise"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sage hover:text-forest active:scale-90 transition-all duration-200 rounded-full hover:bg-mist/50"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && flatResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mist rounded-xl shadow-card overflow-hidden z-[60] max-h-[min(28rem,55svh)] overflow-y-auto animate-fade-in">
          <ul role="listbox" className="py-2">
            {flatResults.map((row) => {
              if (row.kind === "header") {
                return (
                  <li key={`header-${row.label}`}>
                    <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sage">
                      {row.label}
                    </div>
                  </li>
                );
              }

              const isSelected = selectedHref === row.href;
              return (
                <li key={`${row.kind}-${"id" in row ? row.id : row.label}`}>
                  <div
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => navigateTo(row.href)}
                    onMouseEnter={() => {
                      const idx = selectable.findIndex(
                        (item) => item.kind !== "header" && item.href === row.href
                      );
                      if (idx >= 0) setSelectedIndex(idx);
                    }}
                    className={`px-4 py-2.5 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-terracotta/10 text-terracotta"
                        : "text-charcoal hover:bg-mist/50"
                    }`}
                  >
                    {row.kind === "chip" ? (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="inline-flex rounded-full bg-forest/10 px-2.5 py-1 text-forest">
                          {row.label}
                        </span>
                        <span className="text-xs text-sage">Browse all</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {row.kind === "cocktail" && row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-mist/80 flex items-center justify-center text-xs font-medium text-sage shrink-0">
                            {row.kind === "ingredient"
                              ? "In"
                              : row.kind === "learn"
                                ? "Ln"
                                : "Ck"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{row.title}</div>
                          {row.subtitle && (
                            <div className="text-xs text-sage truncate mt-0.5">{row.subtitle}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showResults && hasSearched && !isSearching && selectable.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mist rounded-xl shadow-card p-4 text-center text-sage text-sm z-[60]">
          Nothing matches “{searchQuery.trim()}”
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mist rounded-xl shadow-card p-4 text-center text-sage text-sm z-[60]">
          Searching...
        </div>
      )}
    </div>
  );
}
