"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  ShoppingCartIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/components/auth/UserProvider";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useShoppingList } from "@/hooks/useShoppingList";

type TheirIngredient = {
  ingredient_id: string;
  ingredient_name: string | null;
  ingredient_category?: string | null;
};

export function PublicBarCompare({
  displayName,
  theirIngredients,
}: {
  displayName: string;
  theirIngredients: TheirIngredient[];
}) {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openPreferredAuthDialog } = useAuthDialog();
  const { ingredientIds, isLoading: barLoading } = useBarIngredients();
  const { addItems } = useShoppingList();
  const [adding, setAdding] = useState(false);

  const comparison = useMemo(() => {
    const mine = new Set(ingredientIds.map(String));
    const shared: TheirIngredient[] = [];
    const missing: TheirIngredient[] = [];

    for (const ing of theirIngredients) {
      const id = String(ing.ingredient_id);
      if (!id) continue;
      if (mine.has(id)) shared.push(ing);
      else missing.push(ing);
    }

    return {
      sharedCount: shared.length,
      missingCount: missing.length,
      missing: missing.slice(0, 24),
      allMissing: missing,
    };
  }, [theirIngredients, ingredientIds]);

  if (authLoading || barLoading) {
    return (
      <div className="card p-6 text-sage text-sm">Comparing bars…</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="card p-6 border-olive/20 bg-olive/5">
        <h3 className="text-lg font-serif font-bold text-forest mb-2">
          Compare to your bar
        </h3>
        <p className="text-sage text-sm mb-4">
          Sign in to see which of {displayName}&apos;s bottles you already have —
          and what&apos;s missing.
        </p>
        <button
          type="button"
          onClick={() =>
            openPreferredAuthDialog({
              gate: "bar_compare",
              title: "Compare bars",
              subtitle: "Sign in to see overlap with your home bar.",
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-olive hover:bg-olive-dark text-cream rounded-xl text-sm font-medium"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Sign in to compare
        </button>
      </div>
    );
  }

  if (ingredientIds.length === 0) {
    return (
      <div className="card p-6 border-olive/20 bg-olive/5">
        <h3 className="text-lg font-serif font-bold text-forest mb-2">
          Compare to your bar
        </h3>
        <p className="text-sage text-sm mb-4">
          Add bottles to your bar first, then see how you stack up against{" "}
          {displayName}.
        </p>
        <Link
          href="/mix"
          className="inline-flex items-center gap-2 px-4 py-2 bg-olive hover:bg-olive-dark text-cream rounded-xl text-sm font-medium"
        >
          Build my bar
        </Link>
      </div>
    );
  }

  const handleAddMissing = async () => {
    if (comparison.allMissing.length === 0) return;
    setAdding(true);
    try {
      await addItems(
        comparison.allMissing.map((ing) => ({
          id: String(ing.ingredient_id),
          name: ing.ingredient_name || "Ingredient",
          category: ing.ingredient_category || undefined,
        }))
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card p-6 border-olive/20 bg-olive/5 space-y-4">
      <div>
        <h3 className="text-lg font-serif font-bold text-forest mb-1">
          You vs {displayName}
        </h3>
        <p className="text-sage text-sm">
          <span className="font-semibold text-forest">{comparison.sharedCount}</span> bottles
          in common
          {comparison.missingCount > 0 ? (
            <>
              {" · "}
              <span className="font-semibold text-forest">{comparison.missingCount}</span>{" "}
              you don&apos;t have
            </>
          ) : (
            " — you cover their whole bar"
          )}
        </p>
      </div>

      {comparison.missing.length > 0 && (
        <>
          <ul className="flex flex-wrap gap-2">
            {comparison.missing.map((ing) => (
              <li
                key={ing.ingredient_id}
                className="px-2.5 py-1 rounded-lg bg-white/80 border border-mist text-sm text-forest"
              >
                {ing.ingredient_name || "Bottle"}
              </li>
            ))}
            {comparison.missingCount > comparison.missing.length && (
              <li className="px-2.5 py-1 text-sm text-sage">
                +{comparison.missingCount - comparison.missing.length} more
              </li>
            )}
          </ul>
          <button
            type="button"
            disabled={adding}
            onClick={handleAddMissing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {adding ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ShoppingCartIcon className="w-4 h-4" />
            )}
            {adding ? "Adding…" : "Add missing to shopping list"}
          </button>
        </>
      )}

      {comparison.missingCount === 0 && (
        <p className="text-sm text-olive flex items-center gap-2">
          <CheckIcon className="w-4 h-4" />
          Nice — you already stock everything in their bar.
        </p>
      )}
    </div>
  );
}
