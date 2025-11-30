"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import type { ShoppingListItem } from "@/lib/supabase/database.types";

const LOCAL_STORAGE_KEY = "mixwise-shopping-list";

interface LocalShoppingItem {
  ingredient_id: string;
  ingredient_name: string;
  ingredient_category?: string;
  is_checked: boolean;
  added_at: string;
}

interface UseShoppingListResult {
  items: ShoppingListItem[] | LocalShoppingItem[];
  isLoading: boolean;
  itemCount: number;
  uncheckedCount: number;
  addItem: (ingredient: { id: string; name: string; category?: string }) => Promise<void>;
  addItems: (ingredients: { id: string; name: string; category?: string }[]) => Promise<void>;
  removeItem: (ingredientId: string) => Promise<void>;
  toggleItem: (ingredientId: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  clearAll: () => Promise<void>;
  isInList: (ingredientId: string) => boolean;
  getItemsByCategory: () => Map<string, (ShoppingListItem | LocalShoppingItem)[]>;
  copyAsText: () => string;
}

/**
 * Hook to manage shopping list
 * 
 * For anonymous users: stores in localStorage
 * For authenticated users: syncs with Supabase
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 */
export function useShoppingList(): UseShoppingListResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const toast = useToast();
  const [items, setItems] = useState<ShoppingListItem[] | LocalShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  const loadFromLocal = useCallback((): LocalShoppingItem[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading shopping list from localStorage:", e);
    }
    return [];
  }, []);

  // Save to localStorage
  const saveToLocal = useCallback((items: LocalShoppingItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving shopping list to localStorage:", e);
    }
  }, []);

  // Load from server
  const loadFromServer = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    
    if (error) {
      console.error("Error loading shopping list:", error);
      return [];
    }
    
    return data || [];
  }, [user, supabase]);

  // Initialize shopping list
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        const serverData = await loadFromServer();
        setItems(serverData);
        
        // Sync any local items to server
        const localItems = loadFromLocal();
        if (localItems.length > 0) {
          const newItems = localItems.filter(
            local => !serverData.some(s => s.ingredient_id === local.ingredient_id)
          );
          
          if (newItems.length > 0) {
            const toInsert = newItems.map(item => ({
              user_id: user.id,
              ingredient_id: item.ingredient_id,
              ingredient_name: item.ingredient_name,
              ingredient_category: item.ingredient_category,
              is_checked: item.is_checked,
            }));
            
            await supabase.from("shopping_list").insert(toInsert);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            
            // Reload from server
            const updatedData = await loadFromServer();
            setItems(updatedData);
          }
        }
      } else {
        setItems(loadFromLocal());
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, [authLoading, isAuthenticated, user, loadFromServer, loadFromLocal, supabase]);

  // Add single item
  const addItem = useCallback(async (ingredient: { id: string; name: string; category?: string }) => {
    const existing = items.find(i => i.ingredient_id === ingredient.id);
    if (existing) {
      toast.info(`${ingredient.name} is already in your shopping list`);
      return;
    }
    
    if (isAuthenticated && user) {
      const { error } = await supabase.from("shopping_list").insert({
        user_id: user.id,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        ingredient_category: ingredient.category,
      });
      
      if (error) {
        toast.error("Failed to add to shopping list");
        return;
      }
      
      const serverData = await loadFromServer();
      setItems(serverData);
      toast.success(`Added ${ingredient.name} to shopping list`);
    } else {
      const newItem: LocalShoppingItem = {
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        ingredient_category: ingredient.category,
        is_checked: false,
        added_at: new Date().toISOString(),
      };
      const updated = [newItem, ...(items as LocalShoppingItem[])];
      setItems(updated);
      saveToLocal(updated);
      toast.success(`Added ${ingredient.name} to shopping list`);
    }
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast]);

  // Add multiple items
  const addItems = useCallback(async (ingredients: { id: string; name: string; category?: string }[]) => {
    const newIngredients = ingredients.filter(
      ing => !items.some(i => i.ingredient_id === ing.id)
    );
    
    if (newIngredients.length === 0) {
      toast.info("All items are already in your shopping list");
      return;
    }
    
    if (isAuthenticated && user) {
      const toInsert = newIngredients.map(ing => ({
        user_id: user.id,
        ingredient_id: ing.id,
        ingredient_name: ing.name,
        ingredient_category: ing.category,
      }));
      
      const { error } = await supabase.from("shopping_list").insert(toInsert);
      
      if (error) {
        toast.error("Failed to add items to shopping list");
        return;
      }
      
      const serverData = await loadFromServer();
      setItems(serverData);
    } else {
      const newItems: LocalShoppingItem[] = newIngredients.map(ing => ({
        ingredient_id: ing.id,
        ingredient_name: ing.name,
        ingredient_category: ing.category,
        is_checked: false,
        added_at: new Date().toISOString(),
      }));
      const updated = [...newItems, ...(items as LocalShoppingItem[])];
      setItems(updated);
      saveToLocal(updated);
    }
    
    toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast]);

  // Remove item
  const removeItem = useCallback(async (ingredientId: string) => {
    if (isAuthenticated && user) {
      await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id)
        .eq("ingredient_id", ingredientId);
      
      const serverData = await loadFromServer();
      setItems(serverData);
    } else {
      const updated = (items as LocalShoppingItem[]).filter(
        i => i.ingredient_id !== ingredientId
      );
      setItems(updated);
      saveToLocal(updated);
    }
  }, [isAuthenticated, user, supabase, loadFromServer, items, saveToLocal]);

  // Toggle item checked status
  const toggleItem = useCallback(async (ingredientId: string) => {
    if (isAuthenticated && user) {
      const item = items.find(i => i.ingredient_id === ingredientId);
      if (!item) return;
      
      await supabase
        .from("shopping_list")
        .update({ is_checked: !item.is_checked })
        .eq("user_id", user.id)
        .eq("ingredient_id", ingredientId);
      
      const serverData = await loadFromServer();
      setItems(serverData);
    } else {
      const updated = (items as LocalShoppingItem[]).map(i =>
        i.ingredient_id === ingredientId
          ? { ...i, is_checked: !i.is_checked }
          : i
      );
      setItems(updated);
      saveToLocal(updated);
    }
  }, [isAuthenticated, user, supabase, loadFromServer, items, saveToLocal]);

  // Clear checked items
  const clearChecked = useCallback(async () => {
    if (isAuthenticated && user) {
      await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id)
        .eq("is_checked", true);
      
      const serverData = await loadFromServer();
      setItems(serverData);
    } else {
      const updated = (items as LocalShoppingItem[]).filter(i => !i.is_checked);
      setItems(updated);
      saveToLocal(updated);
    }
    
    toast.info("Cleared completed items");
  }, [isAuthenticated, user, supabase, loadFromServer, items, saveToLocal, toast]);

  // Clear all items
  const clearAll = useCallback(async () => {
    if (isAuthenticated && user) {
      await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id);
      
      setItems([]);
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    toast.info("Shopping list cleared");
  }, [isAuthenticated, user, supabase, toast]);

  // Check if ingredient is in list
  const isInList = useCallback((ingredientId: string) => {
    return items.some(i => i.ingredient_id === ingredientId);
  }, [items]);

  // Group items by category
  const getItemsByCategory = useCallback(() => {
    const grouped = new Map<string, (ShoppingListItem | LocalShoppingItem)[]>();
    
    items.forEach(item => {
      const category = item.ingredient_category || "Other";
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, item]);
    });
    
    return grouped;
  }, [items]);

  // Copy as text
  const copyAsText = useCallback(() => {
    const grouped = getItemsByCategory();
    let text = "MixWise Shopping List\n\n";
    
    grouped.forEach((categoryItems, category) => {
      text += `${category}:\n`;
      categoryItems.forEach(item => {
        const check = item.is_checked ? "✓" : "○";
        text += `  ${check} ${item.ingredient_name}\n`;
      });
      text += "\n";
    });
    
    return text.trim();
  }, [getItemsByCategory]);

  const itemCount = items.length;
  const uncheckedCount = items.filter(i => !i.is_checked).length;

  return {
    items,
    isLoading,
    itemCount,
    uncheckedCount,
    addItem,
    addItems,
    removeItem,
    toggleItem,
    clearChecked,
    clearAll,
    isInList,
    getItemsByCategory,
    copyAsText,
  };
}

