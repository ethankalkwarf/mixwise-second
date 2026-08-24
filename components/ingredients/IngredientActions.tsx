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
    <div
      data-ingredient-actions
      className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-3"
    >
      <Link
        href={mixHref}
        className="col-span-2 flex min-h-10 items-center justify-center rounded-xl bg-forest px-3 py-2.5 text-center text-sm font-semibold text-cream hover:bg-charcoal md:col-span-1 md:min-h-12 md:px-4 md:py-3 md:text-base"
      >
        Mix with {ingredient.name}
      </Link>

      <button
        onClick={handleBarToggle}
        disabled={barLoading}
        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 md:min-h-12 md:gap-2 md:px-4 md:py-3 md:text-base ${
          isInBar
            ? "border border-forest/20 bg-forest/10 text-forest hover:bg-forest/15"
            : "bg-terracotta text-cream hover:bg-terracotta-dark"
        }`}
      >
        {isInBar ? (
          <>
            <CheckCircleIcon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            In my bar
          </>
        ) : (
          <>
            <PlusCircleIcon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            Add to bar
          </>
        )}
      </button>

      <button
        onClick={handleAddToShoppingList}
        disabled={shoppingLoading || isInShoppingList}
        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 md:min-h-12 md:gap-2 md:px-4 md:py-3 md:text-base ${
          isInShoppingList
            ? "cursor-not-allowed bg-mist text-sage"
            : "border border-mist bg-white text-forest hover:border-stone"
        }`}
      >
        <ShoppingBagIcon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
        <span className="md:hidden">{isInShoppingList ? "In list" : "Shop"}</span>
        <span className="hidden md:inline">
          {isInShoppingList ? "In shopping list" : "Add to shopping list"}
        </span>
      </button>
    </div>
  );
}
