"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useBarIngredients } from "@/hooks/useBarIngredients";
import { getMixCocktailsClient } from "@/lib/cocktails";
import { getMixMatchGroups } from "@/lib/mixMatching";
import type { MixCocktail } from "@/lib/mixTypes";
import { hasSeenFirstWin, notifyFirstWin } from "@/lib/mobile/firstWin";
import { cacheCabinetReadyCount } from "@/lib/mobile/guestData";

/**
 * One-time celebration when the guest unlocks their first pourable drink.
 */
export function NativeFirstWinCelebration() {
  const router = useRouter();
  const { ingredientIds } = useBarIngredients();
  const [mixCocktails, setMixCocktails] = useState<MixCocktail[]>([]);
  const [visible, setVisible] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const prevReady = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    getMixCocktailsClient()
      .then(setMixCocktails)
      .catch(() => {});
  }, []);

  const ready = useMemo(() => {
    if (ingredientIds.length === 0 || mixCocktails.length === 0) return 0;
    return getMixMatchGroups({
      cocktails: mixCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: ["ice", "water"],
    }).ready.length;
  }, [ingredientIds, mixCocktails]);

  useEffect(() => {
    cacheCabinetReadyCount(ready);

    if (ready > 0 && prevReady.current === 0 && !hasSeenFirstWin()) {
      setReadyCount(ready);
      setVisible(true);
      notifyFirstWin(ready);
    }
    prevReady.current = ready;
  }, [ready]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-charcoal/40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]">
      <div
        className="relative w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-charcoal/20"
        role="dialog"
        aria-labelledby="first-win-title"
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-mist/60 text-sage"
          aria-label="Close"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10">
          <SparklesIcon className="h-7 w-7 text-terracotta" />
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta">
          First win
        </p>
        <h2 id="first-win-title" className="mt-1 text-center font-display text-2xl font-bold text-forest">
          You can pour {readyCount} drink{readyCount === 1 ? "" : "s"}
        </h2>
        <p className="mt-2 text-center text-sm text-sage">
          Your cabinet is working. Pick one tonight — or shake your phone on Home for a random pour.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              router.push("/mix");
            }}
            className="flex-1 rounded-2xl bg-terracotta py-3 text-sm font-bold text-cream"
          >
            See my menu
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-2xl px-4 py-3 text-sm font-medium text-sage"
          >
            Nice
          </button>
        </div>
      </div>
    </div>
  );
}
