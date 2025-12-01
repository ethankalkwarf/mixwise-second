import { IngredientAvailability } from "./IngredientAvailability";
import type { SanityCocktailIngredient } from "@/lib/sanityTypes";

interface IngredientCardProps {
  ingredients: SanityCocktailIngredient[];
  garnish?: string;
}

export function IngredientCard({ ingredients, garnish }: IngredientCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-card border border-mist overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-display font-bold text-forest mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center text-sm">🌿</span>
          Ingredients
        </h2>

        <ul className="space-y-4">
          {ingredients.map((item) => (
            <li key={item._key} className="group">
              <div className="flex items-baseline justify-between border-b border-mist border-dashed pb-1">
                <span className="font-medium text-forest text-lg order-2 group-hover:text-terracotta transition-colors">
                  {item.ingredient?.name || "Unknown Ingredient"}
                </span>
                <span className="text-sage font-mono text-sm order-1 whitespace-nowrap mr-4">
                  {item.amount || "To taste"}
                </span>
              </div>
              {item.notes && (
                <p className="text-xs text-sage mt-1 italic pl-1">
                  Note: {item.notes}
                </p>
              )}
            </li>
          ))}
          
          {garnish && (
            <li className="pt-4 mt-4 border-t border-mist">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-forest text-lg order-2">
                  {garnish}
                </span>
                <span className="text-terracotta font-bold text-xs uppercase tracking-widest order-1 mr-4">
                  Garnish
                </span>
              </div>
            </li>
          )}
        </ul>

        {/* Availability Checker */}
        <div className="mt-8 pt-6 border-t border-mist">
          <IngredientAvailability ingredients={ingredients} />
        </div>
      </div>
      
      {/* Tools Section (Static for now, could be dynamic later) */}
      <div className="bg-mist/30 p-6 border-t border-mist">
        <h3 className="text-xs font-bold text-sage uppercase tracking-widest mb-3">
          Essential Tools
        </h3>
        <div className="flex flex-wrap gap-2">
          {["Shaker", "Jigger", "Strainer"].map((tool) => (
            <span key={tool} className="px-3 py-1.5 bg-white border border-mist rounded-lg text-sm text-forest font-medium shadow-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

