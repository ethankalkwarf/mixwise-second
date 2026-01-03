"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useShoppingList } from "@/hooks/useShoppingList";

export function ShoppingListBadge() {
  const { itemCount, isLoading } = useShoppingList();

  if (isLoading) {
    return null;
  }

  return (
    <Link
      href="/shopping-list"
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sage hover:text-forest hover:bg-mist/50 transition-colors group"
      title="Shopping list"
      aria-label={`Shopping list${itemCount > 0 ? ` with ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
    >
      <div className="relative">
        <ShoppingBagIcon className="w-5 h-5" />
        {itemCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full bg-terracotta text-cream"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
      {/* Show text label on larger screens for better discoverability */}
      <span className="hidden lg:inline text-sm font-medium">
        {itemCount > 0 ? `Shopping List (${itemCount})` : "Shopping List"}
      </span>
    </Link>
  );
}
