# Legacy Table Cleanup - Actionable Tasks

## Quick Summary

You have **2 legacy tables** that should be removed:
1. `inventories` - Old user inventory records
2. `inventory_items` - Old ingredient items

**Current Status**: These tables are no longer actively used, but code still includes fallback logic to read from them.

**Recommendation**: Safe to remove after following the cleanup plan below.

---

## Step-by-Step Cleanup

### Step 1: Verify Data is Safe ✓
Run this query to check if legacy tables are empty:

```sql
SELECT 
  (SELECT COUNT(*) FROM public.inventories) as inventories_count,
  (SELECT COUNT(*) FROM public.inventory_items) as inventory_items_count,
  (SELECT COUNT(*) FROM public.bar_ingredients) as bar_ingredients_count;
```

**Expected Result**: `inventory_items_count = 0` (or very small number if not migrated)

If data exists:
1. Run the migration script: `npx ts-node scripts/migrate-inventory-to-bar-ingredients.ts`
2. Or call the endpoint: `POST /api/admin/migrate-bar-ingredients`
3. Verify data appears in `bar_ingredients`

---

### Step 2: Update Application Code

#### Task 2.1: Clean up `app/api/bar-ingredients/route.ts`

**Current code (Lines 45-76):**
```typescript
// First, try the legacy inventories table (matches getUserBarIngredients)
try {
  const { data: inventories, error: inventoriesError } = await supabase
    .from("inventories")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);
  // ... legacy logic ...
} catch (legacyError) {
  console.log("[API] Legacy inventories table not found or error:", legacyError);
}
```

**Action:** Delete the entire try/catch block (lines 45-76)

**Resulting code should start directly with:**
```typescript
// Fallback to bar_ingredients table
const { data: barIngredients, error: barError } = await supabase
  .from("bar_ingredients")
  .select("*")
  .eq("user_id", user.id);
```

#### Task 2.2: Clean up `lib/cocktails.server.ts`

**Current code (Lines 690-732):** The `getUserShoppingListIngredients()` function

**Action:** Delete the entire try/catch block that reads from `inventories` and `inventory_items` tables

**Find the section:**
```typescript
// First try the old inventories table structure (if it exists)
try {
  // Check if inventories table exists and has data for this user
  const { data: inventories, error: inventoriesError } = await supabase
    .from('inventories')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  // ... code continues ...
} catch (error) {
  // inventories/inventory_items tables don't exist or are empty, continue to fallback
}
```

**Replace with:** Go directly to the fallback section:
```typescript
// Fallback to bar_ingredients table
const { data: barIngredients, error } = await supabase
  .from('bar_ingredients')
  .select('id, ingredient_id, ingredient_name')
  .eq('user_id', userId);
```

#### Task 2.3: Simplify `app/api/debug-bar/route.ts`

**Current code (Lines 32-64):** Checks both old and new tables

**Action:** Remove the inventories and inventory_items checks since they'll no longer exist

---

### Step 3: Test Application

After code cleanup, test these scenarios:

- [ ] Load a user's bar ingredients page
- [ ] View public bar profile (if enabled)
- [ ] Use the Mix Wizard (which reads user ingredients)
- [ ] Add/remove ingredients from bar
- [ ] Check browser console for any "inventories" references
- [ ] Run the app locally and verify no errors

---

### Step 4: Deploy Code Changes

1. Commit code changes with message: `refactor: remove legacy inventory table fallback code`
2. Deploy to staging environment
3. Test all scenarios above on staging
4. Deploy to production

---

### Step 5: Drop Database Tables (After Code is Deployed)

**⚠️ IMPORTANT: Only do this AFTER code changes are deployed and working!**

Run this SQL migration in Supabase:

```sql
-- Drop inventory_items first (has foreign key to inventories)
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- Drop inventories table
DROP TABLE IF EXISTS public.inventories CASCADE;
```

Or create a migration file: `supabase/migrations/014_remove_legacy_inventory_tables.sql`

```sql
-- =============================================
-- Migration 014: Remove Legacy Inventory Tables
-- =============================================

DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.inventories CASCADE;
```

---

## Task Checklist

### Code Changes
- [ ] Task 2.1 - Clean `app/api/bar-ingredients/route.ts` (remove lines 45-76)
- [ ] Task 2.2 - Clean `lib/cocktails.server.ts` (remove legacy try/catch)
- [ ] Task 2.3 - Simplify `app/api/debug-bar/route.ts`
- [ ] Test application locally

### Deployment
- [ ] Deploy code changes to staging
- [ ] Test all scenarios on staging
- [ ] Deploy code changes to production
- [ ] Monitor logs for any errors

### Database
- [ ] Run verification queries (Step 1)
- [ ] Execute migration or SQL to drop tables
- [ ] Verify tables are gone: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventories');`

---

## Files to Modify

```
app/api/bar-ingredients/route.ts       (Remove lines 45-76)
lib/cocktails.server.ts                (Remove legacy try/catch block ~690-732)
app/api/debug-bar/route.ts             (Remove inventories checks)
```

## Keep These Files (For Reference Only)
```
scripts/migrate-inventory-to-bar-ingredients.ts
app/api/admin/migrate-bar-ingredients/route.ts
LEGACY_TABLES_ANALYSIS.md              (This documentation)
```

---

## Time Estimate

- Code changes: ~15 minutes
- Testing: ~30 minutes
- Database cleanup: ~5 minutes
- **Total: ~50 minutes**

---

## Rollback Plan

If something goes wrong:
1. Revert code changes from git
2. Restore database tables from backup
3. Redeploy previous version
4. Investigate issue

---

## Questions?

Refer to `LEGACY_TABLES_ANALYSIS.md` for detailed information about:
- What these tables were used for
- Why they can be safely removed
- Complete list of affected files
- Safety checklist


