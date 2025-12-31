"use client";

import type { MixIngredient } from "@/lib/mixTypes";

type CategoryInfo = {
  key: string;
  label: string;
  icon: string;
  description: string;
  color: string;
};

const CATEGORIES: CategoryInfo[] = [
  {
    key: "Spirit",
    label: "Spirits",
    icon: "🥃",
    description: "Base spirits for your cocktails",
    color: "bg-terracotta/20 border-terracotta/30",
  },
  {
    key: "Liqueur",
    label: "Liqueurs",
    icon: "🍸",
    description: "Sweet and flavored spirits",
    color: "bg-forest/20 border-forest/30",
  },
  {
    key: "Amaro",
    label: "Amaro",
    icon: "🍶",
    description: "Italian herbal liqueurs and digestives",
    color: "bg-sage/20 border-sage/30",
  },
  {
    key: "Wine & Beer",
    label: "Wine & Beer",
    icon: "🍷",
    description: "Wines, beers, and sparkling beverages",
    color: "bg-terracotta/20 border-terracotta/30",
  },
  {
    key: "Mixer",
    label: "Mixers",
    icon: "🥤",
    description: "Non-alcoholic mixers",
    color: "bg-olive/20 border-olive/30",
  },
  {
    key: "Citrus",
    label: "Citrus",
    icon: "🍋",
    description: "Fresh citrus juices",
    color: "bg-terracotta/30 border-terracotta/40",
  },
  {
    key: "Bitters",
    label: "Bitters",
    icon: "💧",
    description: "Aromatic bitters and tinctures",
    color: "bg-sage/30 border-sage/40",
  },
  {
    key: "Syrup",
    label: "Syrups",
    icon: "🍯",
    description: "Sweet syrups and cordials",
    color: "bg-olive/30 border-olive/40",
  },
];

type Props = {
  ingredients: MixIngredient[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
};

export function CategoryPicker({
  ingredients,
  selectedCategory,
  onSelectCategory,
  className = "",
}: Props) {
  // Count ingredients per category
  const categoryCounts = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category || "Garnish";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter out categories that don't exist in our CATEGORIES list
  const validCategoryCounts: Record<string, number> = {};
  CATEGORIES.forEach(cat => {
    if (categoryCounts[cat.key]) {
      validCategoryCounts[cat.key] = categoryCounts[cat.key];
    }
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h2 className="text-xl font-display font-bold text-forest mb-2">
          What's in Your Cellar?
        </h2>
        <p className="text-sage">
          Explore our curated categories to build your collection
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((category) => {
          const count = validCategoryCounts[category.key] || 0;
          const isSelected = selectedCategory === category.key;

          return (
            <button
              key={category.key}
              onClick={() => onSelectCategory(isSelected ? null : category.key)}
              className={`p-4 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
                isSelected
                  ? `${category.color} border-terracotta shadow-lg scale-105`
                  : "bg-white border-mist hover:border-sage hover:bg-cream"
              }`}
              data-category={category.key}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold truncate ${
                      isSelected ? "text-terracotta" : "text-forest"
                    }`}
                  >
                    {category.label}
                  </div>
                  <div className="text-xs text-sage">
                    {count} ingredient{count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <p className="text-xs text-sage leading-tight">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="text-center">
          <button
            onClick={() => onSelectCategory(null)}
            className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
          >
            ← Back to categories
          </button>
        </div>
      )}
    </div>
  );
}
