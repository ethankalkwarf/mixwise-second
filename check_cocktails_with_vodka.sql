-- Check cocktails that contain vodka
SELECT 
    c.name as cocktail_name,
    ci.ingredient_id,
    i.name as ingredient_name
FROM cocktail_ingredients ci
JOIN cocktails c ON ci.cocktail_id = c.id
LEFT JOIN ingredients i ON ci.ingredient_id::text = i.id::text
WHERE ci.ingredient_id = 24
ORDER BY c.name
LIMIT 10;
