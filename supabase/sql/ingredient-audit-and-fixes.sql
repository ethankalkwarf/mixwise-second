-- ============================================================
-- INGREDIENT AUDIT & CATEGORY FIXES
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
-- Note: If you hit RLS errors, run as service_role or temporarily
-- disable RLS on ingredients for the update.
-- ============================================================

-- ============================================================
-- PART 1: AUDIT QUERIES (run these first to see current state)
-- ============================================================

-- 1a. Find whiskey/whisky ingredients (potential duplicates)
SELECT id, name, category, type
FROM public.ingredients
WHERE name ILIKE '%whiskey%' OR name ILIKE '%whisky%'
ORDER BY name;

-- 1b. Find exact duplicates (same name, case-insensitive)
SELECT lower(name) as normalized_name, count(*) as count, array_agg(id) as ids, array_agg(name) as names
FROM public.ingredients
GROUP BY lower(name)
HAVING count(*) > 1;

-- 1c. Find misclassified ingredients (e.g. Jägermeister in Mixers)
SELECT id, name, category
FROM public.ingredients
WHERE (
  name ILIKE '%jagermeister%' AND (category = 'Mixer' OR category IS NULL)
  OR name ILIKE '%southern comfort%' AND category = 'Mixer'
)
ORDER BY name;

-- 1d. Full ingredient count by category
SELECT coalesce(category, '(null)') as category, count(*) as count
FROM public.ingredients
GROUP BY category
ORDER BY count DESC;


-- ============================================================
-- PART 2: CATEGORY FIXES (updates)
-- Run after reviewing audit results
-- ============================================================

-- 2a. Jägermeister: Mixer → Liqueur
UPDATE public.ingredients
SET category = 'Liqueur'
WHERE (name ILIKE 'jägermeister' OR name ILIKE 'jagermeister')
  AND (category != 'Liqueur' OR category IS NULL);

-- 2b. Southern Comfort: Mixer → Liqueur
UPDATE public.ingredients
SET category = 'Liqueur'
WHERE name ILIKE '%southern comfort%'
  AND (category != 'Liqueur' OR category IS NULL);

-- 2c. Whiskey/Whisky: ensure Spirit
UPDATE public.ingredients
SET category = 'Spirit'
WHERE (name ILIKE 'whiskey' OR name ILIKE 'whisky')
  AND (category != 'Spirit' OR category IS NULL);

-- 2d. Amaro ingredients (Campari, Aperol, etc.)
UPDATE public.ingredients
SET category = 'Amaro'
WHERE lower(name) IN ('campari', 'aperol', 'amaro montenegro', 'fernet', 'fernet branca', 'cynar', 'averna')
  AND (category != 'Amaro' OR category IS NULL);

-- 2e. Fortified wines → Wine & Beer
UPDATE public.ingredients
SET category = 'Wine & Beer'
WHERE lower(name) IN (
  'vermouth', 'dry vermouth', 'sweet vermouth', 'port', 'sherry', 'lillet',
  'champagne', 'prosecco', 'cava'
)
  AND (category != 'Wine & Beer' OR category IS NULL);

-- Verify: run a quick count after updates
-- SELECT category, count(*) FROM public.ingredients GROUP BY category ORDER BY count DESC;


-- ============================================================
-- PART 3: COMBINING DUPLICATES (Whiskey + Whisky, etc.)
-- ============================================================
-- This is more complex: you must update cocktail_ingredients,
-- bar_ingredients, and shopping_list to point to the canonical
-- ingredient ID before deleting the duplicate.
-- Use the TypeScript script instead: combine-whiskey-ingredients.ts
-- (Create it by copying combine-vodka-ingredients.ts pattern)
