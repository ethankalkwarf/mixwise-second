#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMojito() {
  const { data, error } = await supabase
    .from('cocktails')
    .select('id, slug, image_url')
    .eq('slug', 'mojito')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Mojito data:', data);

  if (data?.image_url) {
    console.log('Image URL exists:', data.image_url);
    console.log('Is URL accessible?');

    try {
      const response = await fetch(data.image_url, { method: 'HEAD' });
      console.log('HTTP Status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  } else {
    console.log('No image_url found');
  }
}

checkMojito().catch(console.error);
