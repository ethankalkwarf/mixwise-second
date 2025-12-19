#!/usr/bin/env ts-node

/**
 * Test the new enhanced Mix Tool matching logic
 */

import { getMixMatchGroups } from '../lib/mixMatching';
import type { MixCocktail, MixCocktailIngredient } from '../lib/mixTypes';

// Create test cocktails
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
    { id: '42', name: 'Simple Syrup', isOptional: true } // Optional ingredient
  ])
];

function runTests() {
  console.log('🧪 Testing Enhanced Mix Tool Matching Logic\n');

  // Test 1: User has all Margarita ingredients
  console.log('Test 1: User has all Margarita ingredients (Tequila, Lime, Triple Sec)');
  const result1 = getMixMatchGroups({
    cocktails: testCocktails,
    ownedIngredientIds: [TEQUILA, LIME, TRIPLE_SEC],
    stapleIngredientIds: [],
    maxMissing: 2
  });

  console.log(`  Ready: ${result1.ready.length} cocktails`);
  console.log(`  Almost There: ${result1.almostThere.length} cocktails`);
  console.log(`  Far: ${result1.far.length} cocktails`);
  if (result1.ready.length > 0) {
    console.log(`  First ready cocktail: ${result1.ready[0].cocktail.name} (${result1.ready[0].matchPercent * 100}% match)`);
  }
  console.log();

  // Test 2: User has Margarita ingredients minus Triple Sec
  console.log('Test 2: User has Margarita ingredients minus Triple Sec');
  const result2 = getMixMatchGroups({
    cocktails: testCocktails,
    ownedIngredientIds: [TEQUILA, LIME],
    stapleIngredientIds: [],
    maxMissing: 2
  });

  console.log(`  Ready: ${result2.ready.length} cocktails`);
  console.log(`  Almost There: ${result2.almostThere.length} cocktails`);
  console.log(`  Far: ${result2.far.length} cocktails`);
  if (result2.almostThere.length > 0) {
    const margarita = result2.almostThere.find(r => r.cocktail.name === 'Margarita');
    if (margarita) {
      console.log(`  Margarita: missing ${margarita.missingCount}, ${margarita.matchPercent * 100}% match`);
    }
  }
  console.log();

  // Test 3: User has Gin only
  console.log('Test 3: User has Gin only');
  const result3 = getMixMatchGroups({
    cocktails: testCocktails,
    ownedIngredientIds: [GIN],
    stapleIngredientIds: [],
    maxMissing: 2
  });

  console.log(`  Ready: ${result3.ready.length} cocktails`);
  console.log(`  Almost There: ${result3.almostThere.length} cocktails`);
  console.log(`  Far: ${result3.far.length} cocktails`);

  result3.almostThere.forEach(cocktail => {
    console.log(`  ${cocktail.cocktail.name}: missing ${cocktail.missingCount}, ${cocktail.matchPercent * 100}% match`);
  });
  console.log();

  // Test 4: Test optional ingredients don't block ready
  console.log('Test 4: Test optional ingredients (Daiquiri with Rum + Lime, no Simple Syrup)');
  const result4 = getMixMatchGroups({
    cocktails: testCocktails,
    ownedIngredientIds: [RUM, LIME], // Missing optional Simple Syrup
    stapleIngredientIds: [],
    maxMissing: 2
  });

  console.log(`  Ready: ${result4.ready.length} cocktails`);
  console.log(`  Almost There: ${result4.almostThere.length} cocktails`);
  if (result4.ready.length > 0) {
    const daiquiri = result4.ready.find(r => r.cocktail.name === 'Daiquiri');
    if (daiquiri) {
      console.log(`  Daiquiri: ${daiquiri.matchPercent * 100}% match (optional ingredient ignored)`);
    }
  }
  console.log();

  console.log('✅ All tests completed!');
}

runTests();
