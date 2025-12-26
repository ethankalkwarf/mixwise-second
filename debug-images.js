import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Configuration
const BUCKET_NAME = 'cocktail-images-fullsize';
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

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

async function listImages() {
  try {
    console.log('📂 Listing image files from Supabase Storage...\n');

    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 200 }); // Get all files

    if (listError) {
      console.error('❌ Error listing files:', listError);
      process.exit(1);
    }

    // Filter to image files only
    const imageFiles = files.filter(file =>
      file.name && SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    console.log(`📸 Found ${imageFiles.length} image files total`);

    // Look for Army & Navy and B-52 related files
    console.log('\n🔍 Looking for Army & Navy and B-52 files...');
    const armyNavyFiles = imageFiles.filter(file =>
      file.name && file.name.toLowerCase().includes('army')
    );
    const b52Files = imageFiles.filter(file =>
      file.name && (file.name.toLowerCase().includes('b-52') ||
      file.name.toLowerCase().includes('b52'))
    );

    if (armyNavyFiles.length > 0) {
      console.log('Army & Navy files found:');
      armyNavyFiles.forEach(file => console.log(`  • ${file.name}`));
    } else {
      console.log('❌ No Army & Navy files found');
    }

    if (b52Files.length > 0) {
      console.log('B-52 files found:');
      b52Files.forEach(file => console.log(`  • ${file.name}`));
    } else {
      console.log('❌ No B-52 files found');
    }

    // Now check the cocktail database
    console.log('\n🍸 Checking cocktail database for Army & Navy and B-52...');

    const { data: armyNavyCocktail, error: armyError } = await supabase
      .from('cocktails')
      .select('id, slug, name, image_url')
      .eq('slug', 'army-and-navy')
      .single();

    if (armyError && armyError.code !== 'PGRST116') {
      console.error('Error querying Army & Navy:', armyError);
    } else if (armyNavyCocktail) {
      console.log(`Army & Navy cocktail: ${armyNavyCocktail.name}`);
      console.log(`  Slug: ${armyNavyCocktail.slug}`);
      console.log(`  Image URL: ${armyNavyCocktail.image_url || 'null'}`);
    }

    const { data: b52Cocktail, error: b52Error } = await supabase
      .from('cocktails')
      .select('id, slug, name, image_url')
      .eq('slug', 'b-52')
      .single();

    if (b52Error && b52Error.code !== 'PGRST116') {
      console.error('Error querying B-52:', b52Error);
    } else if (b52Cocktail) {
      console.log(`B-52 cocktail: ${b52Cocktail.name}`);
      console.log(`  Slug: ${b52Cocktail.slug}`);
      console.log(`  Image URL: ${b52Cocktail.image_url || 'null'}`);
    }

    const { data: b52ShotCocktail, error: b52ShotError } = await supabase
      .from('cocktails')
      .select('id, slug, name, image_url')
      .eq('slug', 'b52-shot')
      .single();

    if (b52ShotError && b52ShotError.code !== 'PGRST116') {
      console.error('Error querying B-52 Shot:', b52ShotError);
    } else if (b52ShotCocktail) {
      console.log(`B-52 Shot cocktail: ${b52ShotCocktail.name}`);
      console.log(`  Slug: ${b52ShotCocktail.slug}`);
      console.log(`  Image URL: ${b52ShotCocktail.image_url || 'null'}`);
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

listImages();
