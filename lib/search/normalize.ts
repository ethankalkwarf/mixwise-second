/** Fold accents/diacritics so "Curaçao" matches "curacao". */
export function foldSearchAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Lowercase, strip accents/punctuation, collapse whitespace. */
export function normalizeSearchText(value: string): string {
  return foldSearchAccents(value)
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a query or field into searchable tokens. */
export function tokenizeSearchText(value: string): string[] {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}
