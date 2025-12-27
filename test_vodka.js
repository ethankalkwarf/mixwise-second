const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVodka() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('id, name')
    .in('name', ['Vodka', 'Absolut Vodka']);

  console.log('Ingredients found:', data);
  console.log('Error:', error);
}

testVodka();
