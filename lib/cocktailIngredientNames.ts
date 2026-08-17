/**
 * Pull display names from the cocktails.ingredients JSON payload
 * (string lines or nested { ingredient: { name } } objects).
 */
export function extractCocktailIngredientNames(ingredients: unknown): string[] {
  if (!Array.isArray(ingredients)) return [];
  const names: string[] = [];
  for (const ing of ingredients) {
    if (typeof ing === "string") {
      const parsed = parseIngredientDisplayName(ing);
      if (parsed) names.push(parsed);
      continue;
    }
    if (!ing || typeof ing !== "object") continue;
    const record = ing as Record<string, unknown>;
    const nested = record.ingredient;
    const nestedName =
      nested && typeof nested === "object"
        ? (nested as Record<string, unknown>).name
        : undefined;
    const raw =
      (typeof nestedName === "string" && nestedName) ||
      (typeof record.name === "string" && record.name) ||
      (typeof record.text === "string" && record.text) ||
      null;
    const name = raw ? parseIngredientDisplayName(raw) : null;
    if (name) names.push(name);
  }
  return names;
}

function parseIngredientDisplayName(fullText: string): string | null {
  const ingredientText = fullText
    .trim()
    .replace(
      /^\d+(\/\d+)?\s*(oz|cup|tbsp|tsp|dash|dashes|drop|drops|ml|cl|shot|jigger|part|parts|slice|slices|wheel|wheels|twist|twists|peel|peels|wedge|wedges|sprig|sprigs|leaf|leaves|piece|pieces)\s+/i,
      ""
    )
    .replace(/^\d+\s+/, "")
    .trim();
  return ingredientText || null;
}
