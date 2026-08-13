#!/usr/bin/env tsx
/**
 * Fill the MixWise cocktail image master template from live cocktail rows.
 *
 * Usage:
 *   npx tsx scripts/fillCocktailImagePrompts.ts
 *   npx tsx scripts/fillCocktailImagePrompts.ts --slug bobby-burns
 *   npx tsx scripts/fillCocktailImagePrompts.ts --missing-only
 *   npx tsx scripts/fillCocktailImagePrompts.ts --out data/image-prompts-pending.md
 *
 * See docs/COCKTAIL_IMAGE_PROMPT.md for the canonical template and rules.
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'node:util';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CocktailRow = {
  slug: string;
  name: string;
  glassware: string | null;
  garnish: string | null;
  ingredients: unknown;
  instructions: string | null;
  category_primary: string | null;
  categories_all: string[] | null;
  tags: string[] | null;
  long_description: string | null;
  image_alt: string | null;
  technique: string | null;
  image_url: string | null;
  base_spirit: string | null;
};

const REVIEW_BATCH_MISSING = [
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
];

function asList(value: string[] | string | null | undefined): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function ingredientsText(ingredients: unknown): string {
  if (!ingredients) return '';
  if (typeof ingredients === 'string') return ingredients;
  if (Array.isArray(ingredients)) {
    return ingredients
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'text' in item) {
          return String((item as { text: string }).text);
        }
        return JSON.stringify(item);
      })
      .join(' | ');
  }
  return JSON.stringify(ingredients);
}

function inferLighting(c: CocktailRow): string {
  const blob = `${c.category_primary} ${asList(c.categories_all)} ${asList(c.tags)} ${c.technique}`.toLowerCase();
  if (blob.includes('tiki') || blob.includes('tropical')) {
    return 'Warm late-afternoon tropical light with soft golden highlights';
  }
  if (blob.includes('hot') || c.slug === 'hot-toddy') {
    return 'Warm indoor evening light with gentle steam-friendly side lighting';
  }
  if (blob.includes('dessert') || blob.includes('cream') || blob.includes('flip')) {
    return 'Soft warm indoor light with gentle specular highlights on the foam';
  }
  if (blob.includes('spirit-forward') || blob.includes('stir')) {
    return 'Clean cool side lighting with crisp glass reflections and controlled highlights';
  }
  if (blob.includes('sour') || blob.includes('shake')) {
    return 'Bright natural window light with soft shadows and fresh citrus clarity';
  }
  if (blob.includes('highball') || blob.includes('sparkling') || blob.includes('spritz')) {
    return 'Bright daylight with lively highlights on ice and carbonation';
  }
  return 'Soft natural side lighting appropriate for a recipe-website hero photo';
}

function inferBackground(c: CocktailRow): string {
  const blob = `${c.category_primary} ${asList(c.categories_all)} ${asList(c.tags)} ${c.base_spirit}`.toLowerCase();
  if (blob.includes('tiki')) return 'tropical bar shelf with muted rattan and foliage';
  if (blob.includes('italian') || blob.includes('aperitivo') || blob.includes('negroni')) {
    return 'Italian café marble bar top with soft warm interior';
  }
  if (blob.includes('havana') || blob.includes('cuban')) return 'Havana bar interior with warm wood and soft ambient lamps';
  if (blob.includes('new orleans')) return 'dim New Orleans bar wood paneling';
  if (c.slug === 'hot-toddy') return 'cozy indoor table near a window on a cool evening';
  if (blob.includes('dessert') || blob.includes('after-dinner')) {
    return 'quiet after-dinner bar setting with dark wood';
  }
  if (blob.includes('spirit-forward') || blob.includes('manhattan') || blob.includes('martini')) {
    return 'classic cocktail bar with dark wood and soft bokeh lights';
  }
  return 'understated recipe-studio bar setting';
}

function inferBokeh(c: CocktailRow): string {
  const blob = `${c.category_primary} ${asList(c.categories_all)}`.toLowerCase();
  if (blob.includes('spirit-forward') || blob.includes('dessert')) {
    return 'warm low-key bokeh points';
  }
  if (blob.includes('tiki') || blob.includes('highball')) {
    return 'soft daylight bokeh';
  }
  return 'gentle shallow-depth bokeh';
}

function inferKeyCharacteristic(c: CocktailRow): string {
  const ingredients = ingredientsText(c.ingredients).toLowerCase();
  const technique = (c.technique || '').toLowerCase();
  const category = (c.category_primary || '').toLowerCase();
  const instructions = (c.instructions || '').toLowerCase();

  if (ingredients.includes('egg') || instructions.includes('egg white') || instructions.includes('dry-shake')) {
    return 'dense egg-white foam cap with soft meringue texture';
  }
  if (category.includes('sparkling') || ingredients.includes('champagne') || ingredients.includes('prosecco') || ingredients.includes('soda') || ingredients.includes('ginger beer')) {
    return 'visible fine carbonation and lively bubble trails';
  }
  if (technique.includes('stir') || category.includes('spirit')) {
    return 'exceptionally clear spirit-forward liquid with crisp reflections';
  }
  if (instructions.includes('crushed ice') || instructions.includes('pebble')) {
    return 'mounded crushed ice with wet irregular melt edges';
  }
  if (ingredients.includes('cream') || category.includes('dessert') || c.slug.includes('flip')) {
    return 'creamy viscosity and soft opaque body';
  }
  if (technique.includes('shake') || category.includes('sour')) {
    return 'freshly shaken aeration with a thin natural froth line';
  }
  if (c.slug === 'hot-toddy' || category.includes('hot')) {
    return 'hot non-iced drink with faint rising steam';
  }
  return 'finished-drink realism with accurate liquid body and glass highlights';
}

function inferImperfections(c: CocktailRow): string {
  const ingredients = ingredientsText(c.ingredients).toLowerCase();
  const technique = (c.technique || '').toLowerCase();
  const category = (c.category_primary || '').toLowerCase();

  const bits: string[] = [];
  if (technique.includes('stir') || category.includes('spirit')) {
    bits.push('one faint fingerprint near the base', 'a tiny dust mote in a highlight', 'slightly uneven reflection on the glass rim');
  } else if (category.includes('hot') || c.slug === 'hot-toddy') {
    bits.push('soft irregular steam drift', 'a small drip on the mug exterior', 'slightly uneven honey sheen on the surface');
  } else if (ingredients.includes('egg') || c.slug.includes('flip')) {
    bits.push('slightly uneven foam edge', 'one tiny bubble irregularity in the foam', 'a soft nutmeg scatter that is not perfectly symmetrical');
  } else {
    bits.push('light natural condensation variation', 'one small ice melt water spot on the surface', 'a barely imperfect garnish placement', 'subtle micro-scuff on the glass foot');
  }
  return bits.slice(0, 3).join('; ');
}

function inferCameraAngle(c: CocktailRow): string {
  const glass = (c.glassware || '').toLowerCase();
  const instructions = (c.instructions || '').toLowerCase();
  const garnish = (c.garnish || '').toLowerCase();

  if (glass.includes('highball') || glass.includes('collins') || glass.includes('shot') || glass.includes('mug')) {
    return 'a straight-on eye-level angle that emphasizes the tall silhouette';
  }
  if (glass.includes('rocks') || glass.includes('old-fashioned') || instructions.includes('large ice') || instructions.includes('float')) {
    return 'a slight top-front angle so the ice and surface read clearly';
  }
  if (garnish.includes('rim') || garnish.includes('salt') || garnish.includes('sugar')) {
    return 'a slightly elevated angle so the rim treatment is visible';
  }
  if (glass.includes('coupe') || glass.includes('nick') || glass.includes('martini') || glass.includes('cocktail')) {
    return 'a straight-on or slightly low angle that favors the stemmed silhouette';
  }
  return 'a centered recipe-hero angle with the glass dominant in frame';
}

function inferSurface(c: CocktailRow): string {
  const blob = `${c.category_primary} ${asList(c.categories_all)} ${asList(c.tags)}`.toLowerCase();
  if (blob.includes('tiki')) return 'textured tropical wood surface';
  if (c.slug === 'hot-toddy' || blob.includes('hot')) return 'matte ceramic coaster on a warm wood table';
  if (blob.includes('dessert') || blob.includes('after-dinner')) return 'dark polished wood bar surface';
  if (blob.includes('spirit-forward') || blob.includes('martini') || blob.includes('manhattan')) {
    return 'dark stone or polished wood bar surface';
  }
  return 'clean matte stone surface suited to a recipe website';
}

function inferLiquidAppearance(c: CocktailRow): string {
  if (c.image_alt && c.image_alt.trim()) {
    return `Appearance target from editorial alt text: ${c.image_alt.trim()}`;
  }
  const ingredients = ingredientsText(c.ingredients);
  const long = c.long_description || '';
  return `Derive finished-drink liquid color, clarity, opacity, and texture strictly from these ingredients and the preparation: Ingredients: ${ingredients}. Context: ${long}`.trim();
}

function inferIce(c: CocktailRow): string {
  const instructions = (c.instructions || '').toLowerCase();
  const glass = (c.glassware || '').toLowerCase();
  const category = (c.category_primary || '').toLowerCase();

  if (category.includes('hot') || c.slug === 'hot-toddy') return 'No ice (served hot)';
  if (instructions.includes('crushed ice')) return 'Mounded crushed ice';
  if (instructions.includes('large ice') || instructions.includes('large cube')) return 'One large clear ice cube';
  if (instructions.includes('without ice') || instructions.includes('neat') || instructions.includes('no ice')) {
    return 'No ice in the serving glass';
  }
  if (glass.includes('coupe') || glass.includes('nick') || glass.includes('martini') || glass.includes('cocktail') || glass.includes('flute')) {
    return 'No ice in the serving glass (served up)';
  }
  if (glass.includes('rocks') || glass.includes('highball') || glass.includes('collins') || glass.includes('mug')) {
    return 'Fresh serving ice appropriate to the glass';
  }
  return 'Ice only if the finished serve requires it; otherwise no ice in the glass';
}

function inferCondensation(c: CocktailRow): string {
  const category = (c.category_primary || '').toLowerCase();
  const glass = (c.glassware || '').toLowerCase();
  if (category.includes('hot') || c.slug === 'hot-toddy') return 'No condensation (hot serve)';
  if (glass.includes('coupe') || glass.includes('nick') || glass.includes('martini') || glass.includes('cocktail')) {
    return 'Light condensation only if realistic; prefer a clean chilled look';
  }
  if (glass.includes('highball') || glass.includes('collins') || glass.includes('rocks')) {
    return 'Light natural condensation';
  }
  return 'Light condensation where cold glass meets air; avoid heavy dripping';
}

function inferGarnish(c: CocktailRow): string {
  const g = (c.garnish || '').trim();
  if (!g || /^none$/i.test(g)) return 'No garnish (ungarnished)';
  return `Garnish exactly as specified: ${g.replace(/\|/g, ' and ')}`;
}

function fillPrompt(c: CocktailRow): string {
  return `Create a single hyper-realistic photorealistic image of a **${c.name}** cocktail for a recipe website.

**Global visual style:**

* ${inferLighting(c)}
* Blurred ${inferBackground(c)} with ${inferBokeh(c)}
* 2048×1365 pixel landscape aspect ratio (3:2) — prefer the highest resolution available; avoid 1200×630
* ${inferKeyCharacteristic(c)}
* Avoid an overly perfect shot: ${inferImperfections(c)}
* No humans, no hands, no logos, no text

**Composition and glassware:**

* Use a ${c.glassware || 'glass appropriate to the cocktail'}
* Center the glass perfectly in the frame
* Capture ${inferCameraAngle(c)}
* Place on a ${inferSurface(c)}

**Drink-specific appearance:**

* Featured cocktail: ${c.name}
* ${inferLiquidAppearance(c)}
* ${inferIce(c)}
* ${inferCondensation(c)}
* ${inferGarnish(c)}

---
Source fields used:
- slug: ${c.slug}
- technique: ${c.technique || '(none)'}
- category_primary: ${c.category_primary || '(none)'}
- categories_all: ${asList(c.categories_all) || '(none)'}
- tags: ${asList(c.tags) || '(none)'}
- ingredients: ${ingredientsText(c.ingredients)}
- instructions: ${c.instructions || '(none)'}
`.trim();
}

async function main() {
  const {
    values: { slug, 'missing-only': missingOnly, out, batch },
  } = parseArgs({
    options: {
      slug: { type: 'string' },
      'missing-only': { type: 'boolean', default: false },
      out: { type: 'string' },
      batch: { type: 'string' },
    },
  });

  let query = sb
    .from('cocktails')
    .select(
      'slug,name,glassware,garnish,ingredients,instructions,category_primary,categories_all,tags,long_description,image_alt,technique,image_url,base_spirit'
    )
    .order('name');

  if (slug) {
    query = query.eq('slug', slug);
  } else if (batch === 'review-001') {
    query = query.in('slug', REVIEW_BATCH_MISSING);
  } else if (missingOnly || !slug) {
    // default: review-batch drinks still missing images
    query = query.in('slug', REVIEW_BATCH_MISSING).is('image_url', null);
  }

  const { data, error } = await query;
  if (error) throw error;

  const cocktails = (data || []) as CocktailRow[];
  if (cocktails.length === 0) {
    console.log('No matching cocktails found.');
    return;
  }

  const sections = cocktails.map((c) => `## ${c.name} (\`${c.slug}\`)\n\n\`\`\`text\n${fillPrompt(c)}\n\`\`\``);
  const markdown = `# Filled MixWise image prompts\n\nGenerated ${new Date().toISOString()}\n\n${sections.join('\n\n')}\n`;

  const outPath = out
    ? resolve(process.cwd(), out)
    : resolve(process.cwd(), 'data/image-prompts-pending.md');

  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log(`Wrote ${cocktails.length} filled prompts → ${outPath}`);
  for (const c of cocktails) console.log('-', c.slug);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
