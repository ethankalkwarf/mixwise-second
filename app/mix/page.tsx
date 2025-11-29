"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { InventoryPanel } from "@/components/InventoryPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { Ingredient, Cocktail } from "@/lib/types";
import { loadInventory, saveInventory } from "@/lib/inventoryApi";

export default function MixPage() {
  const supabase = useSupabaseClient();

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [allCocktails, setAllCocktails] = useState<Cocktail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [inventoryIds, setInventoryIds] = useState<number[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: ingData } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");
      if (ingData) setAllIngredients(ingData as Ingredient[]);

      const { data: drinkData } = await supabase
        .from("cocktails")
        .select(`
          *,
          cocktail_ingredients!inner (
            measure,
            ingredient:ingredients ( id, name )
          )
        `);

      if (drinkData) {
        const formatted: Cocktail[] = (drinkData as any[]).map((d) => ({
          id: d.id,
          name: d.name,
          instructions: d.instructions,
          category: d.category,
          image_url: d.image_url,
          glass: d.glass,
          is_popular: d.is_popular,
          ingredients: d.cocktail_ingredients.map((ci: any) => ({
            id: ci.ingredient.id,
            name: ci.ingredient.name,
            measure: ci.measure
          }))
        }));
        setAllCocktails(formatted);
      }
      setDataLoading(false);
    }
    fetchData();
  }, [supabase]);

  useEffect(() => {
    async function loadLocal() {
      const { ingredientIds } = await loadInventory(supabase);
      setInventoryIds(ingredientIds);
    }
    loadLocal();
  }, [supabase]);

  const handleInventoryChange = async (newIds: number[]) => {
    setInventoryIds(newIds);
    // if you store per-user inventories in Supabase, replace 0 with the real inventoryId
    await saveInventory(supabase, 0, newIds);
  };

  const handleAddToInventory = (id: number) => {
    if (!inventoryIds.includes(id)) {
      const next = [...inventoryIds, id];
      handleInventoryChange(next);
    }
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  if (dataLoading) {
    return (
      <div className="text-white text-center py-20 animate-pulse">
        Loading MixWise...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <InventoryPanel
            ingredients={allIngredients}
            selectedIds={inventoryIds}
            onChange={handleInventoryChange}
          />
        </div>
        <div>
          <ResultsPanel
            inventoryIds={inventoryIds}
            allCocktails={allCocktails}
            allIngredients={allIngredients}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onAddToInventory={handleAddToInventory}
          />
        </div>
      </div>
    </div>
  );
}

