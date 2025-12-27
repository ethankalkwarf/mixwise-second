-- Check if vodka ingredients are used in cocktail_ingredients
SELECT 
    ci.ingredient_id,
    i.name,
    COUNT(*) as usage_count
FROM cocktail_ingredients ci
LEFT JOIN ingredients i ON ci.ingredient_id::text = i.id::text
WHERE ci.ingredient_id IN (24, 2024)
GROUP BY ci.ingredient_id, i.name;

-- Check total cocktail_ingredients count
SELECT COUNT(*) as total_cocktail_ingredients FROM cocktail_ingredients;
