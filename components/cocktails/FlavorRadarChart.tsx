"use client";

interface FlavorProps {
  strength: number | null;
  sweetness: number | null;
  tartness: number | null;
  bitterness: number | null;
  aroma: number | null;
  texture: number | null;
}

const FLAVOR_LABELS = {
  strength: "Strength",
  sweetness: "Sweetness",
  tartness: "Tartness",
  bitterness: "Bitterness",
  aroma: "Aroma",
  texture: "Texture",
} as const;

const FLAVOR_KEYS = Object.keys(FLAVOR_LABELS) as Array<keyof typeof FLAVOR_LABELS>;

export function FlavorRadarChart({ flavor }: { flavor: FlavorProps }) {
  // Convert flavor data to chart coordinates
  const getDataPoints = () => {
    const points: Array<{ x: number; y: number; label: string; value: number }> = [];
    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    FLAVOR_KEYS.forEach((key, index) => {
      const value = flavor[key] ?? 0;
      const angle = (index * 60 - 90) * (Math.PI / 180); // Start from top, 60 degrees apart
      const normalizedValue = Math.max(0, Math.min(10, value)) / 10; // Normalize to 0-1
      const r = normalizedValue * radius;

      points.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        label: FLAVOR_LABELS[key],
        value,
      });
    });

    return points;
  };

  const dataPoints = getDataPoints();
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Create grid lines (3 concentric circles)
  const gridCircles = [0.33, 0.66, 1].map(ratio => {
    const r = ratio * 80;
    return `M ${100 + r} 100 A ${r} ${r} 0 0 1 ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`;
  });

  // Create axis lines
  const axisLines = dataPoints.map(point => `M 100 100 L ${point.x} ${point.y}`);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <div className="text-center mb-4">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">Flavor Profile</h3>
        <p className="text-sm text-muted-foreground">Relative intensity of each characteristic</p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-64 h-64">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            role="img"
            aria-label="Flavor profile radar chart showing relative intensities of strength, sweetness, tartness, bitterness, aroma, and texture"
          >
            {/* Grid circles */}
            {gridCircles.map((path, index) => (
              <path
                key={index}
                d={path}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines */}
            {axisLines.map((line, index) => (
              <path
                key={index}
                d={line}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* Data polygon */}
            {dataPoints.some(p => p.value > 0) && (
              <polygon
                points={polygonPoints}
                fill="rgba(245, 158, 11, 0.2)"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            )}

            {/* Data points */}
            {dataPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#f59e0b"
              />
            ))}
          </svg>

          {/* Labels */}
          {dataPoints.map((point, index) => (
            <div
              key={index}
              className="absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(point.x / 200) * 100}%`,
                top: `${(point.y / 200) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {dataPoints.map((point, index) => (
          <div key={index} className="flex justify-between">
            <span>{point.label}:</span>
            <span className="font-medium">{point.value}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}








