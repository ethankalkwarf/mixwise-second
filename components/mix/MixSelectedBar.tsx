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
      className="mb-6 p-4 bg-slate-900/80 border border-slate-800 rounded-xl"
      role="region"
      aria-label="Selected ingredients"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-200">
          Selected Ingredients{" "}
          <span className="text-lime-400 font-bold">({selectedIngredients.length})</span>
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm text-slate-500 hover:text-red-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
            className="group flex items-center gap-2 px-3 py-2 bg-lime-500/10 border border-lime-500/30 rounded-lg text-sm font-medium text-lime-100 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50"
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
            <XMarkIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}


