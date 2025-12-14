"use client";

import { useState } from "react";
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useShoppingList } from "@/hooks/useShoppingList";

interface ShoppingListButtonProps {
  ingredients: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  quantity: number;
}

export function ShoppingListButton({ ingredients, quantity }: ShoppingListButtonProps) {
  const { addItems, isLoading } = useShoppingList();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToShoppingList = async () => {
    setIsAdding(true);
    try {
      // Scale ingredients by quantity (quantity scaling not implemented yet)
      const scaledIngredients = ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
      }));

      await addItems(scaledIngredients);
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      // Show error toast if not already handled by the hook
      if (!error.message?.includes("already in")) {
        // The hook should handle toasts, but add fallback
        console.error("Failed to add items to shopping list");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToShoppingList}
      disabled={isLoading || isAdding}
      className="flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingBagIcon className="w-4 h-4" />
          Add to Shopping List
        </>
      )}
    </button>
  );
}
