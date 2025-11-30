"use client";

import { useState } from "react";
import { MainContainer } from "@/components/layout/MainContainer";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/components/ui/toast";
import {
  CheckIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
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
  const toast = useToast();
  const [copied, setCopied] = useState(false);

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

  const groupedItems = getItemsByCategory();
  const hasChecked = items.some((i) => i.is_checked);

  return (
    <div className="py-10 min-h-screen">
      <MainContainer>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cocktails"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-lime-400 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to cocktails
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-50">Shopping List</h1>
              <p className="text-slate-400 mt-1">
                {itemCount === 0
                  ? "Your shopping list is empty"
                  : `${uncheckedCount} of ${itemCount} item${itemCount !== 1 ? "s" : ""} remaining`}
              </p>
            </div>
            {itemCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy list"}
                </button>
                {hasChecked && (
                  <button
                    onClick={clearChecked}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Clear done
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
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
              <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-6">
                <div className="h-5 bg-slate-700 rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-48" />
                  <div className="h-4 bg-slate-700 rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && itemCount === 0 && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">No items yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              When you find cocktails you want to make, add the missing ingredients to your shopping list.
            </p>
            <Link
              href="/cocktails"
              className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold rounded-lg transition-colors"
            >
              Browse cocktails
            </Link>
          </div>
        )}

        {/* Items by category */}
        {!isLoading && itemCount > 0 && (
          <div className="space-y-6">
            {Array.from(groupedItems.entries()).map(([category, categoryItems]) => (
              <div
                key={category}
                className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
                  <h2 className="font-semibold text-slate-200 capitalize">
                    {category.replace(/-/g, " ")}
                  </h2>
                </div>
                <ul className="divide-y divide-slate-700/50">
                  {categoryItems.map((item) => (
                    <li
                      key={item.ingredient_id}
                      className={`flex items-center justify-between px-5 py-4 transition-colors ${
                        item.is_checked ? "bg-slate-800/20" : "hover:bg-slate-800/30"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.ingredient_id)}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.is_checked
                              ? "bg-lime-500 border-lime-500 text-slate-900"
                              : "border-slate-600 hover:border-slate-500"
                          }`}
                        >
                          {item.is_checked && <CheckIcon className="w-4 h-4" />}
                        </span>
                        <span
                          className={`text-base transition-colors ${
                            item.is_checked
                              ? "text-slate-500 line-through"
                              : "text-slate-200"
                          }`}
                        >
                          {item.ingredient_name}
                        </span>
                      </button>
                      <button
                        onClick={() => removeItem(item.ingredient_id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${item.ingredient_name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        {!isLoading && itemCount > 0 && (
          <div className="mt-8 p-4 bg-lime-500/5 border border-lime-500/20 rounded-xl">
            <p className="text-sm text-slate-400">
              <span className="text-lime-400 font-medium">Tip:</span> Check off items as you shop, or copy the list to share with someone else.
            </p>
          </div>
        )}
      </MainContainer>
    </div>
  );
}


