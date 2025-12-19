SELECT
    COUNT(*) as total_cocktails,
    COUNT(CASE WHEN ingredients IS NULL THEN 1 END) as null_ingredients,
    COUNT(CASE WHEN ingredients::text = '' THEN 1 END) as empty_string_ingredients,
    COUNT(CASE WHEN ingredients IS NOT NULL AND ingredients::text != '' THEN 1 END) as has_some_ingredients_data
FROM cocktails;

SELECT
    jsonb_typeof(ingredients) as data_type,
    COUNT(*) as count
FROM cocktails
WHERE ingredients IS NOT NULL AND ingredients::text != ''
GROUP BY jsonb_typeof(ingredients);

SELECT
    id,
    name,
    LEFT(ingredients::text, 300) as ingredients_preview,
    jsonb_typeof(ingredients) as data_type
FROM cocktails
WHERE ingredients IS NOT NULL
    AND ingredients::text != ''
LIMIT 5;

-- Clear existing data (optional, for re-running)
TRUNCATE TABLE cocktail_ingredients_uuid;

-- Insert ingredient relationships by matching text to ingredient names
INSERT INTO cocktail_ingredients_uuid (cocktail_id, ingredient_id)
SELECT DISTINCT
    c.id as cocktail_id,
    i.id as ingredient_id
FROM
    cocktails c,
    jsonb_array_elements(c.ingredients) as ing,
    ingredients i
WHERE
    c.ingredients IS NOT NULL
    AND jsonb_typeof(c.ingredients) = 'array'
    AND ing->>'text' IS NOT NULL
    AND LOWER(TRIM(ing->>'text')) LIKE LOWER(TRIM(i.name || '%'))
    AND i.id > 0;

-- Verify the data was inserted
SELECT
    COUNT(*) as total_relationships,
    COUNT(DISTINCT cocktail_id) as cocktails_with_ingredients,
    COUNT(DISTINCT ingredient_id) as unique_ingredients
FROM cocktail_ingredients_uuid;

-- Show a sample of the data
SELECT
    c.name as cocktail_name,
    i.name as ingredient_name,
    COUNT(*) as occurrences
FROM cocktail_ingredients_uuid ci
JOIN cocktails c ON c.id = ci.cocktail_id
JOIN ingredients i ON i.id = ci.ingredient_id
GROUP BY c.name, i.name
ORDER BY c.name, i.name
LIMIT 20;
