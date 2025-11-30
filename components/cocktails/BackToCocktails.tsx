"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

// Key for storing the cocktails page state
const COCKTAILS_STATE_KEY = "mixwise-cocktails-state";

/**
 * Store the current cocktails page state before navigating away.
 * Call this when clicking on a cocktail card.
 */
export function saveCocktailsState() {
  if (typeof window !== "undefined") {
    // Store the current scroll position and URL
    sessionStorage.setItem(COCKTAILS_STATE_KEY, JSON.stringify({
      scrollY: window.scrollY,
      timestamp: Date.now(),
    }));
  }
}

/**
 * Back to Cocktails link that preserves the user's previous state.
 * Uses browser history.back() to return to the exact previous state.
 */
export function BackToCocktails() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Check if we have meaningful history (more than just the current page)
    // window.history.length > 2 means there's at least one page before this one
    // (1 for new tab, 1 for current page, so > 2 means we came from somewhere)
    setHasHistory(window.history.length > 2);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Always try to go back first - this preserves React state
    if (hasHistory) {
      router.back();
    } else {
      // Fallback: navigate to cocktails page
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
