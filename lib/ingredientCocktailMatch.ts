function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `needle` appears as a whole ingredient token, not inside "ginger" / "sloe gin" mishits. */
export function ingredientNameInLine(line: string, needle: string): boolean {
  const token = needle.trim();
  if (!token) return false;
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(token)}([^a-z0-9]|$)`, "i");
  return re.test(line);
}

export function defaultExcludedIngredientNames(ingredientName: string): string[] {
  return ingredientName.trim().toLowerCase() === "gin" ? ["sloe gin"] : [];
}

export function cocktailUsesIngredient(args: {
  ingredientName: string;
  extraNames?: string[];
  excludeNames?: string[];
  matchBaseSpirit?: boolean;
  ingredientNames: string[];
  baseSpirit?: string | null;
}): boolean {
  const needles = [args.ingredientName, ...(args.extraNames || [])]
    .map((name) => name.trim())
    .filter(Boolean);
  const excludes = [...defaultExcludedIngredientNames(args.ingredientName), ...(args.excludeNames || [])];

  for (const line of args.ingredientNames) {
    if (excludes.some((ex) => ingredientNameInLine(line, ex))) continue;
    if (needles.some((needle) => ingredientNameInLine(line, needle))) return true;
  }

  if (args.matchBaseSpirit && args.baseSpirit) {
    if (needles.some((needle) => ingredientNameInLine(args.baseSpirit as string, needle))) return true;
  }

  return false;
}

export function isSpiritType(type: string | null | undefined): boolean {
  const value = (type || "").toLowerCase();
  return value.includes("spirit") || value === "gin" || value === "whiskey" || value === "rum";
}
