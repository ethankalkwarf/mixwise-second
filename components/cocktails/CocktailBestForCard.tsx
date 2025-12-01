interface CocktailBestForCardProps {
  bestFor: string[];
}

export function CocktailBestForCard({ bestFor }: CocktailBestForCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <h3 className="font-display font-bold text-lg text-forest mb-4">Perfect For</h3>
      <div className="flex flex-wrap content-start gap-2">
        {bestFor.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-gray-100 text-forest text-sm font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
