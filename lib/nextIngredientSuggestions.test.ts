/**
 * Unit tests for nextIngredientSuggestions.ts
 */

import { getNextIngredientSuggestions, mapIngredientIdsToNames, getNextIngredientSuggestionsWithNames } from './nextIngredientSuggestions';
import type { MixCocktail } from './mixTypes';

// Test cocktail data
const createTestCocktail = (
  id: string,
  name: string,
  ingredients: Array<{ id: string; name: string; isOptional?: boolean }>
): MixCocktail => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  ingredients: ingredients.map(ing => ({
    id: ing.id,
    name: ing.name,
    isOptional: ing.isOptional || false
  }))
});

// Test ingredients
const TEQUILA = '135';
const LIME = '2296';
const TRIPLE_SEC = '121';
const GIN = '2';
const VERMOUTH = '37';
const CAMPARI = '2062';
const RUM = '201';
const SIMPLE_SYRUP = '42';
const ANGOSTURA = '43';

const testCocktails = [
  createTestCocktail('margarita', 'Margarita', [
    { id: TEQUILA, name: 'Tequila' },
    { id: LIME, name: 'Fresh Lime Juice' },
    { id: TRIPLE_SEC, name: 'Triple Sec' }
  ]),
  createTestCocktail('martini', 'Martini', [
    { id: GIN, name: 'Gin' },
    { id: VERMOUTH, name: 'Dry Vermouth' }
  ]),
  createTestCocktail('negroni', 'Negroni', [
    { id: GIN, name: 'Gin' },
    { id: CAMPARI, name: 'Campari' },
    { id: VERMOUTH, name: 'Sweet Vermouth' }
  ]),
  createTestCocktail('daiquiri', 'Daiquiri', [
    { id: RUM, name: 'White Rum' },
    { id: LIME, name: 'Fresh Lime Juice' },
    { id: SIMPLE_SYRUP, name: 'Simple Syrup', isOptional: true } // Optional
  ]),
  createTestCocktail('old-fashioned', 'Old Fashioned', [
    { id: '45', name: 'Whiskey' },
    { id: ANGOSTURA, name: 'Angostura Bitters' },
    { id: SIMPLE_SYRUP, name: 'Simple Syrup' }
  ]),
  createTestCocktail('tom-collins', 'Tom Collins', [
    { id: GIN, name: 'Gin' },
    { id: LIME, name: 'Fresh Lime Juice' },
    { id: SIMPLE_SYRUP, name: 'Simple Syrup' }
  ])
];

describe('getNextIngredientSuggestions', () => {
  test('Test 1: User has Margarita ingredients, suggests for other cocktails', () => {
    const result = getNextIngredientSuggestions({
      cocktails: testCocktails,
      ownedIngredientIds: [TEQUILA, LIME, TRIPLE_SEC], // Has Margarita
      stapleIngredientIds: [],
      maxMissing: 2,
      limit: 10
    });

    expect(result.length).toBeGreaterThan(0);

    // Should suggest ingredients for Negroni (Gin, Campari, Vermouth)
    const ginSuggestion = result.find(s => s.ingredientId === GIN);
    expect(ginSuggestion).toBeDefined();
    expect(ginSuggestion!.unlockScore).toBeGreaterThan(0);

    // Gin unlocks: Negroni (missing 2) + Martini (missing 1) + Tom Collins (missing 2)
    // Score: (1 * 3 for Martini) + (2 * 1 for Negroni/Tom Collins) = 5
    expect(ginSuggestion!.unlockScore).toBe(5);
    expect(ginSuggestion!.unlocksMissing1Count).toBe(1); // Martini
    expect(ginSuggestion!.unlocksMissing2Count).toBe(2); // Negroni, Tom Collins
  });

  test('Test 2: User has Gin only, shows weighted suggestions', () => {
    const result = getNextIngredientSuggestions({
      cocktails: testCocktails,
      ownedIngredientIds: [GIN],
      stapleIngredientIds: [],
      maxMissing: 2,
      limit: 5
    });

    expect(result.length).toBeGreaterThan(0);

    // Should prioritize ingredients that complete cocktails missing only 1 ingredient
    const vermouthSuggestion = result.find(s => s.ingredientId === VERMOUTH);
    expect(vermouthSuggestion).toBeDefined();
    // Vermouth completes Martini (missing only vermouth), so gets weight 3
    expect(vermouthSuggestion!.unlockScore).toBe(3);
    expect(vermouthSuggestion!.unlocksMissing1Count).toBe(1);
    expect(vermouthSuggestion!.unlocksMissing2Count).toBe(0);
  });

  test('Test 3: Respects maxMissing parameter', () => {
    // With maxMissing=1, should only consider cocktails missing exactly 1 ingredient
    const result = getNextIngredientSuggestions({
      cocktails: testCocktails,
      ownedIngredientIds: [GIN], // Has Gin
      stapleIngredientIds: [],
      maxMissing: 1, // Only cocktails missing exactly 1 ingredient
      limit: 10
    });

    // Should only include ingredients that complete cocktails missing exactly 1
    const vermouthSuggestion = result.find(s => s.ingredientId === VERMOUTH);
    expect(vermouthSuggestion).toBeDefined();
    expect(vermouthSuggestion!.unlockScore).toBe(3); // Only Martini, weight 3

    // Should not include ingredients for cocktails missing 2 (like Negroni)
    const campariSuggestion = result.find(s => s.ingredientId === CAMPARI);
    expect(campariSuggestion).toBeUndefined(); // Negroni needs both Campari AND Vermouth
  });

  test('Test 4: Respects limit parameter', () => {
    const result = getNextIngredientSuggestions({
      cocktails: testCocktails,
      ownedIngredientIds: [],
      stapleIngredientIds: [],
      maxMissing: 2,
      limit: 3
    });

    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('Test 5: Ignores optional ingredients', () => {
    const result = getNextIngredientSuggestions({
      cocktails: testCocktails,
      ownedIngredientIds: [RUM, LIME], // Has Rum + Lime for Daiquiri
      stapleIngredientIds: [],
      maxMissing: 2,
      limit: 10
    });

    // Daiquiri should be "ready" (optional Simple Syrup ignored)
    // So Simple Syrup should not appear in suggestions
    const syrupSuggestion = result.find(s => s.ingredientId === SIMPLE_SYRUP);
    expect(syrupSuggestion).toBeUndefined();
  });
});

describe('mapIngredientIdsToNames', () => {
  test('Maps ingredient IDs to names correctly', () => {
    const ingredientIds = [GIN, TEQUILA, 'nonexistent'];
    const idToName = mapIngredientIdsToNames(ingredientIds, testCocktails);

    expect(idToName.get(GIN)).toBe('Gin');
    expect(idToName.get(TEQUILA)).toBe('Tequila');
    expect(idToName.get('nonexistent')).toBeUndefined();
  });
});

describe('getNextIngredientSuggestionsWithNames', () => {
  test('Returns suggestions with ingredient names', () => {
    const result = getNextIngredientSuggestionsWithNames({
      cocktails: testCocktails,
      ownedIngredientIds: [TEQUILA, LIME, TRIPLE_SEC],
      stapleIngredientIds: [],
      maxMissing: 2,
      limit: 3
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('ingredientName');
    expect(typeof result[0].ingredientName).toBe('string');
    expect(result[0].ingredientName).not.toBe('Unknown Ingredient');
  });
});
