/**
 * Lightweight substitution tips for recipe pages.
 * Matched against ingredient line text (case-insensitive).
 */

export type SubstitutionTip = {
  id: string;
  /** Shown as the thing in the recipe */
  have: string;
  /** Practical swap */
  use: string;
  note?: string;
  patterns: string[];
};

export const SUBSTITUTION_TIPS: SubstitutionTip[] = [
  {
    id: "cointreau-triple-sec",
    have: "Cointreau / orange liqueur",
    use: "Triple sec or another dry orange liqueur",
    note: "Stay with a drier orange liqueur so the drink doesn’t turn candy-sweet.",
    patterns: ["cointreau", "triple sec", "orange liqueur"],
  },
  {
    id: "bourbon-rye",
    have: "Bourbon",
    use: "Rye whiskey",
    note: "Rye runs drier and spicier; great in Manhattans and many whiskey sours.",
    patterns: ["bourbon"],
  },
  {
    id: "rye-bourbon",
    have: "Rye",
    use: "Bourbon",
    note: "Bourbon is a little sweeter and softer if rye feels sharp.",
    patterns: ["rye whiskey", "rye"],
  },
  {
    id: "mezcal-tequila",
    have: "Mezcal",
    use: "Reposado or blanco tequila",
    note: "You lose smoke; start with a splash of mezcal if you only have tequila.",
    patterns: ["mezcal"],
  },
  {
    id: "simple-agave",
    have: "Simple syrup",
    use: "Agave syrup (use a touch less)",
    note: "Agave is sweeter by volume — start around ¾ of the simple measure.",
    patterns: ["simple syrup"],
  },
  {
    id: "fresh-citrus",
    have: "Fresh citrus juice",
    use: "Don’t swap bottled juice if you can help it",
    note: "Bottled lemon/lime flattens sours. If you must, cut sweetness slightly.",
    patterns: ["fresh lemon", "fresh lime", "lemon juice", "lime juice"],
  },
  {
    id: "egg-white-aquafaba",
    have: "Egg white",
    use: "Aquafaba (chickpea water)",
    note: "About ¾ oz aquafaba replaces one egg white for foam.",
    patterns: ["egg white"],
  },
  {
    id: "campari-aperitivo",
    have: "Campari",
    use: "Another red bitter aperitivo (Aperol is sweeter/lighter)",
    note: "Aperol makes a softer, sweeter drink — not a 1:1 flavor match.",
    patterns: ["campari"],
  },
  {
    id: "prosecco-sparkling",
    have: "Prosecco",
    use: "Any dry sparkling wine",
    note: "Keep it brut/extra-dry so spritzes don’t turn sugary.",
    patterns: ["prosecco", "champagne", "sparkling wine"],
  },
  {
    id: "ginger-beer",
    have: "Ginger beer",
    use: "Spicy ginger beer over ginger ale",
    note: "Ginger ale is sweeter and milder — fine in a pinch, less bite.",
    patterns: ["ginger beer"],
  },
];

export function getSubstitutionTipsForIngredients(ingredientTexts: string[]): SubstitutionTip[] {
  const blob = ingredientTexts.join(" \n ").toLowerCase();
  const tips: SubstitutionTip[] = [];
  for (const tip of SUBSTITUTION_TIPS) {
    if (tip.patterns.some((p) => blob.includes(p.toLowerCase()))) {
      tips.push(tip);
    }
  }
  // Prefer a short card — max 4 tips
  return tips.slice(0, 4);
}
