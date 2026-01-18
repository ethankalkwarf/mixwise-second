-- =============================================
-- Cleanup Orphaned Favorites
-- =============================================
-- This script removes favorite records that reference cocktails
-- that no longer exist in the cocktails table.
--
-- This can happen if:
-- - A cocktail was deleted from Sanity/CMS or Supabase
-- - A cocktail ID was changed
-- - A favorite was created with an invalid cocktail_id

-- First, let's check what orphaned favorites exist
-- A favorite is orphaned if its cocktail_id doesn't match:
--   - cocktails.id (UUID)
--   - cocktails.legacy_id (text, for old Sanity IDs)
SELECT 
  f.id,
  f.user_id,
  f.cocktail_id,
  f.cocktail_name,
  f.created_at
FROM public.favorites f
LEFT JOIN public.cocktails c ON f.cocktail_id = c.id OR f.cocktail_id = c.legacy_id
WHERE c.id IS NULL
ORDER BY f.cocktail_name, f.created_at;

-- Delete orphaned favorites
-- This removes all favorites where the cocktail_id doesn't exist in the cocktails table
-- (checked against both id and legacy_id fields)
DELETE FROM public.favorites
WHERE cocktail_id NOT IN (
  SELECT id::TEXT FROM public.cocktails
  UNION
  SELECT legacy_id FROM public.cocktails WHERE legacy_id IS NOT NULL
);

-- Verify the cleanup
-- This should return 0 rows after cleanup
SELECT 
  COUNT(*) as orphaned_favorites_count
FROM public.favorites f
LEFT JOIN public.cocktails c ON f.cocktail_id = c.id OR f.cocktail_id = c.legacy_id
WHERE c.id IS NULL;