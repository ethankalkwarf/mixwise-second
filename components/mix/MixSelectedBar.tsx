"use client";

import type { MixIngredient } from "@/lib/mixTypes";
import { XMarkIcon } from "@heroicons/react/20/solid";

type Props = {
  selectedIngredients: MixIngredient[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

export function MixSelectedBar({ selectedIngredients, onRemove, onClearAll }: Props) {
  return (
    <div 
      className="mb-6 p-4 bg-white border border-mist rounded-2xl shadow-soft"
      role="region"
      aria-label="Selected ingredients"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-forest">
          Selected Ingredients{" "}
          <span className="text-olive font-bold">({selectedIngredients.length})</span>
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm text-sage hover:text-terracotta transition-colors font-medium px-3 py-1.5 rounded-xl hover:bg-terracotta/10 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
          aria-label="Clear all selected ingredients"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2" role="list">
        {selectedIngredients.map((ingredient) => (
          <button
            key={ingredient.id}
            onClick={() => onRemove(ingredient.id)}
            className="group flex items-center gap-2 px-3 py-2 bg-olive/10 border border-olive/30 rounded-full text-sm font-medium text-forest hover:bg-terracotta/10 hover:border-terracotta/30 hover:text-terracotta transition-all focus:outline-none focus:ring-2 focus:ring-olive/50"
            aria-label={`Remove ${ingredient.name} from selection`}
            role="listitem"
          >
            {ingredient.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={ingredient.imageUrl} 
                alt=""
                className="w-5 h-5 object-contain"
                aria-hidden="true"
              />
            ) : (
              <span className="text-sm" aria-hidden="true">🥃</span>
            )}
            <span>{ingredient.name}</span>
            <XMarkIcon className="w-4 h-4 text-sage group-hover:text-terracotta transition-colors" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
