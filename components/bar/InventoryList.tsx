interface InventoryItem {
  ingredient_id: string;
  ingredient_name: string | null;
}

interface InventoryListProps {
  ingredients: InventoryItem[];
  title?: string;
  emptyMessage?: string;
}

export function InventoryList({
  ingredients,
  title = "Bar Ingredients",
  emptyMessage = "No ingredients in this bar yet."
}: InventoryListProps) {
  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🥃</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-forest mb-2">
          {title}
        </h3>
        <p className="text-sage">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Group ingredients by first letter for better organization
  const groupedIngredients = ingredients.reduce((acc, ing) => {
    const firstLetter = ing.ingredient_name?.[0]?.toUpperCase() || 'Other';
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(ing);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-olive/10 rounded-full flex items-center justify-center">
          <span className="text-olive text-lg">🥃</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-forest">
          {title} ({ingredients.length})
        </h3>
      </div>

      {Object.entries(groupedIngredients)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, groupIngredients]) => (
          <div key={letter}>
            <h4 className="text-lg font-semibold text-forest mb-3 border-b border-mist pb-2">
              {letter}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {groupIngredients.map((ingredient) => (
                <div
                  key={ingredient.ingredient_id}
                  className="p-3 bg-cream/30 rounded-lg border border-mist hover:bg-cream/50 transition-colors"
                >
                  <span className="text-sm font-medium text-forest text-center block">
                    {ingredient.ingredient_name || ingredient.ingredient_id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
