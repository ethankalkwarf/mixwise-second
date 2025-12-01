interface CocktailBestForCardProps {
  bestFor: string[];
}

export function CocktailBestForCard({ bestFor }: CocktailBestForCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Best For</h3>
      <div className="flex flex-wrap content-start gap-2">
        {bestFor.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

