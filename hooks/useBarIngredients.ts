"use client";

import { useState, useEffect, useCallback } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useToast } from "@/components/ui/toast";
import { checkBarBadges } from "@/lib/badgeEngine";
import { buildNameToIdMap, buildIdToNameMap, normalizeToCanonicalMultiple } from "@/lib/ingredientId";
import type { BarIngredient } from "@/lib/supabase/database.types";

const LOCAL_STORAGE_KEY = "mixwise-bar-inventory";

/**
 * Sync state tracking for debugging and monitoring
 */
interface SyncState {
  lastSync?: {
    timestamp: number;
    status: "success" | "partial" | "failed";
    itemCount: number;
    error?: string;
  };
  isCurrentlySyncing: boolean;
}

interface IngredientWithName {
  id: string;
  name: string | null;
}

/**
 * Normalize legacy ingredient IDs to canonical UUID format
 * 
 * Uses the new ingredientId utilities for type-safe normalization.
 * IMPORTANT: Preserves all IDs - returns original ID if normalization fails.
 * This prevents data loss when IDs can't be mapped.
 */
function normalizeIngredientIds(
  ids: string[],
  nameToCanonicalId: Map<string, string>
): string[] {
  const result: string[] = [];
  
  for (const id of ids) {
    if (!id) continue;
    
    // Try to normalize using the utility
    const normalized = normalizeToCanonicalMultiple([id], nameToCanonicalId);
    
    if (normalized.length > 0) {
      result.push(normalized[0]);
    } else {
      // IMPORTANT: Keep the original ID if normalization fails
      // This prevents data loss for valid IDs that just can't be mapped
      result.push(id);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[bar] Keeping original ID (normalization failed): "${id}"`);
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(result)];
}

interface UseBarIngredientsResult {
  ingredientIds: string[];
  ingredients: IngredientWithName[];  // Full data with names
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
 * 
 * IMPORTANT: Uses the shared Supabase client from SessionContext
 * to ensure session cookies are properly synced after login.
 */
export function useBarIngredients(): UseBarIngredientsResult {
  const { user, isAuthenticated, isLoading: authLoading, authReady } = useUser();
  const { supabaseClient: supabase } = useSessionContext();
  const { openAuthDialog } = useAuthDialog();
  const toast = useToast();
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);
  const [ingredientNameMap, setIngredientNameMap] = useState<Map<string, string | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [serverIngredients, setServerIngredients] = useState<BarIngredient[]>([]);
  
  // Computed ingredients with names
  const ingredients: IngredientWithName[] = ingredientIds.map(id => ({
    id,
    name: ingredientNameMap.get(id) ?? null,
  }));

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
    if (!user) {
      console.log("[useBarIngredients] No user, cannot load from server");
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from("bar_ingredients")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("[useBarIngredients] Error loading bar ingredients:", error);
        return [];
      }
      
      console.log("[useBarIngredients] Loaded from server:", data?.length || 0, "ingredients");
      return data || [];
    } catch (err) {
      console.error("[useBarIngredients] Exception loading from server:", err);
      return [];
    }
  }, [user, supabase]);

  // Initialize ingredients based on auth state
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;

      setIsLoading(true);

      try {
        // Wait for auth to be fully ready before making any queries
        // This ensures the Supabase client has the proper session token
        if (authReady) {
          try {
            await Promise.race([
              authReady,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Auth ready timeout')), 5000))
            ]);
            console.log("[useBarIngredients] Auth ready, proceeding with queries");
          } catch (e) {
            console.warn("[useBarIngredients] Auth ready timeout, proceeding anyway");
          }
        }

        // Fetch ingredients for ID normalization
        let ingredientsData: any[] = [];
        const { data, error: ingredientsError } = await supabase
          .from("ingredients")
          .select("id, name, legacy_id");

        if (ingredientsError) {
          console.error("[useBarIngredients] Error fetching ingredients for normalization:", ingredientsError);
          // IMPORTANT: Don't return - continue loading user's bar even if ingredients list fails
          ingredientsData = [];
        } else {
          ingredientsData = data || [];
        }

        // Build canonical ID map using utility (will be empty map if ingredients fetch failed)
        const nameToCanonicalId = buildNameToIdMap(
          (ingredientsData || []).map(ing => ({
            id: ing.id,
            name: ing.name,
            legacy_id: ing.legacy_id || null
          }))
        );

        // Build name map from ingredients data
        const nameMap = buildIdToNameMap(
          (ingredientsData || []).map(ing => ({
            id: ing.id,
            name: ing.name
          }))
        );
        setIngredientNameMap(nameMap);

        if (isAuthenticated && user) {
          // Use atomic sync strategy: Fetch, validate, then upsert all at once
          await syncAuthenticatedBar(
            user.id,
            nameToCanonicalId,
            ingredientsData || []
          );
        } else {
          // Load from localStorage for anonymous users
          const localIds = loadFromLocal();

          // Normalize local IDs to canonical format
          const normalizedLocalIds = normalizeIngredientIds(localIds, nameToCanonicalId);

          // If normalization changed anything, update localStorage
          if (normalizedLocalIds.length !== localIds.length || !normalizedLocalIds.every(id => localIds.includes(id))) {
            saveToLocal(normalizedLocalIds);
          }

          setIngredientIds(normalizedLocalIds);
        }
      } catch (error) {
        console.error("[useBarIngredients] Initialization failed:", error);
        // Attempt fallback: try to load from server even if initialization failed
        try {
          if (isAuthenticated && user) {
            const serverData = await loadFromServer();
            if (serverData && serverData.length > 0) {
              const serverIds = serverData.map(item => item.ingredient_id);
              setIngredientIds(serverIds);
              setServerIngredients(serverData);
              console.log("[useBarIngredients] Loaded from server fallback:", serverIds.length, "ingredients");
            }
          }
        } catch (fallbackError) {
          console.error("[useBarIngredients] Fallback also failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, supabase]);

  /**
   * Atomic sync for authenticated users
   * Uses upsert-only strategy (no delete) to prevent data loss
   */
  const syncAuthenticatedBar = useCallback(
    async (userId: string, nameToCanonicalId: Map<string, string>, ingredientsData: any[]) => {
      try {
        // Step 1: Load current state from server (source of truth)
        const serverData = await loadFromServer();
        const serverIds = serverData.map(item => item.ingredient_id);
        const localIds = loadFromLocal();

        console.log("[useBarIngredients] Sync starting:", {
          serverIdsCount: serverIds.length,
          localIdsCount: localIds.length,
          serverIdsSample: serverIds.slice(0, 3),
        });

        // Step 2: Merge server and local IDs (server data takes priority)
        // Keep ALL server IDs - don't drop any during normalization
        const mergedIds = [...new Set([...serverIds, ...localIds])];
        
        // Step 3: For display purposes, try to normalize, but keep originals as fallback
        // This preserves all ingredient IDs even if normalization fails
        const normalizedMergedIds = mergedIds.map(id => {
          // Try normalization first
          const normalized = normalizeIngredientIds([id], nameToCanonicalId);
          // If normalization succeeds, use normalized ID; otherwise keep original
          return normalized.length > 0 ? normalized[0] : id;
        });

        console.log("[useBarIngredients] After merge:", {
          mergedCount: mergedIds.length,
          normalizedCount: normalizedMergedIds.length,
        });

        // Step 4: Only upsert local IDs that aren't already on server
        const newLocalIds = localIds.filter(id => !serverIds.includes(id));
        
        if (newLocalIds.length > 0) {
          const itemsToSync = newLocalIds.map(id => ({
            user_id: userId,
            ingredient_id: id,
            ingredient_name: ingredientsData?.find(ing => String(ing.id) === id)?.name || null,
          }));

          const { error: upsertError } = await supabase
            .from("bar_ingredients")
            .upsert(itemsToSync, {
              onConflict: "user_id,ingredient_id",
            });

          if (upsertError) {
            console.error("[useBarIngredients] Upsert failed:", upsertError);
          } else {
            console.log(`[useBarIngredients] Synced ${newLocalIds.length} new local items to server`);
          }
        }

        // Step 5: Update UI with ALL ingredient IDs (server + local merged)
        // CRITICAL: Do NOT delete items from server - preserve user's bar
        setIngredientIds(normalizedMergedIds);
        setServerIngredients(
          normalizedMergedIds.map(id => ({
            user_id: userId,
            ingredient_id: id,
            ingredient_name: ingredientsData?.find(ing => String(ing.id) === id)?.name || null,
          }))
        );
        
        // Clear local storage after successful merge
        clearLocal();

        console.log(`[useBarIngredients] Sync complete: ${normalizedMergedIds.length} items in bar`);
      } catch (error) {
        console.error("[useBarIngredients] Sync failed with exception:", error);
        // Fallback: try to load server data as source of truth
        try {
          const serverData = await loadFromServer();
          const serverIds = serverData.map(item => item.ingredient_id);
          console.log("[useBarIngredients] Fallback: loaded", serverIds.length, "ingredients from server");
          setIngredientIds(serverIds);
          setServerIngredients(serverData);
        } catch (fallbackError) {
          console.error("[useBarIngredients] Even fallback sync failed:", fallbackError);
        }
      }
    },
    [loadFromServer, loadFromLocal, clearLocal, supabase]
  );

  // Add ingredient
  const addIngredient = useCallback(async (id: string, name?: string) => {
    if (ingredientIds.includes(id)) {
      console.warn(`[useBarIngredients] Ingredient ${id} already in bar`);
      return;
    }
    
    const newIds = [...ingredientIds, id];
    setIngredientIds(newIds);
    
    // Update name map
    if (name) {
      setIngredientNameMap(prev => new Map(prev).set(id, name));
    }
    
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
        console.error(`[useBarIngredients] Error adding ingredient ${id}:`, error);
        toast.error("Failed to add ingredient");
        // Revert on error
        setIngredientIds(ingredientIds);
        setIngredientNameMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      } else {
        console.log(`[useBarIngredients] Ingredient ${id} added, bar size: ${newIds.length}`);
        toast.success("Ingredient added to your bar");

        // Check for badge unlocks
        try {
          await checkBarBadges(supabase, user.id, newIds.length);
        } catch (badgeError) {
          console.error(`[useBarIngredients] Error checking bar badges:`, badgeError);
        }
      }
    } else {
      // Save to localStorage
      saveToLocal(newIds);
      console.log(`[useBarIngredients] Ingredient ${id} added to localStorage, bar size: ${newIds.length}`);
      toast.success("Ingredient added to your bar");
    }
  }, [ingredientIds, isAuthenticated, user, supabase, saveToLocal, toast]);

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
        console.error(`[useBarIngredients] Error removing ingredient ${id}:`, error);
        toast.error("Failed to remove ingredient");
        // Revert on error
        setIngredientIds(ingredientIds);
      } else {
        console.log(`[useBarIngredients] Ingredient ${id} removed, bar size: ${newIds.length}`);
        toast.info("Ingredient removed");
      }
    } else {
      // Save to localStorage
      saveToLocal(newIds);
      console.log(`[useBarIngredients] Ingredient ${id} removed from localStorage, bar size: ${newIds.length}`);
      toast.info("Ingredient removed");
    }
  }, [ingredientIds, isAuthenticated, user, supabase, saveToLocal, toast]);

  // Set all ingredients at once
  const setIngredientsHandler = useCallback(async (ids: string[]) => {
    setIngredientIds(ids);
    
    if (isAuthenticated && user) {
      try {
        // Use atomic approach: upsert new items, then delete old ones
        if (ids.length > 0) {
          const items = ids.map(id => ({
            user_id: user.id,
            ingredient_id: id,
          }));
          
          const { error: upsertError } = await supabase
            .from("bar_ingredients")
            .upsert(items, {
              onConflict: "user_id,ingredient_id",
            });

          if (upsertError) {
            console.error("[useBarIngredients] Failed to upsert ingredients:", upsertError);
            toast.error("Failed to update bar");
            return;
          }
        }

        // Delete items that are no longer in the list
        const { data: currentItems, error: fetchError } = await supabase
          .from("bar_ingredients")
          .select("ingredient_id")
          .eq("user_id", user.id);

        if (fetchError) {
          console.warn("[useBarIngredients] Failed to fetch current items for cleanup:", fetchError);
          return;
        }

        const currentIds = (currentItems || []).map(item => item.ingredient_id);
        const idsToDelete = currentIds.filter(id => !ids.includes(id));

        if (idsToDelete.length > 0) {
          for (const id of idsToDelete) {
            const { error: deleteError } = await supabase
              .from("bar_ingredients")
              .delete()
              .eq("user_id", user.id)
              .eq("ingredient_id", id);

            if (deleteError) {
              console.warn(`[useBarIngredients] Failed to delete ingredient ${id}:`, deleteError);
            }
          }
        }

        console.log(`[useBarIngredients] Batch update complete: ${ids.length} items set`);
      } catch (error) {
        console.error("[useBarIngredients] Batch update failed:", error);
        toast.error("Failed to update bar");
      }
    } else {
      saveToLocal(ids);
    }
  }, [isAuthenticated, user, supabase, saveToLocal, toast]);

  // Clear all ingredients
  const clearAll = useCallback(async () => {
    setIngredientIds([]);
    
    if (isAuthenticated && user) {
      const { error } = await supabase
        .from("bar_ingredients")
        .delete()
        .eq("user_id", user.id);
      
      if (error) {
        toast.error("Failed to clear bar");
      } else {
        toast.info("Bar cleared");
      }
    } else {
      clearLocal();
      toast.info("Bar cleared");
    }
  }, [isAuthenticated, user, supabase, clearLocal, toast]);

  // Sync local to server (for after sign-in)
  const syncToServer = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.warn("[useBarIngredients] syncToServer called but user not authenticated");
      return;
    }
    
    const localIds = loadFromLocal();
    if (localIds.length === 0) {
      console.log("[useBarIngredients] No local items to sync");
      return;
    }
    
    try {
      const items = localIds.map(id => ({
        user_id: user.id,
        ingredient_id: id,
      }));
      
      const { error } = await supabase.from("bar_ingredients").upsert(items, {
        onConflict: "user_id,ingredient_id",
      });
      
      if (error) {
        console.error(`[useBarIngredients] Sync failed, keeping local data:`, error);
        toast.error("Failed to save bar - local changes preserved");
        return;
      }

      clearLocal();
      console.log(`[useBarIngredients] Successfully synced ${localIds.length} items to server`);
      toast.success("Bar saved!");
    } catch (error) {
      console.error("[useBarIngredients] Sync threw exception, keeping local data:", error);
      toast.error("Failed to save bar - local changes preserved");
    }
  }, [isAuthenticated, user, loadFromLocal, clearLocal, supabase, toast]);

  // Prompt user to sign in to save
  const promptToSave = useCallback(() => {
    openAuthDialog({
      mode: "signup",
      title: "Save your bar",
      subtitle: "Log in or create a free account to save your bar ingredients and never lose them.",
    });
  }, [openAuthDialog]);

  return {
    ingredientIds,
    ingredients,
    isLoading,
    addIngredient,
    removeIngredient,
    setIngredients: setIngredientsHandler,
    clearAll,
    syncToServer,
    promptToSave,
  };
}

