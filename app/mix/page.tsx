"use client";

import { useEffect, useState } from "react";
import { MixInventoryPanel } from "@/components/mix/MixInventoryPanel";
import { MixResultsPanel } from "@/components/mix/MixResultsPanel";
import { fetchMixData } from "@/lib/sanityMixData";
import type { MixIngredient, MixCocktail } from "@/lib/mixTypes";

const STORAGE_KEY = "mixwise-bar-inventory";

export default function MixPage() {
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<MixCocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);

  // Load data from Sanity
  useEffect(() => {
    async function loadData() {
      try {
        const { ingredients, cocktails } = await fetchMixData();
        setAllIngredients(ingredients);
        setAllCocktails(cocktails);
      } catch (error) {
        console.error("Failed to load data from Sanity:", error);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
