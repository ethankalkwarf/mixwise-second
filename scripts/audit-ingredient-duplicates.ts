#!/usr/bin/env tsx

/**
 * Audit script to find duplicate or near-duplicate ingredients
 * Run before migrate-supabase-ingredient-categories.ts to get a complete picture
 *
 * Finds:
 * 1. Exact duplicates (same name, different case)
 * 2. Alternate spellings (Whiskey vs Whisky, etc.)
 * 3. Misclassified ingredients (e.g. Jägermeister in Mixers)
 * 4. Similar ingredients that may need combining
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Known alternate spellings / potential duplicates
const SIMILAR_GROUPS: Record<string, string[]> = {
  whiskey_whisky: ['whiskey', 'whisky'],
  lime_juice: ['lime juice', 'fresh lime juice'],
  lemon_juice: ['lemon juice', 'fresh lemon juice'],
  orange_juice: ['orange juice', 'fresh orange juice'],
  simple_syrup: ['simple syrup', 'sugar syrup'],
  vodka: ['vodka', 'absolut vodka'],
};

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/\s+/g, ' ')
    .trim();
}

async function auditDuplicates() {
  console.log('🔍 INGREDIENT DUPLICATE AUDIT');
  console.log('================================\n');

  try {
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name, category')
      .order('name');

    if (error) {
      console.error('Error fetching ingredients:', error);
      process.exit(1);
    }

    if (!ingredients || ingredients.length === 0) {
      console.log('No ingredients found.');
      return;
    }

    console.log(`📊 Total ingredients: ${ingredients.length}\n`);

    // 1. Exact duplicates (case-insensitive)
    const byNormalizedName = new Map<string, typeof ingredients>();
    for (const ing of ingredients) {
      const key = normalizeForComparison(ing.name);
      if (!byNormalizedName.has(key)) {
        byNormalizedName.set(key, []);
      }
      byNormalizedName.get(key)!.push(ing);
    }

    const exactDuplicates = Array.from(byNormalizedName.entries()).filter(
      ([_, list]) => list.length > 1
    );

    if (exactDuplicates.length > 0) {
      console.log('⚠️  EXACT DUPLICATES (same name, different case/accents):');
      console.log('   These are true duplicates and should be combined.\n');
      exactDuplicates.forEach(([normName, list]) => {
        console.log(`   "${normName}":`);
        list.forEach((ing) => console.log(`     - ID ${ing.id}: "${ing.name}" (${ing.category})`));
        console.log('');
      });
    } else {
      console.log('✅ No exact duplicates found (same name, different case)\n');
    }

    // 2. Whiskey / Whisky specifically
    const whiskeyLike = ingredients.filter(
      (ing) =>
        /\bwhisk(e)?y\b/i.test(ing.name) ||
        ing.name.toLowerCase().includes('whiskey') ||
        ing.name.toLowerCase().includes('whisky')
    );

    if (whiskeyLike.length > 0) {
      console.log('🥃 WHISKEY / WHISKY INGREDIENTS:');
      console.log('   (American "Whiskey" vs Scottish "Whisky" – consider if these should be separate)\n');
      whiskeyLike.forEach((ing) => {
        console.log(`   - ID ${ing.id}: "${ing.name}" | Category: ${ing.category}`);
      });
      if (whiskeyLike.length > 1) {
        const genericWhiskey = whiskeyLike.filter(
          (ing) =>
            /^(whiskey|whisky)$/i.test(ing.name.trim()) ||
            ing.name.toLowerCase() === 'whiskey' ||
            ing.name.toLowerCase() === 'whisky'
        );
        if (genericWhiskey.length > 1) {
          console.log('\n   ⚠️  LIKELY DUPLICATES: Multiple generic "Whiskey"/"Whisky" entries.');
          console.log('   Consider running a combine-whiskey-ingredients.ts script (like combine-vodka-ingredients.ts)\n');
        }
      }
      console.log('');
    }

    // 3. Similar groups (known alternates)
    console.log('📋 SIMILAR INGREDIENT GROUPS (potential merges):');
    for (const [groupName, variants] of Object.entries(SIMILAR_GROUPS)) {
      const found = ingredients.filter((ing) => {
        const norm = normalizeForComparison(ing.name);
        return variants.some((v) => norm === v || norm.includes(v));
      });
      if (found.length >= 2) {
        console.log(`\n   ${groupName}:`);
        found.forEach((ing) => console.log(`     - ID ${ing.id}: "${ing.name}" (${ing.category})`));
        if (groupName === 'whiskey_whisky' && found.length > 1) {
          const genericOnly = found.filter(
            (ing) =>
              /^(whiskey|whisky)$/i.test(ing.name.trim()) ||
              normalizeForComparison(ing.name) === 'whiskey' ||
              normalizeForComparison(ing.name) === 'whisky'
          );
          if (genericOnly.length >= 2) {
            console.log('     ⚠️  → Likely duplicates: both "Whiskey" and "Whisky" exist');
          }
        }
      }
    }
    console.log('\n');

    // 4. Known misclassifications
    const misclassified = [
      { pattern: /jägermeister|jagermeister/i, expected: 'Liqueur', wrongCategories: ['Mixer'] },
      { pattern: /southern comfort/i, expected: 'Liqueur', wrongCategories: ['Mixer'] },
      { pattern: /sloe gin/i, expected: 'Liqueur', wrongCategories: ['Spirit', 'Mixer'] },
    ];

    console.log('🚨 POTENTIALLY MISCLASSIFIED:');
    let foundMisclassified = false;
    for (const { pattern, expected, wrongCategories } of misclassified) {
      const matches = ingredients.filter(
        (ing) =>
          pattern.test(ing.name) &&
          wrongCategories.includes(ing.category || '')
      );
      if (matches.length > 0) {
        foundMisclassified = true;
        matches.forEach((ing) => {
          console.log(`   - "${ing.name}" (ID ${ing.id}): ${ing.category} → should be ${expected}`);
        });
      }
    }
    if (!foundMisclassified) {
      console.log('   (None found – migration script may have already fixed these)\n');
    }
    console.log('');

    // 5. Summary
    console.log('='.repeat(50));
    console.log('📌 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Run category migration:  npx tsx scripts/migrate-supabase-ingredient-categories.ts --confirm`);
    if (exactDuplicates.length > 0 || (whiskeyLike.length > 1 && whiskeyLike.some((i) => /^(whiskey|whisky)$/i.test(i.name)))) {
      console.log(`Consider creating combine script for: Whiskey/Whisky (if duplicates exist)`);
    }
    console.log('');
  } catch (err) {
    console.error('❌ Audit failed:', err);
    process.exit(1);
  }
}

auditDuplicates();
