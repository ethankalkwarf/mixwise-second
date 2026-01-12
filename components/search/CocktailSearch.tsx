"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getCocktailsListClient } from "@/lib/cocktails";
import type { CocktailListItem } from "@/lib/cocktailTypes";

type CocktailSearchProps = {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

export function CocktailSearch({ variant = "desktop", onClose }: CocktailSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CocktailListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await getCocktailsListClient({
          search: searchQuery,
          limit: 10,
        });
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching cocktails:", error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Auto-focus input for desktop variant
  useEffect(() => {
    if (variant === "desktop" && inputRef.current) {
      // Small delay to ensure transition completes
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [variant]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowResults(false);
        if (onClose) {
          onClose();
        }
        break;
    }
  };

  const handleResultClick = (cocktail: CocktailListItem) => {
    router.push(`/cocktails/${cocktail.slug}`);
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const inputClassName =
    variant === "desktop"
      ? "w-full pl-10 pr-10 py-2.5 text-sm border border-mist rounded-xl bg-white text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
      : "w-full pl-10 pr-10 py-2.5 text-sm border border-mist rounded-xl bg-white text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent";

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
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={variant === "desktop" ? "Search cocktails..." : "Search..."}
          className={inputClassName}
          aria-label="Search cocktails"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sage hover:text-forest transition-colors"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mist rounded-xl shadow-card overflow-hidden z-[60] max-h-96 overflow-y-auto">
          <ul role="listbox" className="py-2">
            {results.map((cocktail, index) => (
              <li
                key={cocktail.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleResultClick(cocktail)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-charcoal hover:bg-mist/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {cocktail.image_url && (
                    <img
                      src={cocktail.image_url}
                      alt={cocktail.image_alt || cocktail.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{cocktail.name}</div>
                    {cocktail.short_description && (
                      <div className="text-xs text-sage truncate mt-0.5">
                        {cocktail.short_description}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-mist rounded-xl shadow-card p-4 text-center text-sage text-sm">
          Searching...
        </div>
      )}
    </div>
  );
}
