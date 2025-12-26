#!/usr/bin/env tsx

import { sanityClient } from '../lib/sanityClient.js';

async function checkGingerIngredients() {
  console.log('Checking for ginger-related ingredients...\n');

  const ingredients = await sanityClient.fetch('*[_type == "ingredient"] { _id, name, slug }');
  const gingerIngredients = ingredients.filter((i: any) => i.name.toLowerCase().includes('ginger'));

  console.log('Ingredients with "ginger" in the name:');
  gingerIngredients.forEach((i: any) => console.log(`  - ${i.name} (${i.slug.current})`));

  // Check usage for each ginger ingredient
  console.log('\nChecking usage for each ginger ingredient:');
  for (const ingredient of gingerIngredients) {
    const count = await sanityClient.fetch(`count(*[_type == "cocktail" && references("${ingredient._id}")])`);
    console.log(`  - ${ingredient.name}: ${count} cocktails`);
  }
}

checkGingerIngredients();
