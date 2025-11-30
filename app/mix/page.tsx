"use client";

import { useEffect, useState, useMemo } from "react";
import { MixInventoryPanel } from "@/components/mix/MixInventoryPanel";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { fetchMixData } from "@/lib/sanityMixData";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";

const STORAGE_KEY = "mixwise-bar-inventory";
const DEBUG_MODE = true; // Set to true to show debug panel

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load data from Sanity
  useEffect(() => {
    async function loadData() {
      try {
        console.log("[Mix] Fetching data from Sanity...");
        const { ingredients, cocktails } = await fetchMixData();
        console.log("[Mix] Loaded:", ingredients.length, "ingredients,", cocktails.length, "cocktails");
        
        // Debug: Check a sample cocktail's ingredients
        const sampleCocktail = cocktails.find(c => c.ingredients.length > 0);
        if (sampleCocktail) {
          console.log("[Mix] Sample cocktail:", sampleCocktail.name, 
            "ingredients:", sampleCocktail.ingredients.map(i => `${i.name}(${i.id})`));
        }
        
        setAllIngredients(ingredients);
        setAllCocktails(cocktails);
      } catch (error) {
        console.error("Failed to load data from Sanity:", error);
        setDataError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  // Load inventory from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInventoryIds(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load inventory from localStorage:", error);
    }
  }, []);

  // Save inventory to localStorage
  const handleInventoryChange = (newIds: string[]) => {
    setInventoryIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch (error) {
      console.error("Failed to save inventory to localStorage:", error);
    }
  };

  const handleAddToInventory = (id: string) => {
    if (!inventoryIds.includes(id)) {
      handleInventoryChange([...inventoryIds, id]);
    }
  };

  // Debug: Calculate match stats
  const debugStats = useMemo(() => {
    if (!DEBUG_MODE) return null;
    const stapleIds = allIngredients.filter(i => i.isStaple).map(i => i.id);
    const result = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: inventoryIds,
      stapleIngredientIds: stapleIds
    });
    return {
      totalCocktails: allCocktails.length,
      totalIngredients: allIngredients.length,
      selectedCount: inventoryIds.length,
      makeNow: result.makeNow.length,
      almostThere: result.almostThere.length,
      sampleIds: inventoryIds.slice(0, 3),
      sampleMakeNow: result.makeNow.slice(0, 3).map(m => m.cocktail.name)
    };
  }, [allCocktails, allIngredients, inventoryIds]);

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍸</div>
          <p className="text-slate-400 animate-pulse">Loading MixWise...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400">Error loading data: {dataError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Debug Panel */}
      {DEBUG_MODE && debugStats && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
          <div className="font-bold text-lime-400 mb-2">🔧 Debug Panel</div>
          <div>Cocktails: {debugStats.totalCocktails} | Ingredients: {debugStats.totalIngredients}</div>
          <div>Selected: {debugStats.selectedCount} → {debugStats.sampleIds.join(", ") || "none"}</div>
          <div className="text-lime-400">Make Now: {debugStats.makeNow} | Almost: {debugStats.almostThere}</div>
          {debugStats.sampleMakeNow.length > 0 && (
            <div>Can make: {debugStats.sampleMakeNow.join(", ")}</div>
          )}
        </div>
      )}
      
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <MixInventoryPanel
            ingredients={allIngredients}
            selectedIds={inventoryIds}
            onChange={handleInventoryChange}
          />
        </div>
        <div>
          <MixResultsPanel
            inventoryIds={inventoryIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            onAddToInventory={handleAddToInventory}
          />
        </div>
      </div>
    </div>
  );
}
