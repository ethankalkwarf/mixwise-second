"use client";

import { PlusCircleIcon, CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useShoppingList } from "@/hooks/useShoppingList";

interface IngredientActionsProps {
  ingredient: {
    id: string;
    name: string;
    type?: string;
  };
}

export function IngredientActions({ ingredient }: IngredientActionsProps) {
  const { ingredientIds, addIngredient, removeIngredient, isLoading: barLoading } = useBarIngredients();
  const { addItem, isInList, isLoading: shoppingLoading } = useShoppingList();

  const isInBar = ingredientIds.includes(ingredient.id);
  const isInShoppingList = isInList(ingredient.id);

  const handleBarToggle = () => {
    if (isInBar) {
      removeIngredient(ingredient.id);
    } else {
      addIngredient(ingredient.id, ingredient.name);
    }
  };

  const handleAddToShoppingList = () => {
    addItem({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.type,
    });
  };

  return (
    <div className="space-y-3">
      {/* Add to bar button */}
      <button
        onClick={handleBarToggle}
        disabled={barLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${
          isInBar
            ? "bg-lime-500 text-slate-900 hover:bg-lime-400"
            : "bg-slate-800 text-slate-200 hover:bg-slate-700"
        }`}
      >
        {isInBar ? (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            In My Bar
          </>
        ) : (
          <>
            <PlusCircleIcon className="w-5 h-5" />
            Add to My Bar
          </>
        )}
      </button>

      {/* Add to shopping list button (only show if not in bar) */}
      {!isInBar && (
        <button
          onClick={handleAddToShoppingList}
          disabled={shoppingLoading || isInShoppingList}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
            isInShoppingList
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <ShoppingBagIcon className="w-5 h-5" />
          {isInShoppingList ? "In Shopping List" : "Add to Shopping List"}
        </button>
      )}
    </div>
  );
}





