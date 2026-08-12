#!/usr/bin/env tsx
/**
 * Analyze live cocktail library gaps vs must-haves and pending drafts.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const gapSlugs = [
  'alaska', 'bijou', 'bobby-burns', 'champs-elysees', 'el-diablo', 'fancy-free',
  'floridita-daiquiri', 'gin-rickey', 'improved-whiskey-cocktail', 'little-italy',
  'lucien-gaudin', 'montgomery-martini', 'preakness', 'queens-park-swizzle', 'widows-kiss',
];

const mustHaves = [
  'americano', 'aviation', 'blood-and-sand', 'boulevardier', 'bramble', 'brooklyn',
  'caipirinha', 'clover-club', 'corpse-reviver-no-2', 'daiquiri', 'dark-n-stormy',
  'french-75', 'gimlet', 'godfather', 'grasshopper', 'harvey-wallbanger',
  'hemingway-daiquiri', 'hot-toddy', 'irish-coffee', 'japanese-cocktail', 'last-word',
  'mai-tai', 'manhattan', 'margarita', 'martinez', 'mint-julep', 'mojito', 'negroni',
  'old-fashioned', 'paloma', 'paper-plane', 'penicillin', 'pisco-sour', 'ramos-gin-fizz',
  'rusty-nail', 'sazerac', 'sidecar', 'singapore-sling', 'tom-collins', 'vesper',
  'whiskey-sour', 'white-lady', 'zombie', 'amaretto-sour', 'aperol-spritz',
  'espresso-martini', 'gin-fizz', 'moscow-mule', 'pina-colada', 'tequila-sunrise',
  'cosmopolitan', 'bellini', 'mimosa', 'screwdriver', 'cuba-libre', 'gin-and-tonic',
  'black-russian', 'white-russian', 'angel-face', 'between-the-sheets', 'casino',
  'mary-pickford', 'monkey-gland', 'paradise', 'planters-punch', 'porto-flip',
  'stinger', 'tuxedo', 'yellow-bird', 'alexander', 'brandy-alexander',
  'champagne-cocktail', 'french-connection', 'golden-dream', 'horse-neck',
  'john-collins', 'kir', 'long-island-iced-tea', 'rose', 'sea-breeze',
  'sex-on-the-beach', 'vodka-martini', 'bee-s-knees', 'bees-knees', 'gold-rush',
  'naked-and-famous', 'final-word', 'trinidad-sour', 'jungle-bird', 'corn-n-oil',
  'ti-punch', 'daiquiri-no-3', 'air-mail', 'army-navy', 'remember-the-maine',
  'vodka-gimlet', 'mezcal-negroni', 'blanco-margarita', 'espresso-martini',
];

async function main() {
  const { data: cocktails, error } = await sb
    .from('cocktails')
    .select('slug,name,base_spirit,category_primary,technique,difficulty');
  if (error) throw error;

  const { data: ingredients } = await sb.from('ingredients').select('name').order('name');
  const existing = new Set((cocktails || []).map((c) => c.slug.toLowerCase()));

  console.log('TOTAL', cocktails?.length);
  console.log('\nGAP DRAFT STATUS:');
  for (const s of gapSlugs) console.log(existing.has(s) ? 'HAVE' : 'NEED', s);

  console.log('\nMUST-HAVE MISSING:');
  const missing = [...new Set(mustHaves)].filter((s) => !existing.has(s)).sort();
  console.log(missing.join('\n'));
  console.log(`\nMissing count: ${missing.length}`);

  const count = (key: string) => {
    const map: Record<string, number> = {};
    for (const c of cocktails || []) {
      const v = (c as Record<string, string | null>)[key] || '(null)';
      map[v] = (map[v] || 0) + 1;
    }
    return map;
  };

  console.log('\nTECHNIQUE:', JSON.stringify(count('technique'), null, 2));
  console.log('\nDIFFICULTY:', JSON.stringify(count('difficulty'), null, 2));
  console.log(
    '\nCATEGORY PRIMARY TOP:',
    Object.entries(count('category_primary'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
  );
  console.log('\nINGREDIENTS:');
  console.log((ingredients || []).map((i) => i.name).join(' | '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
