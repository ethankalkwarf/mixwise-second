"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PARTY_PRESETS } from "@/lib/scaleRecipe";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 24,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) onQuantityChange(quantity - 1);
  };

  const increase = () => {
    if (quantity < max) onQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-sage whitespace-nowrap">Drinks</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={decrease}
            disabled={quantity <= min}
            className="p-2 rounded-lg border border-mist hover:bg-mist/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease drinks"
          >
            <MinusIcon className="w-4 h-4 text-forest" />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-14 text-center px-2 py-1.5 border border-mist rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta font-medium text-sm text-forest bg-cream"
            aria-label="Number of drinks"
          />

          <button
            type="button"
            onClick={increase}
            disabled={quantity >= max}
            className="p-2 rounded-lg border border-mist hover:bg-mist/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase drinks"
          >
            <PlusIcon className="w-4 h-4 text-forest" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PARTY_PRESETS.filter((n) => n >= min && n <= max).map((preset) => {
          const active = quantity === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onQuantityChange(preset)}
              className={`min-w-[2.25rem] px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? "bg-terracotta/15 border-terracotta/40 text-terracotta"
                  : "bg-cream border-mist text-sage hover:border-stone hover:text-forest"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {quantity >= 6 && (
        <p className="text-xs text-sage leading-relaxed">
          Batch mode: scale into a pitcher, chill, then pour over fresh ice to serve.
        </p>
      )}
    </div>
  );
}
