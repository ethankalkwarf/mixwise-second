import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Configuration
const BUCKET_NAME = 'cocktail-images-fullsize';

// Environment setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Manual mappings for cocktails that the script missed
const manualMappings = [
  {
    slug: 'army-and-navy',
    imageFile: 'Army & Navy.png',
    name: 'Army & Navy'
  },
  {
    slug: 'b-52',
    imageFile: 'B-52 Shot.png',
    name: 'B-52'
  },
  {
    slug: 'b52-shot',
    imageFile: 'B-52 Shot.png',
    name: 'B-52 Shot'
  }
];

async function fixMissingImages() {
  try {
    console.log('🔧 Fixing missing cocktail images...\n');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const mapping of manualMappings) {
      console.log(`Processing ${mapping.name} (${mapping.slug})...`);

      // Check if cocktail already has an image
      const { data: cocktail, error: fetchError } = await supabase
        .from('cocktails')
        .select('id, slug, name, image_url')
        .eq('slug', mapping.slug)
        .single();

      if (fetchError) {
        console.error(`❌ Error fetching cocktail ${mapping.slug}:`, fetchError.message);
        continue;
      }

      if (cocktail.image_url && cocktail.image_url.trim().length > 0) {
        console.log(`  ⏭️  Already has image URL: ${cocktail.image_url}`);
        skippedCount++;
        continue;
      }

      // Generate public URL for the image
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(mapping.imageFile);

      if (!publicUrlData?.publicUrl) {
        console.error(`❌ Failed to generate public URL for ${mapping.imageFile}`);
        continue;
      }

      const newUrl = publicUrlData.publicUrl;
      console.log(`  📸 Image URL: ${newUrl}`);

      // Update the cocktail
      const { error: updateError } = await supabase
        .from('cocktails')
        .update({ image_url: newUrl })
        .eq('id', cocktail.id);

      if (updateError) {
        console.error(`❌ Failed to update ${mapping.slug}: ${updateError.message}`);
      } else {
        console.log(`✅ Updated ${mapping.name}`);
        updatedCount++;
      }

      console.log(''); // Empty line for readability
    }

    console.log('📊 Summary:');
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already had URL): ${skippedCount}`);
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

fixMissingImages();


