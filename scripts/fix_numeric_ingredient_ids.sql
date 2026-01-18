-- Fix numeric ingredient IDs in bar_ingredients table
-- This script identifies and fixes the issue where numeric IDs like "121" and "135"
-- are stored instead of proper UUIDs

-- First, let's see what's in the bar_ingredients table for ethankalkwarf
SELECT
  bi.id,
  bi.user_id,
  bi.ingredient_id,
  bi.ingredient_name,
  p.display_name,
  p.username
FROM bar_ingredients bi
JOIN profiles p ON bi.user_id = p.id
WHERE p.username = 'ethankalkwarf'
ORDER BY bi.created_at DESC;

-- Check what ingredients have legacy_id values that match the numeric IDs
SELECT
  id,
  legacy_id,
  name,
  category
FROM ingredients
WHERE legacy_id IN ('121', '135')
ORDER BY legacy_id;

-- Update the bar_ingredients table to use proper UUIDs
-- Map legacy IDs to UUIDs
UPDATE bar_ingredients
SET
  ingredient_id = CASE
    WHEN ingredient_id = '121' THEN (SELECT id FROM ingredients WHERE legacy_id = '121')
    WHEN ingredient_id = '135' THEN (SELECT id FROM ingredients WHERE legacy_id = '135')
    ELSE ingredient_id
  END,
  ingredient_name = CASE
    WHEN ingredient_id = '121' THEN (SELECT name FROM ingredients WHERE legacy_id = '121')
    WHEN ingredient_id = '135' THEN (SELECT name FROM ingredients WHERE legacy_id = '135')
    ELSE ingredient_name
  END
WHERE ingredient_id IN ('121', '135');

-- Verify the fix
SELECT
  bi.id,
  bi.user_id,
  bi.ingredient_id,
  bi.ingredient_name,
  i.name as ingredient_table_name,
  i.legacy_id,
  p.display_name,
  p.username
FROM bar_ingredients bi
JOIN profiles p ON bi.user_id = p.id
LEFT JOIN ingredients i ON bi.ingredient_id = i.id
WHERE p.username = 'ethankalkwarf'
ORDER BY bi.created_at DESC;