#!/usr/bin/env tsx

const MOJITO_URL = 'https://uvmbmlahkwmlomfoeaha.supabase.co/storage/v1/object/public/cocktail-images-fullsize/Mojito%20Cocktail.png';

async function testImageAccess() {
  console.log('Testing image access for:', MOJITO_URL);

  try {
    const response = await fetch(MOJITO_URL, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    if (response.status === 200) {
      console.log('✅ Image is accessible!');
    } else {
      console.log('❌ Image access failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error accessing image:', error);
  }
}

testImageAccess();
