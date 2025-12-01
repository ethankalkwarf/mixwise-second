"use client";

import { useMemo } from "react";
import { CheckCircleIcon, XCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useUser } from "@/components/auth/UserProvider";

interface Ingredient {
  _key?: string;
  amount?: string;
  isOptional?: boolean;
  ingredient?: {
    _id: string;
    name: string;
    type?: string;
  } | null;
}

interface IngredientAvailabilityProps {
  ingredients: Ingredient[];
}

export function IngredientAvailability({ ingredients }: IngredientAvailabilityProps) {
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const { addItems, isLoading: shoppingLoading } = useShoppingList();
  const { isAuthenticated } = useUser();

  // Calculate availability
  const { available, missing, total, percentage } = useMemo(() => {
    const validIngredients = ingredients.filter(i => i.ingredient && !i.isOptional);
    const total = validIngredients.length;
    
    const available = validIngredients.filter(i => 
      i.ingredient && ingredientIds.includes(i.ingredient._id)
    );
    
    const missing = validIngredients.filter(i => 
      i.ingredient && !ingredientIds.includes(i.ingredient._id)
    );
    
    const percentage = total > 0 ? Math.round((available.length / total) * 100) : 0;

    return {
      available: available.length,
      missing: missing.length,
      missingIngredients: missing,
      total,
      percentage,
    };
  }, [ingredients, ingredientIds]);

  // Don't show if user has no bar ingredients
  if (!barLoading && ingredientIds.length === 0 && !isAuthenticated) {
    return null;
  }

  if (barLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-48 mb-3" />
        <div className="flex gap-4">
          <div className="h-4 bg-slate-700 rounded w-24" />
          <div className="h-4 bg-slate-700 rounded w-24" />
        </div>
      </div>
    );
  }

  if (ingredientIds.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <p className="text-sm text-slate-400">
          Add ingredients to your bar to see what you can make!
        </p>
      </div>
    );
  }

  const handleAddMissingToShoppingList = () => {
    const missingIngredients = ingredients
      .filter(i => i.ingredient && !i.isOptional && !ingredientIds.includes(i.ingredient._id))
      .map(i => ({
        id: i.ingredient!._id,
        name: i.ingredient!.name,
        category: i.ingredient!.type,
      }));
    
    addItems(missingIngredients);
  };

  const progressColor = percentage === 100 
    ? "bg-lime-500" 
    : percentage >= 50 
      ? "bg-amber-500" 
      : "bg-red-500";

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-200">
          Your Bar Status
        </h3>
        <span className={`text-sm font-bold ${
          percentage === 100 ? "text-lime-400" : percentage >= 50 ? "text-amber-400" : "text-red-400"
        }`}>
          {percentage}% ready
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${progressColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-lime-400" />
          <span className="text-sm text-slate-300">
            <span className="font-medium">{available}</span> you have
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-400">
            <span className="font-medium">{missing}</span> missing
          </span>
        </div>
      </div>

      {/* Missing ingredients breakdown */}
      {missing > 0 && (
        <div className="border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400 mb-3">Missing ingredients:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ingredients
              .filter(i => i.ingredient && !i.isOptional && !ingredientIds.includes(i.ingredient._id))
              .map((item) => (
                <span
                  key={item._key || item.ingredient?._id}
                  className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full"
                >
                  {item.ingredient?.name}
                </span>
              ))}
          </div>

          {/* Add to shopping list button */}
          <button
            onClick={handleAddMissingToShoppingList}
            disabled={shoppingLoading}
            className="flex items-center gap-2 text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            Add {missing} missing to shopping list
          </button>
        </div>
      )}

      {/* Ready message */}
      {percentage === 100 && (
        <p className="text-sm text-lime-400 font-medium">
          🎉 You have everything you need to make this cocktail!
        </p>
      )}
    </div>
  );
}




