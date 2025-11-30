"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { sanityClient } from "@/lib/sanityClient";

interface CocktailWithIngredients {
  _id: string;
  ingredients?: Array<{
    ingredient?: { _id: string } | null;
  }>;
}

export function CocktailsReadyBadge() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [cocktails, setCocktails] = useState<CocktailWithIngredients[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  // Fetch all cocktails with their ingredients
  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const data = await sanityClient.fetch<CocktailWithIngredients[]>(`
          *[_type == "cocktail"] {
            _id,
            "ingredients": ingredients[] {
              "ingredient": ingredient-> { _id }
            }
          }
        `);
        setCocktails(data);
      } catch (error) {
        console.error("Error fetching cocktails for badge:", error);
      } finally {
        setCocktailsLoading(false);
      }
    };

    fetchCocktails();
  }, []);

  // Calculate how many cocktails user can make
  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    const ingredientSet = new Set(ingredientIds);
    let count = 0;

    cocktails.forEach((cocktail) => {
      const requiredIngredients = cocktail.ingredients?.filter(i => i.ingredient) || [];
      if (requiredIngredients.length === 0) return;

      const hasAll = requiredIngredients.every(i => 
        i.ingredient && ingredientSet.has(i.ingredient._id)
      );

      if (hasAll) {
        count++;
      }
    });

    return count;
  }, [cocktails, ingredientIds]);

  // Don't show if not authenticated or still loading or no bar
  if (authLoading || barLoading || cocktailsLoading) {
    return null;
  }

  if (!isAuthenticated || ingredientIds.length === 0) {
    return null;
  }

  if (readyCount === 0) {
    return null;
  }

  return (
    <Link
      href="/mix"
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/20 rounded-full transition-colors group"
      title="View cocktails you can make"
    >
      <span className="text-lg" aria-hidden="true">🍸</span>
      <span className="text-sm font-medium text-lime-400 group-hover:text-lime-300">
        {readyCount} cocktail{readyCount !== 1 ? "s" : ""} ready
      </span>
    </Link>
  );
}

// Compact version for mobile header
export function CocktailsReadyBadgeCompact() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [cocktails, setCocktails] = useState<CocktailWithIngredients[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const data = await sanityClient.fetch<CocktailWithIngredients[]>(`
          *[_type == "cocktail"] {
            _id,
            "ingredients": ingredients[] {
              "ingredient": ingredient-> { _id }
            }
          }
        `);
        setCocktails(data);
      } catch (error) {
        console.error("Error fetching cocktails for badge:", error);
      } finally {
        setCocktailsLoading(false);
      }
    };

    fetchCocktails();
  }, []);

  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    const ingredientSet = new Set(ingredientIds);
    let count = 0;

    cocktails.forEach((cocktail) => {
      const requiredIngredients = cocktail.ingredients?.filter(i => i.ingredient) || [];
      if (requiredIngredients.length === 0) return;

      const hasAll = requiredIngredients.every(i => 
        i.ingredient && ingredientSet.has(i.ingredient._id)
      );

      if (hasAll) {
        count++;
      }
    });

    return count;
  }, [cocktails, ingredientIds]);

  if (authLoading || barLoading || cocktailsLoading || !isAuthenticated || ingredientIds.length === 0 || readyCount === 0) {
    return null;
  }

  return (
    <Link
      href="/mix"
      className="flex items-center justify-center w-8 h-8 bg-lime-500/20 text-lime-400 font-bold text-xs rounded-full"
      title={`${readyCount} cocktails ready`}
    >
      {readyCount}
    </Link>
  );
}


