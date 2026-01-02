"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
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
 * 
 * CRITICAL FIX: Uses refs to prevent duplicate fetches on auth state updates
 */
export function useShoppingList(): UseShoppingListResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
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

    // Remember where the user was, so after OAuth callback we can send them back.
    // This is especially important for Google OAuth which always returns to /auth/callback.
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

  // Load from server
  const loadFromServer = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    
    if (error) {
      console.error("Error loading shopping list:", error);
      return [];
    }
    
    return data || [];
  }, [supabase]);

  // Initialize shopping list - only fetch when user ID changes
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      
      // Determine current user ID (null if not authenticated)
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
              const toInsert = newItems.map(item => {
                const insertItem: {
                  user_id: string;
                  ingredient_id: string;
                  ingredient_name: string;
                  ingredient_category?: string;
                  is_checked: boolean;
                } = {
                  user_id: user.id,
                  ingredient_id: item.ingredient_id,
                  ingredient_name: item.ingredient_name,
                  is_checked: item.is_checked,
                };
                
                // Only include category if it's provided
                if (item.ingredient_category) {
                  insertItem.ingredient_category = item.ingredient_category;
                }
                
                return insertItem;
              });
              
              await supabase.from("shopping_list").insert(toInsert);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              
              // Reload from server
              const updatedData = await loadFromServer(user.id);
              setItems(updatedData);
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
  }, [authLoading, isAuthenticated, user?.id, loadFromServer, loadFromLocal, supabase]);

  // Add single item
  const addItem = useCallback(async (ingredient: { id: string; name: string; category?: string }) => {
    const existing = items.find(i => i.ingredient_id === ingredient.id);
    if (existing) {
      toast.info(`${ingredient.name} is already in your shopping list`);
      return;
    }
    
    if (isAuthenticated && user) {
      const insertData: {
        user_id: string;
        ingredient_id: string;
        ingredient_name: string;
        ingredient_category?: string;
      } = {
        user_id: user.id,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
      };
      
      // Only include category if it's provided
      if (ingredient.category) {
        insertData.ingredient_category = ingredient.category;
      }
      
      // Try inserting with all fields first
      let { error } = await supabase.from("shopping_list").insert(insertData);
      
      // If schema cache error, try without category
      if (error && (error.message?.includes('ingredient_name') || error.message?.includes('schema cache') || error.message?.includes('column'))) {
        console.warn("Schema cache issue detected, retrying with minimal fields");
        const minimalData = {
          user_id: user.id,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
        };
        const { error: retryError } = await supabase.from("shopping_list").insert(minimalData);
        if (retryError) {
          error = retryError;
        } else {
          error = null;
        }
      }
      
      if (error) {
        console.error("Error adding to shopping list:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Insert data was:", insertData);
        
        // Handle duplicate entry (unique constraint violation)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast.info(`${ingredient.name} is already in your shopping list`);
          // Refresh the list to ensure it's in sync
          const serverData = await loadFromServer(user.id);
          setItems(serverData);
        } else if (error.message?.includes('ingredient_category') || error.message?.includes('schema cache')) {
          // If category column doesn't exist, try without it
          console.warn("Category column issue detected, retrying without category");
          const retryData = {
            user_id: user.id,
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
          };
          const { error: retryError } = await supabase.from("shopping_list").insert(retryData);
          if (retryError) {
            toast.error(`Failed to add to shopping list: ${retryError.message || "Unknown error"}`);
            return;
          }
          const serverData = await loadFromServer(user.id);
          setItems(serverData);
          toast.success(`Added ${ingredient.name} to shopping list`);
        } else {
          toast.error(`Failed to add to shopping list: ${error.message || "Unknown error"}`);
        }
        return;
      }
      
      const serverData = await loadFromServer(user.id);
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
      promptSignupToSave();
    }
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast, promptSignupToSave]);

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
      const toInsert = newIngredients.map(ing => {
        const item: {
          user_id: string;
          ingredient_id: string;
          ingredient_name: string;
          ingredient_category?: string;
        } = {
          user_id: user.id,
          ingredient_id: ing.id,
          ingredient_name: ing.name,
        };
        
        // Only include category if it's provided
        if (ing.category) {
          item.ingredient_category = ing.category;
        }
        
        return item;
      });
      
      // Try inserting with all fields first
      let { error } = await supabase.from("shopping_list").insert(toInsert);
      
      // If schema cache error, try without category
      if (error && (error.message?.includes('ingredient_name') || error.message?.includes('schema cache') || error.message?.includes('column'))) {
        console.warn("Schema cache issue detected, retrying with minimal fields");
        const minimalData = toInsert.map(item => ({
          user_id: item.user_id,
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredient_name,
        }));
        const { error: retryError } = await supabase.from("shopping_list").insert(minimalData);
        if (retryError) {
          error = retryError;
        } else {
          error = null;
        }
      }
      
      if (error) {
        console.error("Error adding items to shopping list:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Insert data sample:", toInsert.slice(0, 2));
        console.error("User ID:", user.id);
        
        // Handle duplicate entries (unique constraint violation)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast.info("Some items are already in your shopping list");
          // Refresh the list to ensure it's in sync
          const serverData = await loadFromServer(user.id);
          setItems(serverData);
        } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          // RLS policy violation
          console.error("RLS policy violation - user may not have permission to insert");
          toast.error("Permission denied. Please try logging out and back in.");
        } else if (error.message?.includes('ingredient_category') || error.message?.includes('schema cache')) {
          // If category column doesn't exist, try without it
          console.warn("Category column issue detected, retrying without category");
          const retryData = toInsert.map(item => ({
            user_id: item.user_id,
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
          }));
          const { error: retryError } = await supabase.from("shopping_list").insert(retryData);
          if (retryError) {
            console.error("Retry also failed:", retryError);
            toast.error(`Failed to add items to shopping list: ${retryError.message || "Unknown error"}`);
            return;
          }
          const serverData = await loadFromServer(user.id);
          setItems(serverData);
          toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
        } else {
          toast.error(`Failed to add items to shopping list: ${error.message || "Unknown error"}`);
        }
        return;
      }
      
      const serverData = await loadFromServer(user.id);
      setItems(serverData);
      toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
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
    if (!isAuthenticated) {
      promptSignupToSave();
    }
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast, promptSignupToSave]);

  // Remove item
  const removeItem = useCallback(async (ingredientId: string) => {
    if (isAuthenticated && user) {
      await supabase
        .from("shopping_list")
        .delete()
        .eq("user_id", user.id)
        .eq("ingredient_id", ingredientId);
      
      const serverData = await loadFromServer(user.id);
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
      
      const serverData = await loadFromServer(user.id);
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
      
      const serverData = await loadFromServer(user.id);
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

