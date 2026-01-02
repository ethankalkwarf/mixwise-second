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
      className="relative p-2 rounded-xl text-sage hover:text-forest hover:bg-mist/50 transition-colors"
      title="Shopping list"
      aria-label={`Shopping list${itemCount > 0 ? ` with ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
    >
      <ShoppingBagIcon className="w-5 h-5" />
      <span
        className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full ${
          itemCount > 0
            ? "bg-terracotta text-cream"
            : "bg-mist text-sage border border-stone/20"
        }`}
      >
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </Link>
  );
}
