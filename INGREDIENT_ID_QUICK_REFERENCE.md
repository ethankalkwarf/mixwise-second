# Ingredient ID System - Quick Reference for Developers

## The Rule: ALWAYS Use UUID Format

**Canonical Format**: UUID strings from `ingredients.id` column
```
✅ CORRECT: "550e8400-e29b-41d4-a716-446655440000"
❌ WRONG:   "gin", "vodka", 123, "ingredient-42"
```

---

## Common Tasks

### Task: Get Canonical ID from User Input

```typescript
import { normalizeToCanonical, buildNameToIdMap } from '@/lib/ingredientId';

// Get ingredients for mapping
const { data: ingredients } = await supabase
  .from('ingredients')
  .select('id, name, legacy_id');

const nameMap = buildNameToIdMap(ingredients);

// Convert any format to UUID
const canonicalId = normalizeToCanonical(userInput, nameMap);
if (!canonicalId) {
  console.error('Could not normalize ingredient ID:', userInput);
}
```

### Task: Store Multiple Ingredient IDs

```typescript
import { normalizeToCanonicalMultiple, buildNameToIdMap } from '@/lib/ingredientId';

// Get ingredients for mapping
const { data: ingredients } = await supabase
  .from('ingredients')
  .select('id, name, legacy_id');

const nameMap = buildNameToIdMap(ingredients);

// Convert list
const canonicalIds = normalizeToCanonicalMultiple(userIds, nameMap);

// All items in canonicalIds are now UUIDs
for (const id of canonicalIds) {
  // Safe to use in comparisons and database queries
}
```

### Task: Display Ingredient Name from UUID

```typescript
import { buildIdToNameMap } from '@/lib/ingredientId';

// Get ingredients
const { data: ingredients } = await supabase
  .from('ingredients')
  .select('id, name');

const idToNameMap = buildIdToNameMap(ingredients);

// Get name for display
const name = idToNameMap.get(canonicalId) || 'Unknown';
```

### Task: Compare Two Ingredient IDs

```typescript
// All IDs must be canonical first!
const id1 = "550e8400-e29b-41d4-a716-446655440000";
const id2 = "550e8400-e29b-41d4-a716-446655440000";

// Simple string comparison works
if (id1 === id2) {
  console.log('Same ingredient!');
}

// Or in sets
const owned = new Set(userIngredientIds);
if (owned.has(someIngredientId)) {
  console.log('User has this ingredient!');
}
```

### Task: Debug ID Format Issues

```typescript
import { isValidUuid, assertCanonical } from '@/lib/ingredientId';

// Check if ID is valid UUID
if (!isValidUuid(ingredientId)) {
  console.error('Invalid ingredient ID format:', ingredientId);
}

// Assert in development
const canonical = assertCanonical(ingredientId); // Warns if not UUID
```

---

## Component Examples

### useBarIngredients Hook

```typescript
const {
  ingredientIds,  // All UUIDs! ["550e8400-...", "abc123...", ...]
  ingredients,    // {id: UUID, name: string}[]
  addIngredient,
  removeIngredient,
} = useBarIngredients();

// Just use ingredientIds - they're guaranteed canonical
```

### MixMatching Function

```typescript
import { getMixMatchGroups } from '@/lib/mixMatching';

const result = getMixMatchGroups({
  cocktails: allCocktails,
  ownedIngredientIds: ingredientIds,  // Must be UUIDs!
  stapleIngredientIds: stapleIds,     // Must be UUIDs!
});

// result.ready[0].cocktail.ingredients[].id is also UUID
```

### MixIngredient Type

```typescript
interface MixIngredient {
  id: string;       // UUID from ingredients.id
  name: string;
  category: string;
  imageUrl?: string;
  isStaple?: boolean;
}

// Safe usage:
const ingredient: MixIngredient = {
  id: "550e8400-e29b-41d4-a716-446655440000",  // ✅ UUID
  name: "Vodka",
  category: "spirit"
};
```

---

## Common Mistakes & How to Fix

### ❌ Mistake 1: Using ingredient name instead of ID
```typescript
// WRONG
const owned = new Set(["vodka", "gin"]);
if (owned.has(cocktail.ingredients[0].id)) { }  // Always false!

// RIGHT
const owned = new Set(["550e8400-...", "abc12345-..."]);
if (owned.has(cocktail.ingredients[0].id)) { }  // Works!
```

### ❌ Mistake 2: Comparing without normalization
```typescript
// WRONG
const userSelectedIds = ["gin", "vodka"];
const ownedSet = new Set(userSelectedIds);
if (ownedSet.has(databaseId)) { }  // May fail if databaseId is UUID

// RIGHT
const canonicalIds = normalizeToCanonicalMultiple(userSelectedIds, nameMap);
const ownedSet = new Set(canonicalIds);
if (ownedSet.has(databaseId)) { }  // Works!
```

### ❌ Mistake 3: Forgetting to normalize user input
```typescript
// WRONG
addIngredient(userInput);  // userInput might be "gin"

// RIGHT
const normalized = normalizeToCanonical(userInput, nameMap);
if (normalized) {
  addIngredient(normalized);
}
```

### ❌ Mistake 4: Storing non-UUID ingredients in database
```typescript
// WRONG
await supabase
  .from('bar_ingredients')
  .insert({ ingredient_id: "gin" });

// RIGHT
const canonical = normalizeToCanonical("gin", nameMap);
await supabase
  .from('bar_ingredients')
  .insert({ ingredient_id: canonical });
```

---

## Testing Your Changes

### Unit Test Template

```typescript
import { normalizeToCanonical, buildNameToIdMap } from '@/lib/ingredientId';

describe('Ingredient ID Normalization', () => {
  const nameMap = buildNameToIdMap([
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka', legacy_id: '1' },
    { id: '550e8401-e29b-41d4-a716-446655440001', name: 'Gin', legacy_id: '2' },
  ]);

  test('UUID input returns unchanged', () => {
    const result = normalizeToCanonical('550e8400-e29b-41d4-a716-446655440000', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('Name input converts to UUID', () => {
    const result = normalizeToCanonical('vodka', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('Legacy numeric ID converts to UUID', () => {
    const result = normalizeToCanonical('1', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('Unknown ID returns null', () => {
    const result = normalizeToCanonical('unknown', nameMap);
    expect(result).toBeNull();
  });
});
```

### Integration Test

```typescript
test('Matching works with normalized IDs', () => {
  const canonicalIds = ['550e8400-e29b-41d4-a716-446655440000']; // Vodka UUID
  
  const cocktail = {
    id: 'vodka-tonic',
    name: 'Vodka Tonic',
    ingredients: [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka' }, // Same UUID
      { id: '550e8401-...', name: 'Tonic Water' }
    ]
  };

  const result = getMixMatchGroups({
    cocktails: [cocktail],
    ownedIngredientIds: canonicalIds
  });

  expect(result.ready).toHaveLength(0); // Missing tonic water
  expect(result.almostThere).toHaveLength(1); // Has vodka but missing tonic
});
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/ingredientId.ts` | Type-safe ID utilities |
| `hooks/useBarIngredients.ts` | Normalizes IDs on load |
| `lib/mixMatching.ts` | Compares normalized IDs |
| `app/dashboard/page.tsx` | Displays ingredients by UUID |
| `INGREDIENT_ID_TYPE_ANALYSIS.md` | Detailed analysis |
| `INGREDIENT_ID_FIX_IMPLEMENTATION.md` | Implementation guide |

---

## When to Ask for Help

- ID comparison is returning false unexpectedly?
- "Ingredient not found" errors?
- Matching showing 0 cocktails when it shouldn't?
- User's bar ingredient missing or showing wrong name?

**Debug Steps**:
1. Log the ingredient IDs: `console.log('[DEBUG] ID:', id, 'Format:', typeof id, 'UUID?:', isValidUuid(id))`
2. Check they're in canonical format (should be UUIDs)
3. Verify name map is built correctly
4. Use `assertCanonical()` to catch issues early

---

## TL;DR

1. **Always use UUIDs** for ingredient IDs
2. **Normalize user input** with `normalizeToCanonical()` before storing/comparing
3. **Use the utilities** in `lib/ingredientId.ts` - don't write your own conversion
4. **Test your ID handling** - format mismatches are silent failures
5. **Check the debug logs** - `[MIX-MATCH-WARN]` means something is wrong

**When in doubt**: If an ID doesn't look like a UUID, normalize it before using!

