"use client";

import Link from "next/link";
import { PlusCircleIcon, CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useShoppingList } from "@/hooks/useShoppingList";

interface IngredientActionsProps {
  ingredient: {
    id: string;
    name: string;
    type?: string;
  };
  mixHref: string;
}

export function IngredientActions({ ingredient, mixHref }: IngredientActionsProps) {
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
      <Link
        href={mixHref}
        className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-semibold bg-forest text-cream hover:bg-charcoal transition-colors"
      >
        Mix with {ingredient.name}
      </Link>

      <button
        onClick={handleBarToggle}
        disabled={barLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
          isInBar
            ? "bg-forest/10 text-forest border border-forest/20 hover:bg-forest/15"
            : "bg-terracotta hover:bg-terracotta-dark text-cream"
        }`}
      >
        {isInBar ? (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            In my bar
          </>
        ) : (
          <>
            <PlusCircleIcon className="w-5 h-5" />
            Add to my bar
          </>
        )}
      </button>

      <button
        onClick={handleAddToShoppingList}
        disabled={shoppingLoading || isInShoppingList}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${
          isInShoppingList
            ? "bg-mist text-sage cursor-not-allowed"
            : "bg-white border border-mist text-forest hover:border-stone"
        }`}
      >
        <ShoppingBagIcon className="w-5 h-5" />
        {isInShoppingList ? "In shopping list" : "Add to shopping list"}
      </button>
    </div>
  );
}
