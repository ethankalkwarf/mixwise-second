#!/usr/bin/env tsx
/**
 * Apply known storage image matches for review-batch-001 cocktails.
 * Clears incorrect near-matches (e.g. Vodka Stinger for Stinger).
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { cocktailBlobPath, publishStorageObjectToBlob } from './lib/catalogMedia';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'cocktail-images-fullsize';

/** Exact filename aliases that fuzzy matching may miss or get wrong */
const ALIASES: Record<string, string> = {
  'floridita-daiquiri': 'El Floridita Daiquiri.png',
  'vesper-martini': 'Vesper Martini image.png',
  'army-and-navy': 'Army & Navy.png',
  boulevardier: 'Boulevardier cocktail.png',
  bramble: 'Bramble.png',
  caipirinha: 'Caipirinha.png',
  'pisco-sour': 'Pisco Sour.png',
  zombie: 'Zombie cocktail.png',
  tuxedo: 'Tuxedo No 1.png',
};

/** Never auto-match these to lookalike files */
const BLOCK_AUTO: Record<string, string[]> = {
  stinger: ['vodka-stinger', 'vodka stinger'],
};

const BATCH_SLUGS = Object.keys(ALIASES).concat([
  'bobby-burns',
  'champs-elysees',
  'fancy-free',
  'improved-whiskey-cocktail',
  'little-italy',
  'montgomery-martini',
  'preakness',
  'widows-kiss',
  'brooklyn',
  'hot-toddy',
  'paradise',
  'stinger',
  'remember-the-maine',
  'porto-flip',
  'french-connection',
]);

function normalize(s: string) {
  return s
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-cocktail$/, '')
    .replace(/-image$/, '');
}

async function listFiles(): Promise<string[]> {
  const files: string[] = [];
  let offset = 0;
  while (true) {
    const { data } = await sb.storage.from(BUCKET).list('', { limit: 1000, offset });
    if (!data?.length) break;
    files.push(...data.map((f) => f.name));
    offset += 1000;
    if (data.length < 1000) break;
  }
  return files;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const files = await listFiles();
  const byNorm = new Map(files.map((f) => [normalize(f), f]));

  const { data: cocktails, error } = await sb
    .from('cocktails')
    .select('id, slug, name, image_url')
    .in('slug', [...new Set(BATCH_SLUGS)]);

  if (error) throw error;

  let matched = 0;
  let cleared = 0;
  const missing: string[] = [];

  for (const cocktail of cocktails || []) {
    const blocked = BLOCK_AUTO[cocktail.slug] || [];
    let file = ALIASES[cocktail.slug];

    if (file && !files.includes(file)) {
      const want = normalize(file);
      file = files.find((f) => normalize(f) === want) || file;
      if (!files.includes(file)) file = undefined;
    }

    if (!file) {
      const n = normalize(cocktail.slug);
      const candidate =
        byNorm.get(n) ||
        files.find((f) => {
          const nf = normalize(f);
          return nf === n || nf.includes(n) || n.includes(nf);
        });
      if (candidate) {
        const nf = normalize(candidate);
        if (blocked.some((b) => nf.includes(normalize(b)))) {
          file = undefined;
        } else {
          file = candidate;
        }
      }
    }

    if (!file) {
      if (cocktail.image_url && apply) {
        await sb.from('cocktails').update({ image_url: null }).eq('id', cocktail.id);
        cleared++;
        console.log('CLEAR', cocktail.slug);
      }
      missing.push(cocktail.slug);
      continue;
    }

    console.log(`${apply ? 'SET' : 'WOULD SET'}`, cocktail.slug, '->', file, '=> blob');
    if (apply) {
      try {
        const published = await publishStorageObjectToBlob(sb, {
          storagePath: file,
          blobPath: cocktailBlobPath(cocktail.slug),
        });
        const { error: upErr } = await sb
          .from('cocktails')
          .update({ image_url: published.url })
          .eq('id', cocktail.id);
        if (upErr) console.error(upErr.message);
        else matched++;
      } catch (err) {
        console.error(cocktail.slug, (err as Error).message);
      }
    } else {
      matched++;
    }
  }

  console.log(`\n${apply ? 'Applied' : 'Dry-run'} matches: ${matched}`);
  if (cleared) console.log(`Cleared wrong matches: ${cleared}`);
  console.log(`Still need photos: ${missing.join(', ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
