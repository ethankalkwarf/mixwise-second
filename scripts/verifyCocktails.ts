/**
 * Verify Cocktail in Supabase
 *
 * Fetches a specific cocktail by slug from Supabase and logs its main fields.
 *
 * Usage: npm run verify:cocktails <slug>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for read-only operations
);

/**
 * Verify a cocktail by slug
 */
async function verifyCocktail(slug: string) {
  console.log(`🔍 Verifying cocktail: ${slug}`);

  try {
    const { data, error } = await supabase
      .from('cocktails')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('❌ Error fetching cocktail:', error);
      return;
    }

    if (!data) {
      console.log('❌ Cocktail not found');
      return;
    }

    console.log('✅ Cocktail found!');
    console.log('📋 Basic Info:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Legacy ID: ${data.legacy_id || 'N/A'}`);

    console.log('📝 Descriptions:');
    console.log(`   Short: ${data.short_description || 'N/A'}`);
    console.log(`   Long: ${data.long_description ? data.long_description.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   SEO: ${data.seo_description || 'N/A'}`);

    console.log('🍸 Cocktail Details:');
    console.log(`   Base Spirit: ${data.base_spirit || 'N/A'}`);
    console.log(`   Primary Category: ${data.category_primary || 'N/A'}`);
    console.log(`   Glassware: ${data.glassware || 'N/A'}`);
    console.log(`   Garnish: ${data.garnish || 'N/A'}`);
    console.log(`   Technique: ${data.technique || 'N/A'}`);
    console.log(`   Difficulty: ${data.difficulty || 'N/A'}`);

    console.log('🏷️  Categories & Tags:');
    console.log(`   Categories: ${data.categories_all ? data.categories_all.join(', ') : 'N/A'}`);
    console.log(`   Tags: ${data.tags ? data.tags.join(', ') : 'N/A'}`);

    console.log('👅 Flavor Profile:');
    console.log(`   Strength: ${data.flavor_strength || 'N/A'}`);
    console.log(`   Sweetness: ${data.flavor_sweetness || 'N/A'}`);
    console.log(`   Tartness: ${data.flavor_tartness || 'N/A'}`);
    console.log(`   Bitterness: ${data.flavor_bitterness || 'N/A'}`);
    console.log(`   Aroma: ${data.flavor_aroma || 'N/A'}`);
    console.log(`   Texture: ${data.flavor_texture || 'N/A'}`);

    console.log('📚 Content:');
    console.log(`   Notes: ${data.notes || 'N/A'}`);
    console.log(`   Fun Fact: ${data.fun_fact || 'N/A'}`);
    console.log(`   Fun Fact Source: ${data.fun_fact_source || 'N/A'}`);

    console.log('🖼️  Images:');
    console.log(`   Image URL: ${data.image_url || 'N/A'}`);
    console.log(`   Image Alt: ${data.image_alt || 'N/A'}`);

    console.log('📊 Metadata & Ingredients:');
    console.log(`   Metadata JSON: ${data.metadata_json ? 'Present' : 'N/A'}`);
    console.log(`   Ingredients: ${data.ingredients ? (data.ingredients as any[]).length + ' items' : 'N/A'}`);
    console.log(`   Instructions: ${data.instructions ? data.instructions.substring(0, 100) + '...' : 'N/A'}`);

    console.log('⏰ Timestamps:');
    console.log(`   Created: ${data.created_at}`);
    console.log(`   Updated: ${data.updated_at}`);

  } catch (error) {
    console.error('❌ Error verifying cocktail:', error);
  }
}

// Get slug from command line arguments
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Please provide a cocktail slug as an argument');
  console.log('Usage: npm run verify:cocktails <slug>');
  process.exit(1);
}

verifyCocktail(slug);
