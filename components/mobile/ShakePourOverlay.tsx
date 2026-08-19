"use client";

import { formatCocktailName } from "@/lib/formatters";
import { ShakePourGlass } from "@/components/mobile/ShakePourGlass";

export type ShakeOverlayMode = "intro" | "listening" | "result";

interface ShakePourOverlayProps {
  mode: ShakeOverlayMode | null;
  picked: { name: string; imageUrl: string | null } | null;
  fromCabinet: boolean;
  motionDenied?: boolean;
  enabling?: boolean;
  onCancel: () => void;
  onEnableShake: () => void;
  onPickNow: () => void;
}

export function ShakePourOverlay({
  mode,
  picked,
  fromCabinet,
  motionDenied = false,
  enabling = false,
  onCancel,
  onEnableShake,
  onPickNow,
}: ShakePourOverlayProps) {
  if (!mode) return null;

  return (
    <div className="mw-pour-overlay">
      <div className="mw-pour-overlay__glow" />
      <button
        type="button"
        onClick={onCancel}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full px-3 py-1.5 text-sm font-semibold text-cream active:opacity-70"
      >
        Cancel
      </button>

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-5">
        {mode === "intro" ? (
          <div className="w-full max-w-sm rounded-[1.75rem] bg-cream px-6 pb-7 pt-5 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto mb-1 flex h-[7.5rem] w-[7.5rem] items-end justify-center overflow-hidden rounded-full bg-[#12100e]">
              <ShakePourGlass phase="idle" className="h-[7.25rem] w-[5.25rem]" />
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-forest">
              Shake to pour
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-charcoal/85">
              We&apos;ll pick a random recipe when you shake your phone. Tap enable, then give it a good shake.
            </p>
            <button
              type="button"
              onClick={onEnableShake}
              disabled={enabling}
              className="mt-6 w-full rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-cream shadow-lg shadow-terracotta/25 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {enabling ? "Enabling…" : "Enable shake"}
            </button>
            <button
              type="button"
              onClick={onPickNow}
              className="mt-3 w-full py-2.5 text-sm font-semibold text-sage"
            >
              Pick one for me instead
            </button>
          </div>
        ) : mode === "result" && picked ? (
          <div className="flex w-full max-w-sm flex-col items-center text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              {fromCabinet ? "From your cabinet" : "Ready to pour"}
            </p>
            <ShakePourGlass
              phase="poured"
              imageUrl={picked.imageUrl}
              className="mt-3 h-[19rem] w-[13.5rem]"
            />
            <h2 className="mt-1 font-display text-3xl font-bold leading-tight text-cream">
              {formatCocktailName(picked.name)}
            </h2>
            <p className="mt-2 text-base font-medium text-cream/80">Opening recipe…</p>
          </div>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center text-center">
            <ShakePourGlass phase="filling" className="h-[19rem] w-[13.5rem]" />
            <h2 className="mt-1 font-display text-[1.75rem] font-bold leading-tight text-cream">
              Shake your phone
            </h2>
            <p className="mt-3 max-w-[18rem] text-[17px] font-medium leading-relaxed text-cream/90">
              {motionDenied
                ? "Shake needs a physical iPhone — the Simulator has no motion sensor. Tap below to pick a recipe."
                : "Give it a good shake — we’ll pour a random recipe."}
            </p>
            {!motionDenied ? (
              <p className="mt-2 text-sm font-medium text-cream/70">The glass is filling…</p>
            ) : null}
            <button
              type="button"
              onClick={onPickNow}
              className="mt-7 rounded-2xl bg-terracotta px-6 py-3.5 text-base font-bold text-cream shadow-lg shadow-terracotta/30 active:scale-[0.98] transition-transform"
            >
              Pick one for me
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
