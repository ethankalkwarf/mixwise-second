interface BestForCardProps {
  bestFor: string[];
}

export function BestForCard({ bestFor }: BestForCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-mist shadow-sm h-full flex flex-col">
      <h3 className="font-display font-bold text-lg text-forest mb-4">Perfect For</h3>
      <div className="flex flex-wrap content-start gap-2">
        {bestFor.map((tag, i) => (
          <span
            key={i}
            className="bg-cream border border-mist text-forest px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}


