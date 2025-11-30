"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

/**
 * Back to Cocktails link that preserves the user's previous state.
 * 
 * If the user came from /cocktails (with any filters/search), 
 * clicking this will use browser history to return to that exact state.
 * Otherwise, it links to the base /cocktails page.
 */
export function BackToCocktails() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if we can use browser history to go back to cocktails
    // We check if the referrer contains /cocktails
    const referrer = document.referrer;
    const fromCocktails = referrer.includes("/cocktails") && !referrer.includes("/cocktails/");
    setCanGoBack(fromCocktails);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (canGoBack) {
      // Use browser back to preserve exact state (filters, search, scroll position)
      router.back();
    } else {
      // Navigate to cocktails page
      router.push("/cocktails");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-lime-400 transition-colors group"
    >
      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      Back to cocktails
    </button>
  );
}

