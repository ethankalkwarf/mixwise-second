#!/usr/bin/env tsx

/**
 * Migration script to fix ingredient categories in Supabase
 * 
 * This script will:
 * 1. Move misclassified spirits (mezcal, cognac, etc.) from mixer to spirit
 * 2. Move wines (champagne, prosecco, port) from mixer to appropriate wine category
 * 3. Move liqueurs (cointreau, kahlua, etc.) from mixer to liqueur
 * 4. Move fortified wines (vermouth, sherry) to fortified_wine
 * 5. Move sparkling wines (champagne, prosecco) to sparkling_wine
 * 6. Move bitter liqueurs (campari, aperol) to amaro
 * 7. Move syrups, citrus, garnishes to correct categories
 * 8. Move beers to beer category
 * 
 * Run with --dry-run (default) to preview changes without making them
 * Run with --confirm to actually apply the changes
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Category mappings - each ingredient name (lowercase) maps to its correct category
// Note: Supabase uses capitalized categories (e.g., "Spirit" not "spirit")
const CATEGORY_FIXES: Record<string, string> = {
  // ============================================
  // SPIRITS (distilled alcoholic beverages)
  // ============================================
  'absinthe': 'Spirit',
  'mezcal': 'Spirit',
  'cognac': 'Spirit',
  'pisco': 'Spirit',
  'cachaca': 'Spirit',
  'cachaça': 'Spirit',
  'everclear': 'Spirit',
  'scotch': 'Spirit',
  'whisky': 'Spirit',
  'blended scotch': 'Spirit',
  'islay single malt scotch': 'Spirit',
  
  // Fix ginger items incorrectly in spirit
  'ginger beer': 'Mixer',
  'ginger ale': 'Mixer',
  'ginger syrup': 'Syrup',
  'ginger': 'Other', // Just ginger root
  
  // ============================================
  // AMARO / APERITIFS (Italian bitter liqueurs)
  // ============================================
  'campari': 'Amaro',
  'aperol': 'Amaro',
  'amaro montenegro': 'Amaro',
  'amaro': 'Amaro',
  'fernet': 'Amaro',
  'fernet branca': 'Amaro',
  'fernet-branca': 'Amaro',
  'cynar': 'Amaro',
  'averna': 'Amaro',
  
  // ============================================
  // SPARKLING WINES
  // ============================================
  'champagne': 'Sparkling Wine',
  'prosecco': 'Sparkling Wine',
  'cava': 'Sparkling Wine',
  'sparkling wine': 'Sparkling Wine',
  
  // ============================================
  // FORTIFIED WINES (aromatized/fortified)
  // ============================================
  'vermouth': 'Fortified Wine',
  'dry vermouth': 'Fortified Wine',
  'sweet vermouth': 'Fortified Wine',
  'rosso vermouth': 'Fortified Wine',
  'bianco vermouth': 'Fortified Wine',
  'port': 'Fortified Wine',
  'ruby port': 'Fortified Wine',
  'tawny port': 'Fortified Wine',
  'sherry': 'Fortified Wine',
  'dry sherry': 'Fortified Wine',
  'cream sherry': 'Fortified Wine',
  'marsala': 'Fortified Wine',
  'lillet': 'Fortified Wine',
  'lillet blanc': 'Fortified Wine',
  'lillet rouge': 'Fortified Wine',
  'dubonnet rouge': 'Fortified Wine',
  'dubonnet': 'Fortified Wine',
  'cocchi americano': 'Fortified Wine',
  
  // ============================================
  // STILL WINES
  // ============================================
  'red wine': 'Wine',
  'white wine': 'Wine',
  'rosé': 'Wine',
  'rose': 'Wine',
  'rosé wine': 'Wine',
  'sake': 'Wine',
  
  // ============================================
  // LIQUEURS (sweetened, flavored spirits)
  // ============================================
  'amaretto': 'Liqueur',
  'amaretto liqueur': 'Liqueur',
  'baileys irish cream': 'Liqueur',
  'baileys': 'Liqueur',
  'irish cream': 'Liqueur',
  'benedictine': 'Liqueur',
  'black sambuca': 'Liqueur',
  'sambuca': 'Liqueur',
  'blue curacao': 'Liqueur',
  'blue curaçao': 'Liqueur',
  'orange curacao': 'Liqueur',
  'orange curaçao': 'Liqueur',
  'curacao': 'Liqueur',
  'curaçao': 'Liqueur',
  'cherry heering': 'Liqueur',
  'cointreau': 'Liqueur',
  'grand marnier': 'Liqueur',
  'triple sec': 'Liqueur',
  'drambuie': 'Liqueur',
  'frangelico': 'Liqueur',
  'galliano': 'Liqueur',
  'green chartreuse': 'Liqueur',
  'yellow chartreuse': 'Liqueur',
  'chartreuse': 'Liqueur',
  'kahlua': 'Liqueur',
  'kahlúa': 'Liqueur',
  'coffee liqueur': 'Liqueur',
  'creme de banane': 'Liqueur',
  'crème de banane': 'Liqueur',
  'creme de cacao': 'Liqueur',
  'crème de cacao': 'Liqueur',
  'dark creme de cacao': 'Liqueur',
  'white creme de cacao': 'Liqueur',
  'creme de cassis': 'Liqueur',
  'crème de cassis': 'Liqueur',
  'creme de mure': 'Liqueur',
  'crème de mûre': 'Liqueur',
  'creme de menthe': 'Liqueur',
  'crème de menthe': 'Liqueur',
  'green creme de menthe': 'Liqueur',
  'white creme de menthe': 'Liqueur',
  'creme de violette': 'Liqueur',
  'crème de violette': 'Liqueur',
  'maraschino liqueur': 'Liqueur',
  'maraschino': 'Liqueur',
  'luxardo maraschino': 'Liqueur',
  'st. germain': 'Liqueur',
  'st germain': 'Liqueur',
  'elderflower liqueur': 'Liqueur',
  'midori': 'Liqueur',
  'midori melon liqueur': 'Liqueur',
  'melon liqueur': 'Liqueur',
  'sloe gin': 'Liqueur', // Not a true gin!
  "pimm's": 'Liqueur',
  'pimms': 'Liqueur',
  "pimm's no. 1": 'Liqueur',
  'falernum': 'Liqueur', // Can be syrup or liqueur - keeping as liqueur for alcoholic version
  'velvet falernum': 'Liqueur',
  'limoncello': 'Liqueur',
  'licor 43': 'Liqueur',
  'parfait amour': 'Liqueur',
  'southern comfort': 'Liqueur',
  'disaronno': 'Liqueur',
  'tia maria': 'Liqueur',
  'godiva liqueur': 'Liqueur',
  
  // ============================================
  // BEER
  // ============================================
  'beer': 'Beer',
  'lager': 'Beer',
  'ale': 'Beer',
  'stout': 'Beer',
  'guinness stout': 'Beer',
  'guinness': 'Beer',
  'pilsner': 'Beer',
  'ipa': 'Beer',
  // Note: Root beer stays in mixer (non-alcoholic)
  
  // ============================================
  // CITRUS (fresh citrus fruits and their juices)
  // ============================================
  'lemon': 'Citrus',
  'lime': 'Citrus',
  'orange': 'Citrus',
  'grapefruit': 'Citrus',
  'blood orange': 'Citrus',
  'lemon juice': 'Citrus',
  'lime juice': 'Citrus',
  'orange juice': 'Citrus',
  'grapefruit juice': 'Citrus',
  'fresh lemon juice': 'Citrus',
  'fresh lime juice': 'Citrus',
  'fresh orange juice': 'Citrus',
  'lemon peel': 'Citrus',
  'lime peel': 'Citrus',
  'orange peel': 'Citrus',
  'lemon wedge': 'Citrus',
  'lime wedge': 'Citrus',
  'orange wedge': 'Citrus',
  'lemon twist': 'Citrus',
  'lime twist': 'Citrus',
  'orange twist': 'Citrus',
  'orange spiral': 'Citrus',
  'roses sweetened lime juice': 'Citrus',
  "rose's lime juice": 'Citrus',
  'yuzu juice': 'Citrus',
  
  // ============================================
  // SYRUPS (sweetened liquid flavorings)
  // ============================================
  'simple syrup': 'Syrup',
  'sugar syrup': 'Syrup',
  'rich simple syrup': 'Syrup',
  'demerara syrup': 'Syrup',
  'honey': 'Syrup',
  'honey syrup': 'Syrup',
  'agave': 'Syrup',
  'agave syrup': 'Syrup',
  'agave nectar': 'Syrup',
  'maple syrup': 'Syrup',
  'grenadine': 'Syrup',
  'orgeat': 'Syrup',
  'orgeat syrup': 'Syrup',
  'mint syrup': 'Syrup',
  'vanilla syrup': 'Syrup',
  'raspberry syrup': 'Syrup',
  'passion fruit syrup': 'Syrup',
  'pineapple syrup': 'Syrup',
  'coconut syrup': 'Syrup',
  'rosemary syrup': 'Syrup',
  'lavender syrup': 'Syrup',
  'cinnamon syrup': 'Syrup',
  'ginger syrup': 'Syrup',
  'chocolate syrup': 'Syrup',
  'corn syrup': 'Syrup',
  'elderflower syrup': 'Syrup',
  'hibiscus syrup': 'Syrup',
  'strawberry syrup': 'Syrup',
  
  // ============================================
  // GARNISHES (decorative/aromatic additions)
  // ============================================
  'mint': 'Garnish',
  'mint leaves': 'Garnish',
  'fresh mint': 'Garnish',
  'mint sprig': 'Garnish',
  'basil': 'Garnish',
  'fresh basil': 'Garnish',
  'rosemary': 'Garnish',
  'rosemary sprig': 'Garnish',
  'thyme': 'Garnish',
  'thyme sprig': 'Garnish',
  'olive': 'Garnish',
  'olives': 'Garnish',
  'green olive': 'Garnish',
  'cherry': 'Garnish',
  'cherries': 'Garnish',
  'maraschino cherry': 'Garnish',
  'maraschino cherries': 'Garnish',
  'cocktail cherry': 'Garnish',
  'luxardo cherry': 'Garnish',
  'celery': 'Garnish',
  'celery stalk': 'Garnish',
  'celery salt': 'Garnish',
  'nutmeg': 'Garnish',
  'cinnamon': 'Garnish',
  'cinnamon stick': 'Garnish',
  'star anise': 'Garnish',
  'whipped cream': 'Garnish',
  'cocktail onion': 'Garnish',
  'pearl onion': 'Garnish',
  'cucumber': 'Garnish',
  'cucumber slice': 'Garnish',
  'cucumber ribbon': 'Garnish',
  'pineapple wedge': 'Garnish',
  'pineapple slice': 'Garnish',
  
  // ============================================
  // OTHER (miscellaneous ingredients)
  // ============================================
  'egg': 'Other',
  'egg white': 'Other',
  'egg yolk': 'Other',
  'whole egg': 'Other',
  'aquafaba': 'Other',
  'sugar': 'Other',
  'brown sugar': 'Other',
  'demerara sugar': 'Other',
  'powdered sugar': 'Other',
  'superfine sugar': 'Other',
  'caster sugar': 'Other',
  'salt': 'Other',
  'sea salt': 'Other',
  'ice': 'Other',
  'crushed ice': 'Other',
  'water': 'Other',
  'hot water': 'Other',
  'soda water': 'Mixer', // This should stay as mixer
  'club soda': 'Mixer', // This should stay as mixer
};

// Additional pattern-based rules for ingredients not explicitly listed
// Note: Categories are capitalized to match Supabase format
const PATTERN_RULES: Array<{ pattern: RegExp; category: string; priority: number }> = [
  // High priority - specific patterns
  { pattern: /\bginger\s*(beer|ale)\b/i, category: 'Mixer', priority: 10 },
  { pattern: /\broot\s*beer\b/i, category: 'Mixer', priority: 10 },
  
  // Spirits
  { pattern: /\bvodka\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bgin\b(?!\s*(ale|ger))/i, category: 'Spirit', priority: 5 }, // gin but not ginger ale
  { pattern: /\brum\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bwhisk(e)?y\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bbourbon\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\brye\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\btequila\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bmezcal\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bbrandy\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bcognac\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\babsinthe\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bpisco\b/i, category: 'Spirit', priority: 5 },
  { pattern: /\bscotch\b/i, category: 'Spirit', priority: 5 },
  
  // Liqueurs with "liqueur" in name
  { pattern: /\bliqueur\b/i, category: 'Liqueur', priority: 5 },
  { pattern: /\bschnapps\b/i, category: 'Liqueur', priority: 5 },
  { pattern: /\bcr[èe]me\s+de\b/i, category: 'Liqueur', priority: 5 },
  
  // Syrups
  { pattern: /\bsyrup\b/i, category: 'Syrup', priority: 5 },
  
  // Bitters
  { pattern: /\bbitters\b/i, category: 'Bitters', priority: 5 },
  
  // Beers (but not root beer or ginger beer)
  { pattern: /\bstout\b/i, category: 'Beer', priority: 5 },
  { pattern: /\blager\b/i, category: 'Beer', priority: 5 },
  { pattern: /\bale\b(?!.*ginger)/i, category: 'Beer', priority: 5 },
  { pattern: /\bpilsner\b/i, category: 'Beer', priority: 5 },
];

interface SupabaseIngredient {
  id: number;
  name: string;
  category: string;
}

interface CategoryChange {
  ingredient: SupabaseIngredient;
  oldCategory: string;
  newCategory: string;
  reason: string;
}

function getNewCategory(ingredient: SupabaseIngredient): { category: string; reason: string } | null {
  const nameLower = ingredient.name.toLowerCase().trim();
  const currentCategory = ingredient.category || 'Mixer';

  // First check explicit mappings
  if (CATEGORY_FIXES[nameLower]) {
    const newCategory = CATEGORY_FIXES[nameLower];
    if (newCategory !== currentCategory) {
      return { category: newCategory, reason: 'Explicit mapping' };
    }
    return null;
  }

  // Check pattern-based rules (sorted by priority)
  const sortedRules = [...PATTERN_RULES].sort((a, b) => b.priority - a.priority);
  
  for (const rule of sortedRules) {
    if (rule.pattern.test(nameLower) && rule.category !== currentCategory) {
      return { category: rule.category, reason: `Pattern match: ${rule.pattern}` };
    }
  }

  return null;
}

async function migrateCategories(dryRun: boolean = true) {
  console.log('🔧 SUPABASE INGREDIENT CATEGORY MIGRATION');
  console.log(`Mode: ${dryRun ? '🧪 DRY RUN (no changes)' : '⚡ LIVE (applying changes)'}`);
  console.log('='.repeat(60) + '\n');

  // Fetch all ingredients from Supabase
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('id, name, category')
    .order('name');

  if (error) {
    console.error('❌ Error fetching ingredients:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${ingredients?.length || 0} ingredients in Supabase\n`);

  if (!ingredients || ingredients.length === 0) {
    console.log('No ingredients found.');
    return;
  }

  const changes: CategoryChange[] = [];
  const alreadyCorrect: SupabaseIngredient[] = [];

  // Analyze each ingredient
  for (const ingredient of ingredients) {
    const result = getNewCategory(ingredient);
    
    if (result) {
      changes.push({
        ingredient,
        oldCategory: ingredient.category || 'Mixer',
        newCategory: result.category,
        reason: result.reason
      });
    } else {
      alreadyCorrect.push(ingredient);
    }
  }

  // Group changes by category transition for cleaner output
  const changesByTransition: Record<string, CategoryChange[]> = {};
  for (const change of changes) {
    const key = `${change.oldCategory} → ${change.newCategory}`;
    if (!changesByTransition[key]) {
      changesByTransition[key] = [];
    }
    changesByTransition[key].push(change);
  }

  // Print summary
  console.log('📋 CHANGES TO BE MADE:');
  console.log('='.repeat(60));

  for (const [transition, transitionChanges] of Object.entries(changesByTransition).sort()) {
    console.log(`\n${transition} (${transitionChanges.length} items):`);
    for (const change of transitionChanges) {
      console.log(`  • ${change.ingredient.name}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY:`);
  console.log(`   Total ingredients: ${ingredients.length}`);
  console.log(`   Changes needed: ${changes.length}`);
  console.log(`   Already correct: ${alreadyCorrect.length}`);
  console.log('='.repeat(60) + '\n');

  // Apply changes if not dry run
  if (!dryRun) {
    console.log('⚡ APPLYING CHANGES...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const change of changes) {
      try {
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ category: change.newCategory })
          .eq('id', change.ingredient.id);

        if (updateError) {
          throw updateError;
        }

        successCount++;
        console.log(`✅ ${change.ingredient.name}: ${change.oldCategory} → ${change.newCategory}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (err) {
        errorCount++;
        console.error(`❌ ${change.ingredient.name}: Failed to update`, err);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION COMPLETE:');
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log('='.repeat(60));

    // Verify final state
    console.log('\n📋 VERIFYING FINAL STATE...\n');

    const { data: finalIngredients, error: verifyError } = await supabase
      .from('ingredients')
      .select('category');

    if (verifyError) {
      console.error('Error verifying:', verifyError);
      return;
    }

    // Count by category
    const counts: Record<string, number> = {};
    for (const ing of finalIngredients || []) {
      const cat = ing.category || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    console.log('📂 Final category breakdown:');
    for (const [cat, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${cat}: ${count}`);
    }

  } else {
    console.log('🧪 DRY RUN COMPLETE - No changes were made');
    console.log('   Run with --confirm to apply changes');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--confirm');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Supabase Ingredient Category Migration Script

Usage:
  npx tsx scripts/migrate-supabase-ingredient-categories.ts [options]

Options:
  --confirm    Apply changes (default is dry run)
  --help, -h   Show this help message

Examples:
  npx tsx scripts/migrate-supabase-ingredient-categories.ts           # Dry run - preview changes
  npx tsx scripts/migrate-supabase-ingredient-categories.ts --confirm # Apply changes

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for write access)
`);
  process.exit(0);
}

migrateCategories(dryRun).catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

