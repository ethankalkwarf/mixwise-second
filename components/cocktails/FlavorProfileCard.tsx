type FlavorProps = {
  strength: number | null;
  sweetness: number | null;
  tartness: number | null;
  bitterness: number | null;
  aroma: number | null;
  texture: number | null;
};

const FLAVOR_FIELDS = [
  "strength",
  "sweetness",
  "tartness",
  "bitterness",
  "aroma",
  "texture",
] as const;

const FLAVOR_LABELS: Record<(typeof FLAVOR_FIELDS)[number], string> = {
  strength: "Strength",
  sweetness: "Sweetness",
  tartness: "Tartness",
  bitterness: "Bitterness",
  aroma: "Aroma",
  texture: "Texture",
};

const MAX_SCORE = 10;

export function FlavorProfileCard({ flavor }: { flavor: FlavorProps }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">Flavor Profile</h3>

      <div className="space-y-3">
        {FLAVOR_FIELDS.map((key) => {
          const raw = flavor[key] ?? 0;
          const value = typeof raw === "number" ? raw : Number(raw) || 0;
          const pct = Math.max(0, Math.min(100, (value / MAX_SCORE) * 100));

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{FLAVOR_LABELS[key].toUpperCase()}</span>
                <span>
                  {value}/{MAX_SCORE}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
