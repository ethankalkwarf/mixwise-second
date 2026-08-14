"use client";

import { useState } from "react";
import { MainContainer } from "@/components/layout/MainContainer";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { useToast } from "@/components/ui/toast";
import { formatIngredientCategory } from "@/lib/formatters";
import {
  CheckIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ShoppingListPage() {
  const {
    items,
    isLoading,
    itemCount,
    uncheckedCount,
    toggleItem,
    removeItem,
    clearChecked,
    clearAll,
    getItemsByCategory,
    copyAsText,
  } = useShoppingList();
  const { ingredientIds, addIngredient } = useBarIngredients();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyAsText());
      setCopied(true);
      toast.success("Shopping list copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleAddToBar = async (item: { ingredient_id: string; ingredient_name: string }) => {
    setAddingId(item.ingredient_id);
    try {
      await addIngredient(item.ingredient_id, item.ingredient_name);
      await removeItem(item.ingredient_id);
      toast.success(`${item.ingredient_name} added to your bar`);
    } catch (err) {
      console.error("Failed to add shopping item to bar:", err);
      toast.error(`Couldn't add ${item.ingredient_name} to your bar`);
    } finally {
      setAddingId(null);
    }
  };

  const groupedItems = getItemsByCategory();
  const hasChecked = items.some((i) => i.is_checked);

  return (
    <div className="py-10 min-h-screen bg-botanical-gradient">
      <MainContainer>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/mix"
            className="inline-flex items-center gap-2 text-sm text-sage hover:text-terracotta transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Mix
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-forest">Shopping List</h1>
              <p className="text-sage mt-1">
                {itemCount === 0
                  ? "Bottles you're missing for drinks you want to make"
                  : `${uncheckedCount} of ${itemCount} item${itemCount !== 1 ? "s" : ""} remaining`}
              </p>
            </div>
            {itemCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-mist hover:bg-mist text-forest rounded-xl transition-colors font-medium text-sm"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy list"}
                </button>
                {hasChecked && (
                  <button
                    onClick={clearChecked}
                    className="flex items-center gap-2 px-4 py-2 bg-cream hover:bg-mist text-sage hover:text-forest rounded-xl transition-colors font-medium text-sm border border-mist"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Clear done
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-terracotta/10 hover:bg-terracotta/20 text-terracotta rounded-xl transition-colors font-medium text-sm border border-terracotta/20"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="h-5 bg-mist rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-mist rounded w-48" />
                  <div className="h-4 bg-mist rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && itemCount === 0 && (
          <div className="card p-12 text-center bg-white/80 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-olive/10 rounded-full flex items-center justify-center border-2 border-olive/20">
              <ShoppingBagIcon className="w-10 h-10 text-olive" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest mb-3">Nothing to pick up</h2>
            <p className="text-sage mb-6 max-w-md mx-auto leading-relaxed">
              This list is for bottles you need to make a drink you&apos;re close to mixing. Add missing ingredients from a recipe or Mix, then tap &ldquo;I have this&rdquo; when they&apos;re in the cabinet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mix"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold rounded-2xl transition-all shadow-terracotta hover:shadow-terracotta/50"
              >
                See what you&apos;re missing
              </Link>
              <Link
                href="/cocktails"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-mist hover:border-stone text-forest font-semibold rounded-2xl transition-all"
              >
                Browse cocktails
              </Link>
            </div>
          </div>
        )}

        {/* Items by category */}
        {!isLoading && itemCount > 0 && (
          <div className="space-y-6">
            {Array.from(groupedItems.entries()).map(([category, categoryItems]) => (
              <div
                key={category}
                className="card overflow-hidden bg-white/80 backdrop-blur-sm border-mist shadow-soft"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-olive/10 to-terracotta/5 border-b border-mist">
                  <h2 className="font-display font-bold text-forest capitalize text-lg">
                    {formatIngredientCategory(category.replace(/-/g, " "))}
                  </h2>
                </div>
                <ul className="divide-y divide-mist/50">
                  {categoryItems.map((item) => {
                    const alreadyInBar = ingredientIds.includes(item.ingredient_id);
                    return (
                    <li
                      key={item.ingredient_id}
                      className={`flex items-center justify-between gap-3 px-6 py-4 transition-all ${
                        item.is_checked ? "bg-cream/50" : "hover:bg-mist/20"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.ingredient_id)}
                        className="flex items-center gap-4 flex-1 text-left group min-w-0"
                      >
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            item.is_checked
                              ? "bg-olive border-olive text-cream shadow-sm"
                              : "border-stone hover:border-olive group-hover:bg-olive/10"
                          }`}
                        >
                          {item.is_checked && <CheckIcon className="w-4 h-4" />}
                        </span>
                        <span
                          className={`text-base font-medium transition-all truncate ${
                            item.is_checked
                              ? "text-sage line-through"
                              : "text-forest group-hover:text-terracotta"
                          }`}
                        >
                          {item.ingredient_name}
                        </span>
                      </button>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {alreadyInBar ? (
                          <span className="text-xs font-medium text-olive px-2 py-1">In your bar</span>
                        ) : (
                          <button
                            onClick={() => handleAddToBar(item)}
                            disabled={addingId === item.ingredient_id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-olive/10 hover:bg-olive/20 text-olive rounded-lg transition-colors disabled:opacity-50"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            {addingId === item.ingredient_id ? "Adding..." : "I have this"}
                          </button>
                        )}
                        <button
                          onClick={() => removeItem(item.ingredient_id)}
                          className="p-2 text-sage hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-all"
                          aria-label={`Remove ${item.ingredient_name}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        {!isLoading && itemCount > 0 && (
          <div className="mt-8 p-5 bg-gradient-to-r from-olive/10 to-terracotta/5 border border-olive/20 rounded-2xl shadow-soft">
            <p className="text-sm text-sage leading-relaxed">
              <span className="text-olive font-semibold">Bought it?</span> Tap &ldquo;I have this&rdquo; to add it to your bar and unlock the drinks that were one bottle away.
            </p>
          </div>
        )}
      </MainContainer>
    </div>
  );
}
