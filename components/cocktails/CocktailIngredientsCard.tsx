import type { SanityCocktailIngredient } from "@/lib/sanityTypes";

interface CocktailIngredientsCardProps {
  ingredients: SanityCocktailIngredient[];
}

export function CocktailIngredientsCard({ ingredients }: CocktailIngredientsCardProps) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-forest mb-6">Ingredients</h2>

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
    </>
  );
}
