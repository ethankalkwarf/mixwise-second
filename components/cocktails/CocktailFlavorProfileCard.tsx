interface CocktailFlavorProfileCardProps {
  profile: {
    sweetness?: number | string;
    sourness?: number | string;
    booziness?: number | string;
    bitterness?: number | string;
    [key: string]: number | string | undefined;
  };
}

export function CocktailFlavorProfileCard({ profile }: CocktailFlavorProfileCardProps) {
  // Helper to normalize value to 0-5 range
  const normalizeValue = (val: number | string | undefined): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Try to parse descriptive strings if necessary, or default to middle
      if (val.toLowerCase() === 'high') return 5;
      if (val.toLowerCase() === 'medium') return 3;
      if (val.toLowerCase() === 'low') return 1;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const attributes = [
    { key: 'sweetness', label: 'Sweet', color: 'bg-terracotta' },
    { key: 'sourness', label: 'Sour', color: 'bg-olive' },
    { key: 'booziness', label: 'Boozy', color: 'bg-forest' },
    { key: 'bitterness', label: 'Bitter', color: 'bg-amber-500' },
  ];

  // Only show attributes that have values
  const activeAttributes = attributes.filter(attr => {
    const val = normalizeValue(profile[attr.key] || profile[attr.label.toLowerCase()]);
    return val > 0;
  });

  if (activeAttributes.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Flavor Profile</h3>
      <div className="space-y-4">
        {activeAttributes.map((attr) => {
          // Try both key formats (e.g. "sweetness" or "Sweet")
          const rawValue = profile[attr.key] || profile[attr.label.toLowerCase()];
          const value = normalizeValue(rawValue);

          return (
            <div key={attr.key}>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                <span>{attr.label}</span>
                <span>{value}/5</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${attr.color} rounded-full`}
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

