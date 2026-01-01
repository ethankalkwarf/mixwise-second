/**
 * Ingredient ID Type Safety and Normalization
 * 
 * CANONICAL FORMAT: UUID strings from ingredients.id
 * Example: "550e8400-e29b-41d4-a716-446655440000"
 * 
 * This module ensures all ingredient IDs throughout the app
 * are consistently stored and compared as UUID strings.
 */

/**
 * Branded type for type-safe ingredient IDs
 * Ensures ID is in canonical UUID format
 * 
 * Use: const id: IngredientId = normalizeToCanonical(someId);
 */
export type IngredientId = string & { readonly __brand: "IngredientId" };

/**
 * Check if a string is valid UUID format
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Normalize a single ingredient ID to canonical UUID format
 * 
 * Handles:
 * - UUID strings → keep as-is
 * - Numeric strings ("42") → look up in nameToIdMap
 * - Names ("vodka") → look up in nameToIdMap
 * - Legacy prefixed ("ingredient-42") → extract and look up
 * 
 * Returns null if ID cannot be normalized
 */
export function normalizeToCanonical(
  id: string,
  nameToIdMap: Map<string, string>
): IngredientId | null {
  if (!id) return null;

  // Already a UUID? Keep it
  if (isValidUuid(id)) {
    return id as IngredientId;
  }

  // Extract from ingredient- prefix
  let lookupId = id;
  if (id.startsWith('ingredient-')) {
    lookupId = id.substring('ingredient-'.length);
  }

  // Try numeric ID lookup
  if (/^\d+$/.test(lookupId)) {
    const canonical = nameToIdMap.get(`numeric:${lookupId}`);
    if (canonical) return canonical as IngredientId;
  }

  // Try name lookup (case-insensitive)
  const canonical = nameToIdMap.get(lookupId.toLowerCase());
  if (canonical) return canonical as IngredientId;

  // Not found
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[IngredientId] Could not normalize: "${id}"`);
  }
  return null;
}

/**
 * Normalize multiple ingredient IDs to canonical format
 * 
 * Filters out IDs that cannot be normalized
 * Removes duplicates
 */
export function normalizeToCanonicalMultiple(
  ids: string[],
  nameToIdMap: Map<string, string>
): IngredientId[] {
  const normalized = new Set<string>();

  for (const id of ids) {
    const canonical = normalizeToCanonical(id, nameToIdMap);
    if (canonical) {
      normalized.add(canonical);
    }
  }

  return Array.from(normalized) as IngredientId[];
}

/**
 * Build a name-to-ID map for normalization
 * 
 * Input: Array of ingredients from the database
 * Output: Map for looking up canonical IDs by name or legacy ID
 * 
 * Example:
 * ```
 * const nameMap = buildNameToIdMap([
 *   { id: 'uuid-123', name: 'Vodka', legacy_id: '42' },
 *   { id: 'uuid-456', name: 'Gin', legacy_id: '43' }
 * ]);
 * 
 * nameMap.get('vodka')           // → 'uuid-123'
 * nameMap.get('numeric:42')      // → 'uuid-123'
 * nameMap.get('gin')             // → 'uuid-456'
 * ```
 */
export function buildNameToIdMap(
  ingredients: Array<{ id: string; name?: string | null; legacy_id?: string | null }>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const ingredient of ingredients) {
    if (!isValidUuid(ingredient.id)) {
      console.warn(`[IngredientId] Ingredient has non-UUID ID: "${ingredient.id}"`);
    }

    // Map by name (case-insensitive)
    if (ingredient.name) {
      map.set(ingredient.name.toLowerCase(), ingredient.id);
    }

    // Map by legacy_id if present
    if (ingredient.legacy_id) {
      // For numeric legacy IDs, use special prefix
      if (/^\d+$/.test(ingredient.legacy_id)) {
        map.set(`numeric:${ingredient.legacy_id}`, ingredient.id);
      } else {
        // For string legacy IDs, map directly
        map.set(ingredient.legacy_id.toLowerCase(), ingredient.id);
      }
    }
  }

  return map;
}

/**
 * Get ingredient name from canonical ID
 * 
 * Returns ingredient name if found in map, otherwise null
 * Useful for displaying ingredient names in the UI
 */
export function getIngredientName(
  canonicalId: IngredientId,
  idToNameMap: Map<string, string>
): string | null {
  return idToNameMap.get(canonicalId) || null;
}

/**
 * Build an ID-to-name map for display
 * 
 * Input: Array of ingredients from database
 * Output: Map from canonical ID to ingredient name
 */
export function buildIdToNameMap(
  ingredients: Array<{ id: string; name?: string | null }>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const ingredient of ingredients) {
    if (ingredient.name) {
      map.set(ingredient.id, ingredient.name);
    }
  }

  return map;
}

/**
 * Assert that an ID is in canonical format
 * 
 * Use this when you know an ID should be canonical (e.g., from database)
 * Helps catch bugs during development
 */
export function assertCanonical(id: string): IngredientId {
  if (!isValidUuid(id)) {
    console.error(`[IngredientId] Expected canonical UUID but got: "${id}"`);
  }
  return id as IngredientId;
}

/**
 * Safe assertion - returns null if not canonical instead of throwing
 */
export function asCanonicalIfValid(id: string): IngredientId | null {
  return isValidUuid(id) ? (id as IngredientId) : null;
}

