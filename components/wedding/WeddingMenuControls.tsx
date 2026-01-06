"use client";

import { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getCocktailsListClient } from "@/lib/cocktails";
import type { CocktailListItem } from "@/lib/cocktailTypes";
import type { WeddingMenuData, MenuTheme } from "./WeddingMenuGenerator";

interface WeddingMenuControlsProps {
  menuData: WeddingMenuData;
  onUpdate: (updates: Partial<WeddingMenuData>) => void;
}

export function WeddingMenuControls({ menuData, onUpdate }: WeddingMenuControlsProps) {
  const [hisSearch, setHisSearch] = useState("");
  const [herSearch, setHerSearch] = useState("");
  const [hisResults, setHisResults] = useState<CocktailListItem[]>([]);
  const [herResults, setHerResults] = useState<CocktailListItem[]>([]);
  const [isSearchingHis, setIsSearchingHis] = useState(false);
  const [isSearchingHer, setIsSearchingHer] = useState(false);
  const [showHisResults, setShowHisResults] = useState(false);
  const [showHerResults, setShowHerResults] = useState(false);

  // Debounced search for "His" cocktail
  useEffect(() => {
    if (!hisSearch.trim()) {
      setHisResults([]);
      setShowHisResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingHis(true);
      try {
        const results = await getCocktailsListClient({
          search: hisSearch,
          limit: 10,
        });
        setHisResults(results);
        setShowHisResults(true);
      } catch (error) {
        console.error("Error searching cocktails:", error);
        setHisResults([]);
      } finally {
        setIsSearchingHis(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [hisSearch]);

  // Debounced search for "Her" cocktail
  useEffect(() => {
    if (!herSearch.trim()) {
      setHerResults([]);
      setShowHerResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingHer(true);
      try {
        const results = await getCocktailsListClient({
          search: herSearch,
          limit: 10,
        });
        setHerResults(results);
        setShowHerResults(true);
      } catch (error) {
        console.error("Error searching cocktails:", error);
        setHerResults([]);
      } finally {
        setIsSearchingHer(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [herSearch]);

  const handleSelectHisCocktail = async (cocktail: CocktailListItem) => {
    // Fetch full cocktail data with ingredients
    try {
      const { getCocktailBySlugClient } = await import("@/lib/cocktails");
      const fullCocktail = await getCocktailBySlugClient(cocktail.slug);
      if (fullCocktail) {
        onUpdate({ hisCocktail: fullCocktail });
        setHisSearch(cocktail.name);
        setShowHisResults(false);
      }
    } catch (error) {
      console.error("Error fetching cocktail:", error);
    }
  };

  const handleSelectHerCocktail = async (cocktail: CocktailListItem) => {
    // Fetch full cocktail data with ingredients
    try {
      const { getCocktailBySlugClient } = await import("@/lib/cocktails");
      const fullCocktail = await getCocktailBySlugClient(cocktail.slug);
      if (fullCocktail) {
        onUpdate({ herCocktail: fullCocktail });
        setHerSearch(cocktail.name);
        setShowHerResults(false);
      }
    } catch (error) {
      console.error("Error fetching cocktail:", error);
    }
  };

  return (
    <div className="space-y-6 bg-white border border-mist rounded-2xl p-6">
      <h2 className="text-2xl font-display font-bold text-forest mb-4">
        Customize Your Menu
      </h2>

      {/* Couple Names */}
      <div>
        <label htmlFor="coupleNames" className="block text-sm font-medium text-forest mb-2">
          Couple's Names
        </label>
        <input
          id="coupleNames"
          type="text"
          value={menuData.coupleNames}
          onChange={(e) => onUpdate({ coupleNames: e.target.value })}
          placeholder="Jack & Jill"
          className="w-full px-4 py-2 border border-mist rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
        />
      </div>

      {/* Wedding Date */}
      <div>
        <label htmlFor="weddingDate" className="block text-sm font-medium text-forest mb-2">
          Wedding Date
        </label>
        <input
          id="weddingDate"
          type="date"
          value={menuData.weddingDate}
          onChange={(e) => onUpdate({ weddingDate: e.target.value })}
          className="w-full px-4 py-2 border border-mist rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
        />
      </div>

      {/* His Cocktail Selector */}
      <div className="relative">
        <label htmlFor="hisCocktail" className="block text-sm font-medium text-forest mb-2">
          His Choice
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-sage" />
          </div>
          <input
            id="hisCocktail"
            type="text"
            value={hisSearch}
            onChange={(e) => {
              setHisSearch(e.target.value);
              if (!e.target.value) {
                onUpdate({ hisCocktail: null });
              }
            }}
            placeholder="Search for a cocktail..."
            className="w-full pl-10 pr-10 py-2 border border-mist rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
          />
          {hisSearch && (
            <button
              onClick={() => {
                setHisSearch("");
                onUpdate({ hisCocktail: null });
                setShowHisResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-sage" />
            </button>
          )}
        </div>
        {showHisResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-mist rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearchingHis ? (
              <div className="p-4 text-center text-sage">Searching...</div>
            ) : hisResults.length === 0 ? (
              <div className="p-4 text-center text-sage">No cocktails found</div>
            ) : (
              hisResults.map((cocktail) => (
                <button
                  key={cocktail.id}
                  onClick={() => handleSelectHisCocktail(cocktail)}
                  className="w-full text-left px-4 py-2 hover:bg-mist transition-colors border-b border-mist last:border-b-0"
                >
                  <div className="font-medium text-forest">{cocktail.name}</div>
                  {cocktail.short_description && (
                    <div className="text-sm text-sage truncate">{cocktail.short_description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        {menuData.hisCocktail && (
          <div className="mt-2 px-3 py-2 bg-mist rounded-lg">
            <span className="text-sm font-medium text-forest">Selected: {menuData.hisCocktail.name}</span>
          </div>
        )}
      </div>

      {/* Her Cocktail Selector */}
      <div className="relative">
        <label htmlFor="herCocktail" className="block text-sm font-medium text-forest mb-2">
          Her Choice
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-sage" />
          </div>
          <input
            id="herCocktail"
            type="text"
            value={herSearch}
            onChange={(e) => {
              setHerSearch(e.target.value);
              if (!e.target.value) {
                onUpdate({ herCocktail: null });
              }
            }}
            placeholder="Search for a cocktail..."
            className="w-full pl-10 pr-10 py-2 border border-mist rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
          />
          {herSearch && (
            <button
              onClick={() => {
                setHerSearch("");
                onUpdate({ herCocktail: null });
                setShowHerResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-sage" />
            </button>
          )}
        </div>
        {showHerResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-mist rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearchingHer ? (
              <div className="p-4 text-center text-sage">Searching...</div>
            ) : herResults.length === 0 ? (
              <div className="p-4 text-center text-sage">No cocktails found</div>
            ) : (
              herResults.map((cocktail) => (
                <button
                  key={cocktail.id}
                  onClick={() => handleSelectHerCocktail(cocktail)}
                  className="w-full text-left px-4 py-2 hover:bg-mist transition-colors border-b border-mist last:border-b-0"
                >
                  <div className="font-medium text-forest">{cocktail.name}</div>
                  {cocktail.short_description && (
                    <div className="text-sm text-sage truncate">{cocktail.short_description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        {menuData.herCocktail && (
          <div className="mt-2 px-3 py-2 bg-mist rounded-lg">
            <span className="text-sm font-medium text-forest">Selected: {menuData.herCocktail.name}</span>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div>
        <label className="block text-sm font-medium text-forest mb-2">
          Menu Theme
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => onUpdate({ theme: "classic" })}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              menuData.theme === "classic"
                ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                : "border-mist bg-white text-sage hover:border-terracotta/50"
            }`}
          >
            Classic White
          </button>
          <button
            onClick={() => onUpdate({ theme: "chalkboard" })}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              menuData.theme === "chalkboard"
                ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                : "border-mist bg-white text-sage hover:border-terracotta/50"
            }`}
          >
            Chalkboard
          </button>
        </div>
      </div>
    </div>
  );
}

