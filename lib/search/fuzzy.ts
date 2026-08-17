/** Classic Levenshtein edit distance. */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);

  for (let j = 0; j < cols; j++) prev[j] = j;

  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j < cols; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j < cols; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

/** Max edits allowed for fuzzy token match. Short tokens stay strict. */
export function maxFuzzyDistance(token: string): number {
  if (token.length < 4) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

export function tokensFuzzyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const max = Math.max(maxFuzzyDistance(a), maxFuzzyDistance(b));
  if (max === 0) return false;
  if (Math.abs(a.length - b.length) > max) return false;
  return levenshteinDistance(a, b) <= max;
}
