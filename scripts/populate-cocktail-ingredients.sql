-- Populate cocktail_ingredients_uuid table from cocktails.ingredients JSON
-- Run this in Supabase SQL Editor

-- FIRST: Inspect what the ingredients data actually looks like
-- Check ALL cocktails, not just ones with ingredients
SELECT
    COUNT(*) as total_cocktails,
    COUNT(CASE WHEN ingredients IS NULL THEN 1 END) as null_ingredients,
    COUNT(CASE WHEN ingredients::text = '' THEN 1 END) as empty_string_ingredients,
    COUNT(CASE WHEN ingredients IS NOT NULL AND ingredients::text != '' THEN 1 END) as has_some_ingredients_data
FROM cocktails;

-- Now show sample of cocktails with ingredients data
SELECT
    id,
    name,
    ingredients,
    jsonb_typeof(ingredients) as data_type,
    CASE
        WHEN ingredients IS NULL THEN 'NULL'
        WHEN ingredients::text = '' THEN 'EMPTY_STRING'
        WHEN jsonb_typeof(ingredients) = 'array' THEN 'ARRAY'
        WHEN jsonb_typeof(ingredients) = 'string' THEN 'STRING'
        ELSE 'OTHER'
    END as ingredients_type
FROM cocktails
WHERE ingredients IS NOT NULL
    AND ingredients::text != ''
    AND jsonb_typeof(ingredients) IS NOT NULL
LIMIT 3;

-- Clear existing data (optional, for re-running)
TRUNCATE TABLE cocktail_ingredients_uuid;

-- Insert ingredient relationships from cocktails.ingredients JSON
-- Note: Only insert cocktail_id and ingredient_id since those are the only columns that exist
INSERT INTO cocktail_ingredients_uuid (cocktail_id, ingredient_id)
SELECT
    c.id as cocktail_id,
    CAST(ing->>'id' AS INTEGER) as ingredient_id
FROM
    cocktails c,
    jsonb_array_elements(
        CASE
            WHEN c.ingredients IS NULL OR c.ingredients::text = '' THEN '[]'::jsonb
            WHEN jsonb_typeof(c.ingredients) = 'array' THEN c.ingredients
            WHEN jsonb_typeof(c.ingredients) = 'string' THEN c.ingredients::jsonb
            ELSE '[]'::jsonb
        END
    ) as ing
WHERE
    c.ingredients IS NOT NULL
    AND c.ingredients::text != ''
    AND ing->>'id' IS NOT NULL
    AND CAST(ing->>'id' AS INTEGER) > 0;

-- First, let's inspect what the ingredients data looks like
SELECT
    id,
    name,
    ingredients,
    jsonb_typeof(ingredients) as data_type,
    CASE
        WHEN ingredients IS NULL THEN 'NULL'
        WHEN ingredients::text = '' THEN 'EMPTY_STRING'
        WHEN jsonb_typeof(ingredients) = 'array' THEN 'ARRAY'
        WHEN jsonb_typeof(ingredients) = 'string' THEN 'STRING'
        ELSE 'OTHER'
    END as ingredients_type
FROM cocktails
WHERE ingredients IS NOT NULL
    AND ingredients::text != ''
LIMIT 10;

-- Clear existing data (optional, for re-running)
TRUNCATE TABLE cocktail_ingredients_uuid;

-- Verify the data was inserted
SELECT
    COUNT(*) as total_relationships,
    COUNT(DISTINCT cocktail_id) as cocktails_with_ingredients,
    COUNT(DISTINCT ingredient_id) as unique_ingredients
FROM cocktail_ingredients_uuid;

-- Show a sample of the data
SELECT
    c.name as cocktail_name,
    i.name as ingredient_name
FROM cocktail_ingredients_uuid ci
JOIN cocktails c ON c.id = ci.cocktail_id
JOIN ingredients i ON i.id = ci.ingredient_id
ORDER BY c.name, i.name
LIMIT 20;
