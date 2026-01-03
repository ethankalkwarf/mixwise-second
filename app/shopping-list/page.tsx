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
  const [testClicks, setTestClicks] = useState(0);
  
  // Debug: log on every render
  console.log("[ShoppingListPage] Rendered with", items.length, "items, version: 2026-01-03-v2");

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
    <div className="py-10 min-h-screen bg-botanical-gradient">
      <MainContainer>
        {/* Debug test button - REMOVE AFTER TESTING */}
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-sm mb-2">Debug: Test clicks work (clicks: {testClicks})</p>
          <button 
            onClick={() => {
              console.log("[TEST] Button clicked!");
              setTestClicks(c => c + 1);
              alert("Click worked! Check console for logs.");
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Click
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cocktails"
            className="inline-flex items-center gap-2 text-sm text-sage hover:text-terracotta transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to cocktails
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-forest">Shopping List</h1>
              <p className="text-sage mt-1">
                {itemCount === 0
                  ? "Your shopping list is empty"
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
            <h2 className="text-2xl font-display font-bold text-forest mb-3">No items yet</h2>
            <p className="text-sage mb-8 max-w-md mx-auto leading-relaxed">
              When you find cocktails you want to make, add the missing ingredients to your shopping list.
            </p>
            <Link
              href="/cocktails"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-semibold rounded-2xl transition-all shadow-terracotta hover:shadow-terracotta/50"
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
                className="card overflow-hidden bg-white/80 backdrop-blur-sm border-mist shadow-soft"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-olive/10 to-terracotta/5 border-b border-mist">
                  <h2 className="font-display font-bold text-forest capitalize text-lg">
                    {category.replace(/-/g, " ")}
                  </h2>
                </div>
                <ul className="divide-y divide-mist/50">
                  {categoryItems.map((item) => (
                    <li
                      key={item.ingredient_id}
                      className={`flex items-center justify-between px-6 py-4 transition-all ${
                        item.is_checked ? "bg-cream/50" : "hover:bg-mist/20"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("[Page] Toggle clicked:", item.ingredient_id);
                          alert(`Toggling: ${item.ingredient_name} (${item.ingredient_id})`);
                          toggleItem(item.ingredient_id);
                        }}
                        className="flex items-center gap-4 flex-1 text-left group"
                      >
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.is_checked
                              ? "bg-olive border-olive text-cream shadow-sm"
                              : "border-stone hover:border-olive group-hover:bg-olive/10"
                          }`}
                        >
                          {item.is_checked && <CheckIcon className="w-4 h-4" />}
                        </span>
                        <span
                          className={`text-base font-medium transition-all ${
                            item.is_checked
                              ? "text-sage line-through"
                              : "text-forest group-hover:text-terracotta"
                          }`}
                        >
                          {item.ingredient_name}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("[Page] Remove clicked:", item.ingredient_id);
                          alert(`Removing: ${item.ingredient_name} (${item.ingredient_id})`);
                          removeItem(item.ingredient_id);
                        }}
                        className="p-2 text-sage hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-all"
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
          <div className="mt-8 p-5 bg-gradient-to-r from-olive/10 to-terracotta/5 border border-olive/20 rounded-2xl shadow-soft">
            <p className="text-sm text-sage leading-relaxed">
              <span className="text-olive font-semibold">💡 Tip:</span> Check off items as you shop, or copy the list to share with someone else.
            </p>
          </div>
        )}
      </MainContainer>
    </div>
  );
}





