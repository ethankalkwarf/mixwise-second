-- =============================================
-- Migration 014: Remove Legacy Inventory Tables
-- =============================================
-- This migration removes the old inventories and inventory_items tables
-- that have been replaced by the bar_ingredients table.
--
-- Timeline:
-- - Old system: inventories + inventory_items tables
-- - New system: bar_ingredients table (single source of truth)
-- - All data has been migrated
-- - This migration cleans up the legacy tables
-- =============================================

-- Drop inventory_items table first (has foreign key to inventories)
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- Drop inventories table
DROP TABLE IF EXISTS public.inventories CASCADE;

-- =============================================
-- Migration complete: Legacy tables removed
-- =============================================

