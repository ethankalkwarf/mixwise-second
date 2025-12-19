// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data: sample, error } = await supabase
    .from("cocktail_ingredients")
    .select("cocktail_id")
    .limit(10);

  if (error) {
    console.error("❌ Verify failed:", error);
    process.exit(1);
  }

  console.log("Sample cocktail_ids:");
  sample.forEach(r => console.log("  ", r.cocktail_id));

  const { count } = await supabase
    .from("cocktail_ingredients")
    .select("*", { count: "exact", head: true });

  console.log(`Total cocktail_ingredients rows: ${count}`);

  console.log("✅ Verification complete");
})();

