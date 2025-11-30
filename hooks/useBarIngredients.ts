"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import type { BarIngredient } from "@/lib/supabase/database.types";

const LOCAL_STORAGE_KEY = "mixwise-bar-inventory";

interface UseBarIngredientsResult {
  ingredientIds: string[];
  isLoading: boolean;
  addIngredient: (id: string, name?: string) => Promise<void>;
  removeIngredient: (id: string) => Promise<void>;
  setIngredients: (ids: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
  syncToServer: () => Promise<void>;
  promptToSave: () => void;
}

/**
 * Hook to manage bar ingredients with local + server sync
 * 
 * For anonymous users: stores in localStorage
 * For authenticated users: syncs with Supabase
 */
export function useBarIngredients(): UseBarIngredientsResult {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthDialog } = useAuthDialog();
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverIngredients, setServerIngredients] = useState<BarIngredient[]>([]);
  
  const supabase = createClient();

  // Load ingredients from localStorage
  const loadFromLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
    return [];
  }, []);

  // Save to localStorage
  const saveToLocal = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }, []);

  // Clear localStorage
  const clearLocal = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }
  }, []);

  // Load ingredients from server
  const loadFromServer = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("bar_ingredients")
      .select("*")
      .eq("user_id", user.id);
    
    if (error) {
      console.error("Error loading bar ingredients:", error);
      return [];
    }
    
    return data || [];
  }, [user, supabase]);

  // Initialize ingredients based on auth state
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;
      
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        // Load from server for authenticated users
        const serverData = await loadFromServer();
        setServerIngredients(serverData);
        
        const serverIds = serverData.map(item => item.ingredient_id);
        const localIds = loadFromLocal();
        
        // Merge local with server (server takes precedence, but add any new local items)
        const mergedIds = [...new Set([...serverIds, ...localIds])];
        
        // If there are local items not on server, sync them
        const newLocalIds = localIds.filter(id => !serverIds.includes(id));
        if (newLocalIds.length > 0) {
          // Add new local items to server
          const newItems = newLocalIds.map(id => ({
            user_id: user.id,
            ingredient_id: id,
          }));
          
          await supabase.from("bar_ingredients").upsert(newItems, {
            onConflict: "user_id,ingredient_id",
          });
          
          // Clear local storage after syncing
          clearLocal();
        }
        
        setIngredientIds(mergedIds);
      } else {
        // Load from localStorage for anonymous users
        const localIds = loadFromLocal();
        setIngredientIds(localIds);
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, [authLoading, isAuthenticated, user, loadFromServer, loadFromLocal, clearLocal, supabase]);

  // Add ingredient
  const addIngredient = useCallback(async (id: string, name?: string) => {
    if (ingredientIds.includes(id)) return;
    
    const newIds = [...ingredientIds, id];
    setIngredientIds(newIds);
    
    if (isAuthenticated && user) {
      // Save to server
      const { error } = await supabase.from("bar_ingredients").upsert({
        user_id: user.id,
        ingredient_id: id,
        ingredient_name: name,
      }, {
        onConflict: "user_id,ingredient_id",
      });
      
      if (error) {
        console.error("Error adding ingredient:", error);
        // Revert on error
        setIngredientIds(ingredientIds);
      }
    } else {
      // Save to localStorage
      saveToLocal(newIds);
    }
  }, [ingredientIds, isAuthenticated, user, supabase, saveToLocal]);

  // Remove ingredient
  const removeIngredient = useCallback(async (id: string) => {
    const newIds = ingredientIds.filter(i => i !== id);
    setIngredientIds(newIds);
    
    if (isAuthenticated && user) {
      // Remove from server
      const { error } = await supabase
        .from("bar_ingredients")
        .delete()
        .eq("user_id", user.id)
        .eq("ingredient_id", id);
      
      if (error) {
        console.error("Error removing ingredient:", error);
        // Revert on error
        setIngredientIds(ingredientIds);
      }
    } else {
      // Save to localStorage
      saveToLocal(newIds);
    }
  }, [ingredientIds, isAuthenticated, user, supabase, saveToLocal]);

  // Set all ingredients at once
  const setIngredientsHandler = useCallback(async (ids: string[]) => {
    setIngredientIds(ids);
    
    if (isAuthenticated && user) {
      // Clear existing and add new
      await supabase
        .from("bar_ingredients")
        .delete()
        .eq("user_id", user.id);
      
      if (ids.length > 0) {
        const items = ids.map(id => ({
          user_id: user.id,
          ingredient_id: id,
        }));
        
        await supabase.from("bar_ingredients").insert(items);
      }
    } else {
      saveToLocal(ids);
    }
  }, [isAuthenticated, user, supabase, saveToLocal]);

  // Clear all ingredients
  const clearAll = useCallback(async () => {
    setIngredientIds([]);
    
    if (isAuthenticated && user) {
      await supabase
        .from("bar_ingredients")
        .delete()
        .eq("user_id", user.id);
    } else {
      clearLocal();
    }
  }, [isAuthenticated, user, supabase, clearLocal]);

  // Sync local to server (for after sign-in)
  const syncToServer = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    const localIds = loadFromLocal();
    if (localIds.length === 0) return;
    
    const items = localIds.map(id => ({
      user_id: user.id,
      ingredient_id: id,
    }));
    
    await supabase.from("bar_ingredients").upsert(items, {
      onConflict: "user_id,ingredient_id",
    });
    
    clearLocal();
  }, [isAuthenticated, user, loadFromLocal, clearLocal, supabase]);

  // Prompt user to sign in to save
  const promptToSave = useCallback(() => {
    openAuthDialog({
      title: "Save your bar",
      subtitle: "Create a free account to save your bar ingredients and never lose them.",
    });
  }, [openAuthDialog]);

  return {
    ingredientIds,
    isLoading,
    addIngredient,
    removeIngredient,
    setIngredients: setIngredientsHandler,
    clearAll,
    syncToServer,
    promptToSave,
  };
}

