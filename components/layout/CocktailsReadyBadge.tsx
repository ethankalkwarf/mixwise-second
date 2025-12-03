"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/components/auth/UserProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { createClient } from "@/lib/supabase/client";

interface CocktailWithIngredients {
  id: string;
  ingredients?: Array<{
    id?: string | null;
    name?: string | null;
  }>;
}

export function CocktailsReadyBadge() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const [cocktails, setCocktails] = useState<CocktailWithIngredients[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  // Fetch all cocktails with their ingredients
  useEffect(() => {
    fetchCocktailsWithIngredients()
      .then(setCocktails)
      .catch((error) => console.error("Error fetching cocktails for badge:", error))
      .finally(() => setCocktailsLoading(false));
  }, []);

  // Calculate how many cocktails user can make
  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    const ingredientSet = new Set(ingredientIds);
    let count = 0;

    cocktails.forEach((cocktail) => {
      const requiredIngredients = (cocktail.ingredients || []).map(getIngredientKey).filter(Boolean) as string[];
      if (requiredIngredients.length === 0) return;

      const hasAll = requiredIngredients.every((key) => ingredientSet.has(key));

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
  const [cocktails, setCocktails] = useState<CocktailWithIngredients[]>([]);
  const [cocktailsLoading, setCocktailsLoading] = useState(true);

  useEffect(() => {
    fetchCocktailsWithIngredients()
      .then(setCocktails)
      .catch((error) => console.error("Error fetching cocktails for badge:", error))
      .finally(() => setCocktailsLoading(false));
  }, []);

  const readyCount = useMemo(() => {
    if (ingredientIds.length === 0 || cocktails.length === 0) {
      return 0;
    }

    const ingredientSet = new Set(ingredientIds);
    let count = 0;

    cocktails.forEach((cocktail) => {
      const requiredIngredients = (cocktail.ingredients || []).map(getIngredientKey).filter(Boolean) as string[];
      if (requiredIngredients.length === 0) return;

      const hasAll = requiredIngredients.every((key) => ingredientSet.has(key));

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
      className="flex items-center justify-center w-8 h-8 bg-olive/20 text-olive font-bold text-xs rounded-full"
      title={`${readyCount} cocktails ready`}
    >
      {readyCount}
    </Link>
  );
}

async function fetchCocktailsWithIngredients(): Promise<CocktailWithIngredients[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("id, ingredients");

  if (error) {
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    ingredients: Array.isArray(row.ingredients)
      ? (row.ingredients as Array<{ id?: string; name?: string }>)
      : [],
  }));
}

function getIngredientKey(ingredient: { id?: string | null; name?: string | null }): string | null {
  if (ingredient.id) return ingredient.id;
  if (!ingredient.name) return null;
  return ingredient.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
