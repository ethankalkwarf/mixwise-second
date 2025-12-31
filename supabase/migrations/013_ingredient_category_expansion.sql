-- =============================================
-- Migration 013: Expand Ingredient Categories
-- =============================================
-- This migration documents the new ingredient categories that have been added:
-- - Amaro: Italian bitter liqueurs (Campari, Aperol, Fernet)
-- - Fortified Wine: Vermouth, sherry, port, Lillet
-- - Sparkling Wine: Champagne, prosecco, cava
-- - Beer: Beer, lager, stout
-- - Other: Eggs, sugar, salt, ice
--
-- Note: The ingredients table uses a TEXT 'category' column without constraints,
-- so no schema changes are needed. This migration serves as documentation.
--
-- The category values are now (capitalized format):
-- - Spirit: Vodka, Gin, Rum, Whiskey, Tequila, Mezcal, Brandy, etc.
-- - Liqueur: Triple Sec, Amaretto, Kahlua, Chartreuse, etc.
-- - Amaro: Campari, Aperol, Fernet, Amaro Montenegro
-- - Wine: Red Wine, White Wine, Rosé
-- - Fortified Wine: Vermouth, Sherry, Port, Lillet
-- - Sparkling Wine: Champagne, Prosecco, Cava
-- - Beer: Lager, Stout, Ale
-- - Mixer: Soda, Tonic, Cola, Ginger Beer, juices
-- - Citrus: Lemon, Lime, Orange, Grapefruit (fruits and juices)
-- - Syrup: Simple Syrup, Grenadine, Honey, Orgeat
-- - Bitters: Angostura, Peychaud's, Orange Bitters
-- - Garnish: Mint, Olives, Cherries, Cucumber
-- - Other: Eggs, Sugar, Salt, Ice
-- =============================================

-- No schema changes required - the category column is TEXT without constraints.
-- The migration script (scripts/migrate-supabase-ingredient-categories.ts) 
-- handles the data updates.

COMMENT ON TABLE public.ingredients IS 'Ingredient data with expanded categories including Amaro, Fortified Wine, Sparkling Wine';

