import type { SanityCocktailIngredient } from "@/lib/sanityTypes";

interface IngredientCardProps {
  ingredients: SanityCocktailIngredient[];
}

export function IngredientCard({ ingredients }: IngredientCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-mist p-6">
      <h3 className="text-xl font-display font-bold text-forest mb-6">
        Ingredients
      </h3>

      <ul className="space-y-4">
        {ingredients.map((item) => (
          <li key={item._key} className="flex items-center justify-between">
            <span className="font-medium text-forest">
              {item.ingredient?.name || (item.notes ? `Ingredient (${item.notes})` : "Ingredient")}
            </span>
            <span className="text-sage font-mono text-sm whitespace-nowrap">
              {item.amount || "To taste"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

