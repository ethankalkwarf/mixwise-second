import type { SanityCocktailIngredient } from "@/lib/sanityTypes";

interface CocktailIngredientsCardProps {
  ingredients: SanityCocktailIngredient[];
}

export function CocktailIngredientsCard({ ingredients }: CocktailIngredientsCardProps) {
  return (
    <>
      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>

      <ul className="space-y-4">
        {ingredients.map((item) => (
          <li key={item._key} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-gray-900">
                  {item.ingredient?.name || (item.notes ? `Ingredient (${item.notes})` : "Ingredient")}
                </span>
                <span className="text-gray-600 font-mono text-sm whitespace-nowrap ml-2">
                  {item.amount || "To taste"}
                </span>
              </div>
              {item.notes && (
                <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

