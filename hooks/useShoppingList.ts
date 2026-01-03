"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";

/**
 * Shopping List Hook - Simplified version
 * 
 * For authenticated users: Always uses server API
 * For anonymous users: Uses localStorage
 */

const LOCAL_STORAGE_KEY = "mixwise-shopping-list";

interface ShoppingItem {
  id?: number;
  user_id?: string;
  ingredient_id: string;
  ingredient_name: string;
  ingredient_category?: string | null;
  is_checked: boolean;
  added_at?: string;
}

// Helper to check if ingredient is ice
const isIce = (name: string) => {
  const n = name.toLowerCase().trim();
  return n === 'ice' || n === 'ice cubes' || n === 'crushed ice' || n === 'ice cube';
};

export function useShoppingList() {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const toast = useToast();
  
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch items from server
  const fetchFromServer = useCallback(async (): Promise<ShoppingItem[]> => {
    try {
      console.log("[ShoppingList] Fetching from server...");
      const response = await fetch("/api/shopping-list", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      console.log("[ShoppingList] Fetch response status:", response.status);
      const data = await response.json();
      console.log("[ShoppingList] Fetched data:", data);
      return data.items || [];
    } catch (err) {
      console.error("[ShoppingList] Fetch error:", err);
      return [];
    }
  }, []);

  // Load items on mount and auth change
  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        console.log("[ShoppingList] Loading for authenticated user");
        const serverItems = await fetchFromServer();
        setItems(serverItems);
      } else {
        console.log("[ShoppingList] Loading from localStorage");
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          setItems(stored ? JSON.parse(stored) : []);
        } catch {
          setItems([]);
        }
      }
      
      setIsLoading(false);
    };

    load();
  }, [authLoading, isAuthenticated, user?.id, fetchFromServer]);

  // Add single item
  const addItem = useCallback(async (ingredient: { id: string; name: string; category?: string }) => {
    if (isIce(ingredient.name)) return;
    
    const ingredientId = String(ingredient.id);
    
    if (items.some(i => String(i.ingredient_id) === ingredientId)) {
      toast.info(`${ingredient.name} is already in your shopping list`);
      return;
    }

    if (isAuthenticated && user) {
      try {
        console.log("[ShoppingList] Adding item:", ingredient);
        const response = await fetch("/api/shopping-list", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredient_id: ingredientId,
            ingredient_name: ingredient.name,
            ingredient_category: ingredient.category || null,
          }),
        });
        
        const result = await response.json();
        console.log("[ShoppingList] Add response:", result);
        
        if (response.ok) {
          const serverItems = await fetchFromServer();
          setItems(serverItems);
          toast.success(`Added ${ingredient.name} to shopping list`);
        } else {
          toast.error(`Failed to add: ${result.error}`);
        }
      } catch (err: any) {
        console.error("[ShoppingList] Add error:", err);
        toast.error("Failed to add item");
      }
    } else {
      const newItem: ShoppingItem = {
        ingredient_id: ingredientId,
        ingredient_name: ingredient.name,
        ingredient_category: ingredient.category,
        is_checked: false,
        added_at: new Date().toISOString(),
      };
      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      toast.success(`Added ${ingredient.name} to shopping list`);
    }
  }, [items, isAuthenticated, user, fetchFromServer, toast]);

  // Add multiple items
  const addItems = useCallback(async (ingredients: { id: string; name: string; category?: string }[]) => {
    const filtered = ingredients.filter(ing => 
      !isIce(ing.name) && !items.some(i => String(i.ingredient_id) === String(ing.id))
    );
    
    if (filtered.length === 0) {
      toast.info("All items are already in your shopping list");
      return;
    }

    if (isAuthenticated && user) {
      try {
        console.log("[ShoppingList] Adding items:", filtered);
        const response = await fetch("/api/shopping-list", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filtered.map(ing => ({
            ingredient_id: String(ing.id),
            ingredient_name: ing.name,
            ingredient_category: ing.category || null,
          }))),
        });
        
        const result = await response.json();
        console.log("[ShoppingList] Add items response:", result);
        
        if (response.ok) {
          const serverItems = await fetchFromServer();
          setItems(serverItems);
          toast.success(`Added ${filtered.length} item${filtered.length > 1 ? 's' : ''} to shopping list`);
        } else {
          toast.error(`Failed to add: ${result.error}`);
        }
      } catch (err: any) {
        console.error("[ShoppingList] Add items error:", err);
        toast.error("Failed to add items");
      }
    } else {
      const newItems: ShoppingItem[] = filtered.map(ing => ({
        ingredient_id: String(ing.id),
        ingredient_name: ing.name,
        ingredient_category: ing.category,
        is_checked: false,
        added_at: new Date().toISOString(),
      }));
      const updated = [...newItems, ...items];
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      toast.success(`Added ${filtered.length} item${filtered.length > 1 ? 's' : ''} to shopping list`);
    }
  }, [items, isAuthenticated, user, fetchFromServer, toast]);

  // Remove item
  const removeItem = useCallback(async (ingredientId: string) => {
    const id = String(ingredientId);
    console.log("[ShoppingList] ===== REMOVE START =====");
    console.log("[ShoppingList] Removing item:", id);
    console.log("[ShoppingList] isAuthenticated:", isAuthenticated);
    console.log("[ShoppingList] user:", user?.id);
    
    if (isAuthenticated && user) {
      try {
        const url = `/api/shopping-list?ingredient_id=${encodeURIComponent(id)}`;
        console.log("[ShoppingList] DELETE URL:", url);
        
        const response = await fetch(url, {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        });
        
        console.log("[ShoppingList] DELETE response status:", response.status);
        const result = await response.json();
        console.log("[ShoppingList] DELETE response body:", result);
        
        // Always refresh from server
        console.log("[ShoppingList] Refreshing items from server...");
        const serverItems = await fetchFromServer();
        console.log("[ShoppingList] After refresh, items:", serverItems.length);
        setItems(serverItems);
        console.log("[ShoppingList] ===== REMOVE END =====");
      } catch (err) {
        console.error("[ShoppingList] Remove error:", err);
      }
    } else {
      const updated = items.filter(i => String(i.ingredient_id) !== id);
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [items, isAuthenticated, user, fetchFromServer]);

  // Toggle item checked
  const toggleItem = useCallback(async (ingredientId: string) => {
    const id = String(ingredientId);
    console.log("[ShoppingList] ===== TOGGLE START =====");
    console.log("[ShoppingList] Toggling item:", id);
    
    const item = items.find(i => String(i.ingredient_id) === id);
    if (!item) {
      console.log("[ShoppingList] Item not found in state");
      return;
    }
    
    console.log("[ShoppingList] Current is_checked:", item.is_checked, "-> new:", !item.is_checked);
    
    if (isAuthenticated && user) {
      try {
        const response = await fetch("/api/shopping-list", {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredient_id: id, is_checked: !item.is_checked }),
        });
        
        console.log("[ShoppingList] PATCH response status:", response.status);
        const result = await response.json();
        console.log("[ShoppingList] PATCH response body:", result);
        
        const serverItems = await fetchFromServer();
        setItems(serverItems);
        console.log("[ShoppingList] ===== TOGGLE END =====");
      } catch (err) {
        console.error("[ShoppingList] Toggle error:", err);
      }
    } else {
      const updated = items.map(i => 
        String(i.ingredient_id) === id ? { ...i, is_checked: !i.is_checked } : i
      );
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [items, isAuthenticated, user, fetchFromServer]);

  // Clear checked items
  const clearChecked = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await fetch("/api/shopping-list?clear_checked=true", {
          method: "DELETE",
          credentials: "include",
        });
        const serverItems = await fetchFromServer();
        setItems(serverItems);
      } catch (err) {
        console.error("[ShoppingList] Clear checked error:", err);
      }
    } else {
      const updated = items.filter(i => !i.is_checked);
      setItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    toast.info("Cleared completed items");
  }, [items, isAuthenticated, user, fetchFromServer, toast]);

  // Clear all items
  const clearAll = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await fetch("/api/shopping-list?clear_all=true", {
          method: "DELETE",
          credentials: "include",
        });
        setItems([]);
      } catch (err) {
        console.error("[ShoppingList] Clear all error:", err);
      }
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    toast.info("Shopping list cleared");
  }, [isAuthenticated, user, toast]);

  // Check if item is in list
  const isInList = useCallback((ingredientId: string) => {
    return items.some(i => String(i.ingredient_id) === String(ingredientId));
  }, [items]);

  // Group items by category
  const getItemsByCategory = useCallback(() => {
    const grouped = new Map<string, ShoppingItem[]>();
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

  return {
    items,
    isLoading,
    itemCount: items.length,
    uncheckedCount: items.filter(i => !i.is_checked).length,
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
