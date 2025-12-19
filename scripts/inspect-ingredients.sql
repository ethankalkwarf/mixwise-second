-- Simple inspection script - copy and run this entire thing

-- Check ALL cocktails and their ingredients status
SELECT
    COUNT(*) as total_cocktails,
    COUNT(CASE WHEN ingredients IS NULL THEN 1 END) as null_ingredients,
    COUNT(CASE WHEN ingredients::text = '' THEN 1 END) as empty_string_ingredients,
    COUNT(CASE WHEN ingredients IS NOT NULL AND ingredients::text != '' THEN 1 END) as has_some_ingredients_data
FROM cocktails;

-- Show detailed breakdown of ingredient data types
SELECT
    jsonb_typeof(ingredients) as data_type,
    COUNT(*) as count
FROM cocktails
WHERE ingredients IS NOT NULL AND ingredients::text != ''
GROUP BY jsonb_typeof(ingredients);

-- Show actual sample data from cocktails with ingredients
SELECT
    id,
    name,
    LEFT(ingredients::text, 300) as ingredients_preview,
    jsonb_typeof(ingredients) as data_type,
    CASE
        WHEN ingredients IS NULL THEN 'NULL'
        WHEN ingredients::text = '' THEN 'EMPTY_STRING'
        WHEN jsonb_typeof(ingredients) = 'array' THEN 'ARRAY - length: ' || jsonb_array_length(ingredients)::text
        WHEN jsonb_typeof(ingredients) = 'string' THEN 'STRING'
        ELSE 'OTHER'
    END as ingredients_type
FROM cocktails
WHERE ingredients IS NOT NULL
    AND ingredients::text != ''
LIMIT 5;
