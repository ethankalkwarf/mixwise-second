"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";

const LOCAL_STORAGE_KEY = "mixwise-shopping-list";

// Define our own types - don't import from database.types to avoid schema cache issues
interface ShoppingListItem {
  id: number;
  user_id: string;
  ingredient_id: string;
  ingredient_name: string;
  ingredient_category: string | null;
  is_checked: boolean;
  added_at: string;
}

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
 * For authenticated users: syncs with Supabase via API route
 * 
 * CRITICAL: Uses /api/shopping-list route with service role key
 * to bypass ALL schema cache issues
 */
export function useShoppingList(): UseShoppingListResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  
  const [items, setItems] = useState<ShoppingListItem[] | LocalShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track the last fetched user ID to prevent duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);
  const hasPromptedSignup = useRef(false);

  const promptSignupToSave = useCallback(() => {
    if (hasPromptedSignup.current) return;
    hasPromptedSignup.current = true;

    try {
      if (typeof window !== "undefined") {
        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem("mixwise-auth-return-to", returnTo);
      }
    } catch {
      // ignore storage failures
    }

    openAuthDialog({
      mode: "signup",
      title: "Save your shopping list",
      subtitle: "Create a free account to sync your shopping list across devices and never lose it.",
    });
  }, [openAuthDialog]);

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

  // Load from server via API route (bypasses schema cache)
  const loadFromServer = useCallback(async (userId: string): Promise<ShoppingListItem[]> => {
    try {
      const response = await fetch("/api/shopping-list", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[ShoppingList] Error loading from server:", error);
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (err) {
      console.error("[ShoppingList] Exception loading from server:", err);
      return [];
    }
  }, []);

  // Initialize shopping list - only fetch when user ID changes
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      
      const currentUserId = isAuthenticated && user ? user.id : null;
      
      // Skip if we've already initialized for this user
      if (lastFetchedUserId.current === currentUserId && !isFetching.current) {
        setIsLoading(false);
        return;
      }
      
      // Prevent duplicate fetches
      if (isFetching.current) return;
      isFetching.current = true;
      
      setIsLoading(true);
      
      try {
        if (isAuthenticated && user) {
          const serverData = await loadFromServer(user.id);
          setItems(serverData);
          
          // Sync any local items to server
          const localItems = loadFromLocal();
          if (localItems.length > 0) {
            const newItems = localItems.filter(
              local => !serverData.some(s => s.ingredient_id === local.ingredient_id)
            );
            
            if (newItems.length > 0) {
              const toInsert = newItems.map(item => ({
                ingredient_id: item.ingredient_id,
                ingredient_name: item.ingredient_name,
                ingredient_category: item.ingredient_category || null,
                is_checked: item.is_checked,
              }));
              
              try {
                const response = await fetch("/api/shopping-list", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(toInsert),
                });
                
                if (response.ok) {
                  localStorage.removeItem(LOCAL_STORAGE_KEY);
                  const updatedData = await loadFromServer(user.id);
                  setItems(updatedData);
                }
              } catch (syncError) {
                console.error("[ShoppingList] Error syncing local items:", syncError);
              }
            }
          }
          
          lastFetchedUserId.current = user.id;
        } else {
          setItems(loadFromLocal());
          lastFetchedUserId.current = null;
        }
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };
    
    initialize();
  }, [authLoading, isAuthenticated, user?.id, loadFromServer, loadFromLocal]);

  // Helper to check if ingredient is ice (everyone has ice!)
  const isIce = (name: string) => {
    const normalized = name.toLowerCase().trim();
    return normalized === 'ice' || 
           normalized === 'ice cubes' || 
           normalized === 'crushed ice' ||
           normalized === 'ice cube';
  };

  // Add single item
  const addItem = useCallback(async (ingredient: { id: string; name: string; category?: string }) => {
    // Skip ice - everyone has ice!
    if (isIce(ingredient.name)) {
      return;
    }
    
    const existing = items.find(i => i.ingredient_id === ingredient.id);
    if (existing) {
      toast.info(`${ingredient.name} is already in your shopping list`);
      return;
    }
    
    if (isAuthenticated && user) {
      try {
        const response = await fetch("/api/shopping-list", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            ingredient_category: ingredient.category || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("[ShoppingList] Error adding item:", error);
          toast.error(`Failed to add to shopping list: ${error.error || "Unknown error"}`);
          return;
        }

        const serverData = await loadFromServer(user.id);
        setItems(serverData);
        toast.success(`Added ${ingredient.name} to shopping list`);
      } catch (error: any) {
        console.error("[ShoppingList] Exception adding item:", error);
        toast.error(`Failed to add to shopping list: ${error.message || "Unknown error"}`);
      }
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
      promptSignupToSave();
    }
  }, [items, isAuthenticated, user, loadFromServer, saveToLocal, toast, promptSignupToSave]);

  // Add multiple items
  const addItems = useCallback(async (ingredients: { id: string; name: string; category?: string }[]) => {
    // Filter out ice and already-added items
    const newIngredients = ingredients.filter(
      ing => !isIce(ing.name) && !items.some(i => i.ingredient_id === ing.id)
    );
    
    if (newIngredients.length === 0) {
      toast.info("All items are already in your shopping list");
      return;
    }
    
    if (isAuthenticated && user) {
      try {
        const toInsert = newIngredients.map(ing => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          ingredient_category: ing.category || null,
        }));

        const response = await fetch("/api/shopping-list", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toInsert),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("[ShoppingList] Error adding items:", error);
          toast.error(`Failed to add items: ${error.error || "Unknown error"}`);
          return;
        }

        const serverData = await loadFromServer(user.id);
        setItems(serverData);
        toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
      } catch (error: any) {
        console.error("[ShoppingList] Exception adding items:", error);
        toast.error(`Failed to add items: ${error.message || "Unknown error"}`);
      }
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
      toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
      promptSignupToSave();
    }
  }, [items, isAuthenticated, user, loadFromServer, saveToLocal, toast, promptSignupToSave]);

  // Remove item
  const removeItem = useCallback(async (ingredientId: string) => {
    console.log("[ShoppingList] Removing item:", ingredientId);
    console.log("[ShoppingList] Current items before delete:", items.map(i => ({ id: i.ingredient_id, name: i.ingredient_name })));
    
    if (isAuthenticated && user) {
      try {
        const response = await fetch(`/api/shopping-list?ingredient_id=${encodeURIComponent(ingredientId)}`, {
          method: "DELETE",
          credentials: "include",
        });

        const responseData = await response.json();
        console.log("[ShoppingList] Delete response:", responseData);

        if (!response.ok) {
          console.error("[ShoppingList] Error removing item:", responseData);
          toast.error(`Failed to remove item: ${responseData.error || "Unknown error"}`);
          return;
        }

        console.log("[ShoppingList] Item removed successfully, refreshing list");
        const serverData = await loadFromServer(user.id);
        console.log("[ShoppingList] Server data after refresh:", serverData.map((i: any) => ({ id: i.ingredient_id, name: i.ingredient_name })));
        setItems(serverData);
      } catch (err) {
        console.error("[ShoppingList] Exception removing item:", err);
        toast.error("Failed to remove item");
      }
    } else {
      const updated = (items as LocalShoppingItem[]).filter(
        i => i.ingredient_id !== ingredientId
      );
      setItems(updated);
      saveToLocal(updated);
    }
  }, [isAuthenticated, user, loadFromServer, items, saveToLocal, toast]);

  // Toggle item checked status
  const toggleItem = useCallback(async (ingredientId: string) => {
    if (isAuthenticated && user) {
      const item = items.find(i => i.ingredient_id === ingredientId);
      if (!item) return;
      
      try {
        const response = await fetch("/api/shopping-list", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredient_id: ingredientId,
            is_checked: !item.is_checked,
          }),
        });

        if (!response.ok) {
          console.error("[ShoppingList] Error toggling item:", await response.json());
        }

        const serverData = await loadFromServer(user.id);
        setItems(serverData);
      } catch (err) {
        console.error("[ShoppingList] Exception toggling item:", err);
      }
    } else {
      const updated = (items as LocalShoppingItem[]).map(i =>
        i.ingredient_id === ingredientId
          ? { ...i, is_checked: !i.is_checked }
          : i
      );
      setItems(updated);
      saveToLocal(updated);
    }
  }, [isAuthenticated, user, loadFromServer, items, saveToLocal]);

  // Clear checked items
  const clearChecked = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const response = await fetch("/api/shopping-list?clear_checked=true", {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          console.error("[ShoppingList] Error clearing checked:", await response.json());
        }

        const serverData = await loadFromServer(user.id);
        setItems(serverData);
      } catch (err) {
        console.error("[ShoppingList] Exception clearing checked:", err);
      }
    } else {
      const updated = (items as LocalShoppingItem[]).filter(i => !i.is_checked);
      setItems(updated);
      saveToLocal(updated);
    }
    
    toast.info("Cleared completed items");
  }, [isAuthenticated, user, loadFromServer, items, saveToLocal, toast]);

  // Clear all items
  const clearAll = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const response = await fetch("/api/shopping-list?clear_all=true", {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          console.error("[ShoppingList] Error clearing all:", await response.json());
        }

        setItems([]);
      } catch (err) {
        console.error("[ShoppingList] Exception clearing all:", err);
      }
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    toast.info("Shopping list cleared");
  }, [isAuthenticated, user, toast]);

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
