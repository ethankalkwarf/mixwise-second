"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  label = "servings"
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={decrease}
          disabled={quantity <= min}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="w-4 h-4" />
        </button>

        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-16 text-center px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
          aria-label={`Number of ${label}`}
        />

        <button
          onClick={increase}
          disabled={quantity >= max}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
