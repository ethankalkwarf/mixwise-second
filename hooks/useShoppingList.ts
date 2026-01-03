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
  
  // Helper to get Supabase URL and anon key for REST API calls
  const getSupabaseConfig = useCallback(() => {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }, []);
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
      // Use REST API directly to bypass schema cache issues
      // The typed client has persistent schema cache problems, so we skip it for inserts
      try {
        const config = getSupabaseConfig();
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        
        if (!config.url || !config.anonKey) {
          throw new Error("Missing Supabase configuration");
        }
        
        // Prepare payload
        const restPayload: {
          user_id: string;
          ingredient_id: string;
          ingredient_name: string;
          ingredient_category?: string;
        } = {
          user_id: user.id,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
        };
        
        if (ingredient.category) {
          restPayload.ingredient_category = ingredient.category;
        }
        
        console.log("[ShoppingList] Inserting via REST API", {
          ingredient: ingredient.name,
          url: `${config.url}/rest/v1/shopping_list`,
          payload: { ...restPayload, user_id: '[REDACTED]' },
        });
        
        const response = await fetch(`${config.url}/rest/v1/shopping_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.anonKey,
            'Authorization': `Bearer ${accessToken || config.anonKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(restPayload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || response.statusText };
          }
          
          // Log full error details for debugging
          const fullError = {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText,
            errorData: errorData,
            payload: { ...restPayload, user_id: '[REDACTED]' },
          };
          console.error("[ShoppingList] REST API insert failed:", fullError);
          
          // Handle duplicate entry (unique constraint violation)
          if (response.status === 409 || response.status === 23505 || 
              errorText.includes('duplicate') || errorText.includes('unique') ||
              errorData.message?.includes('duplicate') || errorData.message?.includes('unique')) {
            toast.info(`${ingredient.name} is already in your shopping list`);
            const serverData = await loadFromServer(user.id);
            setItems(serverData);
            return;
          }
          
          // Handle permission errors
          if (response.status === 401 || response.status === 403) {
            toast.error("Permission denied. Please try logging out and back in.");
            return;
          }
          
          // For all other errors, show the actual error message
          // This helps us debug what's really happening
          const errorMessage = errorData.message || errorData.details || errorText || response.statusText;
          console.error("[ShoppingList] Full error details:", {
            status: response.status,
            errorMessage: errorMessage,
            errorText: errorText.substring(0, 500), // First 500 chars
            errorData: errorData,
          });
          
          // Show user-friendly error with actual message
          if (errorMessage.includes('ingredient_name') || errorMessage.includes('column') || errorMessage.includes('schema')) {
            toast.error(`Database error: ${errorMessage}. Please check the console for details.`);
          } else {
            toast.error(`Failed to add to shopping list: ${errorMessage}`);
          }
          return;
        }
        
        // Success
        console.log("[ShoppingList] REST API insert successful");
        const serverData = await loadFromServer(user.id);
        setItems(serverData);
        toast.success(`Added ${ingredient.name} to shopping list`);
      } catch (error: any) {
        console.error("[ShoppingList] REST API insert failed:", error);
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
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast, promptSignupToSave, getSupabaseConfig]);

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
      // Use REST API directly to bypass schema cache issues
      // The typed client has persistent schema cache problems, so we skip it for inserts
      try {
        const config = getSupabaseConfig();
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        
        if (!config.url || !config.anonKey) {
          throw new Error("Missing Supabase configuration");
        }
        
        // Prepare payload array
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
          
          if (ing.category) {
            item.ingredient_category = ing.category;
          }
          
          return item;
        });
        
        console.log("[ShoppingList] Inserting via REST API (bulk)", {
          itemCount: toInsert.length,
        });
        
        const response = await fetch(`${config.url}/rest/v1/shopping_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': config.anonKey,
            'Authorization': `Bearer ${accessToken || config.anonKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(toInsert),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || response.statusText };
          }
          
          // Log full error details for debugging
          const fullError = {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText,
            errorData: errorData,
            itemCount: toInsert.length,
          };
          console.error("[ShoppingList] REST API insert failed (bulk):", fullError);
          
          // Handle duplicate entries (unique constraint violation)
          if (response.status === 409 || response.status === 23505 || 
              errorText.includes('duplicate') || errorText.includes('unique') ||
              errorData.message?.includes('duplicate') || errorData.message?.includes('unique')) {
            toast.info("Some items are already in your shopping list");
            const serverData = await loadFromServer(user.id);
            setItems(serverData);
            return;
          }
          
          // Handle permission errors
          if (response.status === 401 || response.status === 403) {
            toast.error("Permission denied. Please try logging out and back in.");
            return;
          }
          
          // For all other errors, show the actual error message
          // This helps us debug what's really happening
          const errorMessage = errorData.message || errorData.details || errorText || response.statusText;
          console.error("[ShoppingList] Full error details (bulk):", {
            status: response.status,
            errorMessage: errorMessage,
            errorText: errorText.substring(0, 500), // First 500 chars
            errorData: errorData,
          });
          
          // Show user-friendly error with actual message
          if (errorMessage.includes('ingredient_name') || errorMessage.includes('column') || errorMessage.includes('schema')) {
            toast.error(`Database error: ${errorMessage}. Please check the console for details.`);
          } else {
            toast.error(`Failed to add items to shopping list: ${errorMessage}`);
          }
          return;
        }
        
        // Success
        console.log("[ShoppingList] REST API insert successful (bulk)");
        const serverData = await loadFromServer(user.id);
        setItems(serverData);
        toast.success(`Added ${newIngredients.length} item${newIngredients.length > 1 ? 's' : ''} to shopping list`);
      } catch (error: any) {
        console.error("[ShoppingList] REST API insert failed (bulk):", error);
        toast.error(`Failed to add items to shopping list: ${error.message || "Unknown error"}`);
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
  }, [items, isAuthenticated, user, supabase, loadFromServer, saveToLocal, toast, promptSignupToSave, getSupabaseConfig]);

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

