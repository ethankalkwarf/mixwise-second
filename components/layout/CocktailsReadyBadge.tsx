"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { getMixCocktailsClient, getMixIngredients } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixCocktail, MixIngredient } from "@/lib/mixTypes";

export function CocktailsReadyBadge() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [cocktails, setCocktails] = useState<MixCocktail[]>([]);
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  // Fetch all cocktails and ingredients (same as dashboard)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cocktailsData, ingredientsData] = await Promise.all([
          getMixCocktailsClient(),
          getMixIngredients(),
        ]);
        setCocktails(cocktailsData);
        setAllIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching cocktails for badge:", error);
      } finally {
        setCocktailsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate staple IDs (same logic as dashboard)
  const stapleIds = useMemo(() => {
    if (allIngredients.length === 0) {
      return ["ice", "water"]; // Default while loading
    }
    const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
    const manualStaples = ['ice', 'water'];
    return [...new Set([...dbStaples, ...manualStaples])];
  }, [allIngredients]);

  // Calculate how many cocktails user can make (using same logic as dashboard)
  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    // Filter out cocktails with no ingredients
    const validCocktails = cocktails.filter(cocktail => 
      cocktail && 
      cocktail.ingredients && 
      Array.isArray(cocktail.ingredients) && 
      cocktail.ingredients.length > 0
    );

    // Use the same matching logic as dashboard
    const { ready } = getMixMatchGroups({
      cocktails: validCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });

    return ready.length;
  }, [cocktails, ingredientIds, stapleIds]);

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
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-olive/10 hover:bg-olive/20 border border-olive/20 rounded-full transition-colors group"
      title="View cocktails you can make"
    >
      <span className="text-lg" aria-hidden="true">🍸</span>
      <span className="text-sm font-medium text-olive group-hover:text-forest">
        {readyCount} cocktail{readyCount !== 1 ? "s" : ""} ready
      </span>
    </Link>
  );
}

// Compact version for mobile header
export function CocktailsReadyBadgeCompact() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [cocktails, setCocktails] = useState<MixCocktail[]>([]);
  const [allIngredients, setAllIngredients] = useState<MixIngredient[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cocktailsData, ingredientsData] = await Promise.all([
          getMixCocktailsClient(),
          getMixIngredients(),
        ]);
        setCocktails(cocktailsData);
        setAllIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching cocktails for badge:", error);
      } finally {
        setCocktailsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate staple IDs (same logic as dashboard)
  const stapleIds = useMemo(() => {
    if (allIngredients.length === 0) {
      return ["ice", "water"]; // Default while loading
    }
    const dbStaples = allIngredients.filter((i) => i?.isStaple).map((i) => i?.id).filter(Boolean);
    const manualStaples = ['ice', 'water'];
    return [...new Set([...dbStaples, ...manualStaples])];
  }, [allIngredients]);

  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    // Filter out cocktails with no ingredients
    const validCocktails = cocktails.filter(cocktail => 
      cocktail && 
      cocktail.ingredients && 
      Array.isArray(cocktail.ingredients) && 
      cocktail.ingredients.length > 0
    );

    // Use the same matching logic as dashboard
    const { ready } = getMixMatchGroups({
      cocktails: validCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: stapleIds,
    });

    return ready.length;
  }, [cocktails, ingredientIds, stapleIds]);

  if (authLoading || barLoading || cocktailsLoading || !isAuthenticated || ingredientIds.length === 0 || readyCount === 0) {
    return null;
  }

  return (
    <Link
      href="/mix"
      className="flex items-center justify-center w-8 h-8 bg-olive/20 text-olive font-bold text-xs rounded-full"
      title={`${readyCount} cocktails ready`}
    >
      {readyCount}
    </Link>
  );
}
