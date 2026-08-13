/**
 * Scale recipe ingredient lines for multi-drink / party batches.
 * Avoids eval; formats common bar fractions cleanly.
 */

const UNIT_PATTERN =
  "oz|ounce|ounces|cup|cups|tbsp|tsp|ml|cl|dash|dashes|drop|drops|slice|slices|piece|pieces|sprig|sprigs|leaf|leaves|wheel|wheels|twist|twists|wedge|wedges|peel|peels|barspoon|barspoons|splash|splashes";

const MEASUREMENT_REGEX = new RegExp(
  `(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})\\b`,
  "gi"
);

const FRACTIONS: Array<{ value: number; label: string }> = [
  { value: 0.125, label: "1/8" },
  { value: 0.25, label: "1/4" },
  { value: 0.33, label: "1/3" },
  { value: 1 / 3, label: "1/3" },
  { value: 0.5, label: "1/2" },
  { value: 0.67, label: "2/3" },
  { value: 2 / 3, label: "2/3" },
  { value: 0.75, label: "3/4" },
];

function parseAmount(amount: string): number {
  const cleaned = amount.trim();
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
  }
  const fraction = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  }
  return parseFloat(cleaned);
}

export function formatScaledAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";

  const nearest = FRACTIONS.find((f) => Math.abs(f.value - value) < 0.02);
  if (nearest && value < 1) return nearest.label;

  const whole = Math.floor(value);
  const remainder = value - whole;
  if (whole > 0 && remainder > 0.02) {
    const frac = FRACTIONS.find((f) => Math.abs(f.value - remainder) < 0.03);
    if (frac) return `${whole} ${frac.label}`;
  }

  if (Math.abs(value - Math.round(value)) < 0.05) return String(Math.round(value));
  if (value >= 10) return value.toFixed(0);
  return (Math.round(value * 10) / 10).toString();
}

export function scaleIngredientLine(ingredientText: string, scale: number): string {
  if (scale === 1) return ingredientText;
  return ingredientText.replace(MEASUREMENT_REGEX, (_match, amount: string, unit: string) => {
    const numeric = parseAmount(amount);
    if (!Number.isFinite(numeric)) return `${amount} ${unit}`;
    return `${formatScaledAmount(numeric * scale)} ${unit}`;
  });
}

export function scaleIngredientLines(
  lines: Array<{ text: string }>,
  scale: number
): Array<{ text: string }> {
  return lines.map((line) => ({
    ...line,
    text: scaleIngredientLine(line.text, scale),
  }));
}

/** Rough total spirit ounces from scaled lines — for pitcher guidance only */
export function estimateTotalOz(lines: string[]): number | null {
  let total = 0;
  let found = false;
  for (const line of lines) {
    const re = new RegExp(`(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)\\s*(oz)\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      total += parseAmount(m[1]);
      found = true;
    }
  }
  return found ? total : null;
}
