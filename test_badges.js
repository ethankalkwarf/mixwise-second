// Test script to verify badge system logic
const { BADGES } = require('./lib/badges.ts');

// Mock the badge checking functions for testing
console.log('Testing badge definitions...');

// Test badge count
console.log(`Total badges: ${Object.keys(BADGES).length}`);
console.log('Badge categories:', [...new Set(Object.values(BADGES).map(b => b.category))]);
console.log('Badge rarities:', [...new Set(Object.values(BADGES).map(b => b.rarity))]);

// Test specific badges mentioned by user
console.log('\nTesting specific badges:');
console.log('starter_mixer:', BADGES.starter_mixer);
console.log('cocktail_enthusiast:', BADGES.cocktail_enthusiast);

// Test badge criteria
console.log('\nBadge criteria:');
Object.values(BADGES).forEach(badge => {
  if (badge.criteria.includes('Save') && badge.criteria.includes('cocktail')) {
    console.log(`${badge.id}: ${badge.criteria}`);
  }
});

console.log('\nBadge system test completed.');
