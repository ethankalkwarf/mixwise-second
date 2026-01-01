# Ingredient ID Fix - Test Template & Examples

## Quick Test: Manual Verification

### Test 1: Fresh User + 3 Ingredients = Margarita Ready

```
Steps:
1. Open /mix (not logged in)
2. Add these ingredients:
   - Tequila
   - Triple Sec (or Cointreau)
   - Lime Juice
3. Click "Ready to Mix"

Expected Result:
✅ "Margarita" appears in "What You Can Make"
✅ Count shows at least 1 cocktail ready
✅ No console errors or warnings

Debug if failing:
- Open DevTools → Console
- Look for [MIX-MATCH-DEBUG] logs
- Check if Margarita ingredients are found
- Verify ingredient IDs are UUIDs
```

### Test 2: Existing User Login

```
Steps:
1. Create account with email
2. Confirm email (check logs for confirmation URL)
3. Add 5 ingredients during onboarding
4. Go to /dashboard

Expected Result:
✅ "What You Can Make" section shows >0 cocktails
✅ "My Bar" sidebar lists ingredients with names
✅ No "undefined" or missing names
✅ No console errors

Debug if failing:
- ingredientIds should all be UUIDs
- Check bar_ingredients table for those UUIDs
- Verify ingredients table has matching IDs
```

### Test 3: Add Ingredient Then Check Matching

```
Steps:
1. Start with 0 ingredients
2. Add Vodka
3. Note match count (should be low)
4. Add Tonic Water
5. Note match count (should increase)
6. Add Lime Juice
7. Note match count (should increase more)

Expected Result:
✅ Each addition increases matches (or stays same, never decreases)
✅ By step 5: "Vodka Tonic" should be ready
✅ Match counts are accurate

Debug if failing:
- Check console for ID format issues
- Verify each ingredient normalizes to UUID
- Ensure Set comparison is working
```

---

## Unit Test Examples

### Test: normalizeToCanonical Function

```typescript
import { normalizeToCanonical, buildNameToIdMap } from '@/lib/ingredientId';

describe('normalizeToCanonical', () => {
  const testIngredients = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka', legacy_id: '1' },
    { id: '550e8401-e29b-41d4-a716-446655440001', name: 'Gin', legacy_id: '2' },
    { id: '550e8402-e29b-41d4-a716-446655440002', name: 'Tequila', legacy_id: '3' },
  ];
  
  const nameMap = buildNameToIdMap(testIngredients);

  test('UUID input returns unchanged', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = normalizeToCanonical(uuid, nameMap);
    expect(result).toBe(uuid);
  });

  test('ingredient name (lowercase) converts to UUID', () => {
    const result = normalizeToCanonical('vodka', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('ingredient name (uppercase) converts to UUID', () => {
    const result = normalizeToCanonical('VODKA', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('numeric legacy ID converts to UUID', () => {
    const result = normalizeToCanonical('1', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('ingredient- prefixed ID converts correctly', () => {
    const result = normalizeToCanonical('ingredient-1', nameMap);
    expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('unknown ID returns null', () => {
    const result = normalizeToCanonical('unknown-ingredient', nameMap);
    expect(result).toBeNull();
  });

  test('empty string returns null', () => {
    const result = normalizeToCanonical('', nameMap);
    expect(result).toBeNull();
  });
});
```

### Test: normalizeToCanonicalMultiple Function

```typescript
import { normalizeToCanonicalMultiple, buildNameToIdMap } from '@/lib/ingredientId';

describe('normalizeToCanonicalMultiple', () => {
  const testIngredients = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka', legacy_id: '1' },
    { id: '550e8401-e29b-41d4-a716-446655440001', name: 'Gin', legacy_id: '2' },
  ];
  
  const nameMap = buildNameToIdMap(testIngredients);

  test('mixed format IDs all convert to UUID', () => {
    const input = ['vodka', '1', 'gin', '550e8401-e29b-41d4-a716-446655440001'];
    const result = normalizeToCanonicalMultiple(input, nameMap);
    
    expect(result).toHaveLength(2); // Should have 2 unique UUIDs
    expect(result).toContain('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toContain('550e8401-e29b-41d4-a716-446655440001');
  });

  test('removes duplicates', () => {
    const input = ['vodka', 'vodka', '1', '1']; // Same ingredient 4 ways
    const result = normalizeToCanonicalMultiple(input, nameMap);
    
    expect(result).toHaveLength(1); // Only 1 unique UUID
    expect(result[0]).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('filters out unknown IDs', () => {
    const input = ['vodka', 'unknown', 'gin', 'also-unknown'];
    const result = normalizeToCanonicalMultiple(input, nameMap);
    
    expect(result).toHaveLength(2); // Only vodka and gin
    expect(result).toContain('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toContain('550e8401-e29b-41d4-a716-446655440001');
  });

  test('returns empty array for empty input', () => {
    const result = normalizeToCanonicalMultiple([], nameMap);
    expect(result).toHaveLength(0);
  });
});
```

### Test: Matching Logic with Canonical IDs

```typescript
import { getMixMatchGroups } from '@/lib/mixMatching';

describe('getMixMatchGroups with canonical IDs', () => {
  const testIngredients = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka' },
    { id: '550e8401-e29b-41d4-a716-446655440001', name: 'Tonic Water' },
    { id: '550e8402-e29b-41d4-a716-446655440002', name: 'Lime Juice' },
  ];

  const mockCocktails = [
    {
      id: 'vodka-tonic',
      name: 'Vodka Tonic',
      slug: 'vodka-tonic',
      ingredients: [
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Vodka', isOptional: false },
        { id: '550e8401-e29b-41d4-a716-446655440001', name: 'Tonic Water', isOptional: false },
        { id: '550e8402-e29b-41d4-a716-446655440002', name: 'Lime Juice', isOptional: true },
      ]
    }
  ];

  test('ready cocktail when all required ingredients owned', () => {
    const result = getMixMatchGroups({
      cocktails: mockCocktails,
      ownedIngredientIds: [
        '550e8400-e29b-41d4-a716-446655440000', // Vodka
        '550e8401-e29b-41d4-a716-446655440001'  // Tonic Water
      ]
    });

    expect(result.ready).toHaveLength(1);
    expect(result.ready[0].cocktail.name).toBe('Vodka Tonic');
    expect(result.almostThere).toHaveLength(0);
  });

  test('almostThere cocktail when missing 1 required ingredient', () => {
    const result = getMixMatchGroups({
      cocktails: mockCocktails,
      ownedIngredientIds: [
        '550e8400-e29b-41d4-a716-446655440000'  // Only vodka
      ]
    });

    expect(result.ready).toHaveLength(0);
    expect(result.almostThere).toHaveLength(1);
    expect(result.almostThere[0].cocktail.name).toBe('Vodka Tonic');
  });

  test('far cocktail when missing multiple required ingredients', () => {
    const result = getMixMatchGroups({
      cocktails: mockCocktails,
      ownedIngredientIds: [] // No ingredients
    });

    expect(result.ready).toHaveLength(0);
    expect(result.almostThere).toHaveLength(0);
    expect(result.far).toHaveLength(1);
  });

  test('staple ingredients dont count as required', () => {
    const result = getMixMatchGroups({
      cocktails: mockCocktails,
      ownedIngredientIds: [
        '550e8400-e29b-41d4-a716-446655440000'  // Vodka
      ],
      stapleIngredientIds: [
        '550e8401-e29b-41d4-a716-446655440001'  // Tonic (as staple)
      ]
    });

    // Should be ready since tonic is staple (not required)
    expect(result.ready).toHaveLength(1);
  });
});
```

---

## Integration Test Example

```typescript
import { useBarIngredients } from '@/hooks/useBarIngredients';
import { getMixDataClient } from '@/lib/cocktails';
import { getMixMatchGroups } from '@/lib/mixMatching';

describe('Full integration: user bar → matching cocktails', () => {
  test('user can add ingredients and see matching cocktails', async () => {
    // 1. Simulate user adding ingredients via useBarIngredients
    const { ingredientIds, addIngredient } = useBarIngredients();
    
    // Add by name (various formats)
    await addIngredient('vodka'); // Name
    await addIngredient('1');     // Legacy numeric
    await addIngredient('gin');   // Name
    
    // 2. Verify they're stored as UUIDs
    expect(ingredientIds.every(id => /^[0-9a-f]{8}-/.test(id))).toBe(true);
    
    // 3. Get cocktail data
    const { ingredients: allIngredients, cocktails: allCocktails } = await getMixDataClient();
    
    // 4. Run matching
    const staples = allIngredients
      .filter(i => i.isStaple)
      .map(i => i.id);
    
    const result = getMixMatchGroups({
      cocktails: allCocktails,
      ownedIngredientIds: ingredientIds,
      stapleIngredientIds: staples
    });
    
    // 5. Verify results
    expect(result.ready.length + result.almostThere.length + result.far.length)
      .toBe(allCocktails.length);
    
    // Should have some ready or almost-ready cocktails
    expect(result.ready.length + result.almostThere.length).toBeGreaterThan(0);
  });
});
```

---

## E2E Test Scenarios

### Scenario 1: Anonymous User Flow

```typescript
describe('E2E: Anonymous user adds ingredients', () => {
  test('should show cocktails after adding ingredients', async () => {
    // 1. Navigate to /mix
    cy.visit('/mix');
    
    // 2. Add ingredients
    cy.contains('Vodka').click();
    cy.contains('Tonic Water').click();
    cy.contains('Lime Juice').click();
    
    // 3. Click "Ready to Mix"
    cy.contains('Ready to Mix').click();
    
    // 4. Verify cocktails show
    cy.contains('Vodka Tonic').should('exist');
    cy.contains('Gin & Tonic').should('not.exist'); // No gin
    
    // 5. Verify count updates
    cy.contains(/\d+ cocktails ready/).should('exist');
  });
});
```

### Scenario 2: Authenticated User Flow

```typescript
describe('E2E: Authenticated user syncs ingredients', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  test('should sync bar ingredients after login', async () => {
    // 1. Anonymous adds ingredients
    cy.visit('/mix');
    cy.contains('Vodka').click();
    cy.contains('Gin').click();
    
    // 2. See save prompt
    cy.contains('Save my bar').should('exist');
    cy.contains('Save my bar').click();
    
    // 3. Create account
    cy.contains('Sign up').click();
    cy.get('[name="email"]').type('new@example.com');
    cy.get('[name="password"]').type('SecurePassword123!');
    cy.contains('Create Account').click();
    
    // 4. Confirm email
    cy.visit('/auth/callback?token=xxx');
    
    // 5. Go to dashboard
    cy.visit('/dashboard');
    
    // 6. Verify ingredients synced
    cy.contains('Vodka').should('exist');
    cy.contains('Gin').should('exist');
    cy.contains('What You Can Make').should('exist');
    cy.contains(/\d+ cocktail/); // Should show cocktails
  });
});
```

---

## Debug Checklist

### If matching not working:

```
□ Open browser console
□ Filter for [MIX-MATCH-DEBUG]
□ Check "Margarita found:" log
□ Check ingredient IDs - are they UUIDs?
  - Format: "550e8400-e29b-41d4-a716-446655440000"
  - NOT: "gin", "42", "ingredient-vodka"

□ Check ownedIngredientIds:
  - Are they all UUIDs?
  - Are they in the matchCounts calculation?

□ Check database:
  SELECT ingredient_id FROM bar_ingredients
  WHERE user_id = '{current_user_id}'
  - All should be UUIDs
  - All should exist in ingredients table

□ Check DevTools:
  - React DevTools → useBarIngredients hook
  - ingredientIds state
  - All should be UUIDs

If still broken:
  □ Run migration script
  □ Clear localStorage (DevTools → Storage → Clear All)
  □ Reload page
  □ Try again
```

---

## Performance Test

```typescript
describe('Performance: large ingredient lists', () => {
  test('matching 50 ingredients against 500 cocktails is fast', () => {
    // Generate test data
    const ownedIds = Array.from({ length: 50 }, (_, i) => 
      `550e8400-e29b-41d4-a716-${'000000000000'.slice(String(i).length)}${i}`
    );
    
    const cocktails = Array.from({ length: 500 }, (_, i) => ({
      id: `cocktail-${i}`,
      name: `Cocktail ${i}`,
      ingredients: [
        { id: ownedIds[i % 50], name: `Ingredient ${i}`, isOptional: false },
        { id: ownedIds[(i + 1) % 50], name: `Ingredient ${i + 1}`, isOptional: true }
      ]
    }));
    
    // Measure matching time
    const start = performance.now();
    const result = getMixMatchGroups({
      cocktails,
      ownedIngredientIds: ownedIds
    });
    const duration = performance.now() - start;
    
    // Should be fast (< 100ms)
    expect(duration).toBeLessThan(100);
    expect(result.ready.length).toBeGreaterThan(0);
  });
});
```

---

## Validation Helpers

```typescript
// Use these in tests to verify data format

function isCanonicalUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function verifyAllUuids(ids: string[]): boolean {
  return ids.every(id => isCanonicalUuid(id));
}

function verifyIngredientIdConsistency(
  ownedIds: string[],
  cocktails: MixCocktail[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check owned IDs
  if (!verifyAllUuids(ownedIds)) {
    issues.push('ownedIngredientIds contains non-UUID formats');
  }
  
  // Check cocktail ingredient IDs
  for (const cocktail of cocktails) {
    for (const ing of cocktail.ingredients) {
      if (!isCanonicalUuid(ing.id)) {
        issues.push(`Cocktail "${cocktail.name}" has non-UUID ingredient ID: ${ing.id}`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Usage:
const { valid, issues } = verifyIngredientIdConsistency(ingredientIds, cocktails);
if (!valid) {
  console.error('ID consistency issues:', issues);
}
```

---

This template provides everything needed to verify the fix works correctly!

