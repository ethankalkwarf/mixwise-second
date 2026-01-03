"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useUser } from "@/components/auth/UserProvider";
import { useShoppingList } from "@/hooks/useShoppingList";

interface IngredientRef {
  id: string;
  name: string;
  category?: string;
  isOptional?: boolean;
}

interface IngredientAvailabilityProps {
  /**
   * IMPORTANT: `id` should be the same identifier used by the bar inventory
   * (canonical ingredient UUIDs where possible). If an ingredient can't be
   * matched, a stable fallback string is fine (it will be treated as "missing").
   */
  ingredients: IngredientRef[];
  quantity?: number;
}

export function IngredientAvailability({ ingredients, quantity = 1 }: IngredientAvailabilityProps) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, ingredients: barIngredients, isLoading: barLoading } = useBarIngredients();
  const { addItems, isLoading: shoppingListLoading } = useShoppingList();
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [didAdd, setDidAdd] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to check if ingredient is ice (everyone has ice!)
  const isIce = (name: string) => {
    const normalized = name.toLowerCase().trim();
    return normalized === 'ice' || 
           normalized === 'ice cubes' || 
           normalized === 'crushed ice' ||
           normalized === 'ice cube';
  };

  // Calculate availability
  const { available, missing, total, percentage, missingIngredients } = useMemo(() => {
    // Filter out ice from required ingredients - everyone has ice!
    const requiredIngredients = ingredients.filter((i) => !i.isOptional && !isIce(i.name));
    const total = requiredIngredients.length;

    // Normalize IDs for comparison (handle string vs UUID, case-insensitive)
    const normalizedBarIds = new Set(
      ingredientIds.map(id => String(id).toLowerCase().trim())
    );

    // Also create a set of normalized ingredient names from bar for name-based matching
    // This helps when cocktail ingredients use name-based IDs instead of UUIDs
    const normalizedBarNames = new Set(
      barIngredients.map(ing => String(ing.name || '').toLowerCase().trim()).filter(Boolean)
    );

    const availableIngredients = requiredIngredients.filter((i) => {
      const normalizedId = String(i.id).toLowerCase().trim();
      const normalizedName = String(i.name).toLowerCase().trim();
      
      // Try ID match first (for canonical UUIDs)
      const isAvailableById = normalizedBarIds.has(normalizedId);
      
      // If ID match fails, try name match (for fallback name-based IDs)
      const isAvailableByName = normalizedBarNames.has(normalizedName);
      
      const isAvailable = isAvailableById || isAvailableByName;
      
      if (process.env.NODE_ENV === 'development') {
        if (!isAvailable) {
          console.log(`[IngredientAvailability] Missing: "${i.name}" (ID: ${i.id})`, {
            idMatch: isAvailableById,
            nameMatch: isAvailableByName,
            barIds: Array.from(normalizedBarIds).slice(0, 5),
            barNames: Array.from(normalizedBarNames).slice(0, 5),
            barIngredientsCount: barIngredients.length,
            barIngredientsWithNames: barIngredients.filter(ing => ing.name).length,
          });
        }
      }
      return isAvailable;
    });

    const missingIngredients = requiredIngredients.filter(
      (i) => {
        const normalizedId = String(i.id).toLowerCase().trim();
        const normalizedName = String(i.name).toLowerCase().trim();
        return !normalizedBarIds.has(normalizedId) && !normalizedBarNames.has(normalizedName);
      }
    );

    const percentage =
      total > 0 ? Math.round((availableIngredients.length / total) * 100) : 0;

    return {
      available: availableIngredients.length,
      missing: missingIngredients.length,
      total,
      percentage,
      missingIngredients,
    };
  }, [ingredients, ingredientIds, barIngredients]);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return null;
  }

  // Only show for logged-in users
  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (barLoading) {
    return (
      <div className="rounded-xl border border-mist bg-cream p-4 animate-pulse">
        <div className="h-5 bg-mist rounded w-48 mb-3" />
        <div className="flex gap-4">
          <div className="h-4 bg-mist rounded w-24" />
          <div className="h-4 bg-mist rounded w-24" />
        </div>
      </div>
    );
  }

  const progressColor = percentage === 100 
    ? "bg-olive" 
    : percentage >= 50 
      ? "bg-terracotta" 
      : "bg-stone";

  return (
    <div className="rounded-xl border border-mist bg-cream p-5">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-forest">
          Your bar status
        </h3>
        <span
          className={`text-sm font-bold ${
            percentage === 100
              ? "text-olive"
              : percentage >= 50
                ? "text-terracotta"
                : "text-sage"
          }`}
        >
          {percentage}% ready
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-mist rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${progressColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-olive" />
          <span className="text-sm text-sage">
            <span className="font-medium">{available}</span> you have
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-stone" />
          <span className="text-sm text-sage">
            <span className="font-medium">{missing}</span> missing
          </span>
        </div>
      </div>

      {/* Missing ingredients breakdown */}
      {missing > 0 && (
        <div className="border-t border-mist pt-4">
          <p className="text-sm text-sage mb-3">Missing ingredients:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {missingIngredients.map((item) => (
              <span
                key={item.id}
                className="text-sm bg-mist/60 text-forest px-3 py-1 rounded-full"
              >
                {item.name}
              </span>
            ))}
          </div>

          {/* Add to shopping list button */}
          <button
            onClick={async () => {
              setIsAdding(true);
              setDidAdd(false);
              try {
                const scaledIngredients = missingIngredients.map(ing => ({
                  id: ing.id,
                  name: ing.name,
                  category: ing.category,
                }));
                await addItems(scaledIngredients);
                setDidAdd(true);
                setTimeout(() => setDidAdd(false), 2000);
              } catch (error) {
                console.error("Error adding to shopping list:", error);
              } finally {
                setIsAdding(false);
              }
            }}
            disabled={shoppingListLoading || isAdding}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-cream text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                Adding...
              </>
            ) : didAdd ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Added to shopping list
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                Add missing ingredients to shopping list
              </>
            )}
          </button>

          {/* Link to shopping list - more prominent after adding */}
          <div className="flex items-center justify-center mt-2">
            <Link
              href="/shopping-list"
              className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors group"
            >
              <ShoppingBagIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              View your shopping list
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Ready message */}
      {percentage === 100 && (
        <div className="border-t border-mist pt-4">
          <p className="text-sm text-olive font-medium mb-3 text-center">
            ✓ You have everything you need to make this cocktail!
          </p>
          <Link
            href="/shopping-list"
            className="block text-center text-sm font-medium text-sage hover:text-terracotta transition-colors"
          >
            View shopping list →
          </Link>
        </div>
      )}
    </div>
  );
}





