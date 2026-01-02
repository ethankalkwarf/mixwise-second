"use client";

import { useState, useEffect } from "react";
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useUser } from "@/components/auth/UserProvider";

interface ShoppingListButtonProps {
  ingredients: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  quantity: number;
}

export function ShoppingListButton({ ingredients, quantity }: ShoppingListButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { addItems, isLoading } = useShoppingList();
  const [isAdding, setIsAdding] = useState(false);
  const [didAdd, setDidAdd] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToShoppingList = async () => {
    setIsAdding(true);
    setDidAdd(false);
    try {
      // Scale ingredients by quantity (quantity scaling not implemented yet)
      const scaledIngredients = ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
      }));

      await addItems(scaledIngredients);
      setDidAdd(true);
      setTimeout(() => setDidAdd(false), 2000);
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      // Show error toast if not already handled by the hook
      if (!(error as any)?.message?.includes("already in")) {
        // The hook should handle toasts, but add fallback
        console.error("Failed to add items to shopping list");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return null;
  }

  // Only show for logged-in users
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleAddToShoppingList}
      disabled={isLoading || isAdding}
      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-terracotta hover:bg-terracotta-dark text-cream text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? (
        <>
          <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
          Adding...
        </>
      ) : didAdd ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingBagIcon className="w-4 h-4" />
          Add ingredients to shopping list
        </>
      )}
    </button>
  );
}
