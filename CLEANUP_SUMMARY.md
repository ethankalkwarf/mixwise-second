# Database Cleanup Summary

## TL;DR

You have **2 legacy tables** that should be removed:
- ❌ `inventories` 
- ❌ `inventory_items`

**Status**: Replaced by `bar_ingredients` table. Safe to remove.

**Effort**: ~1 hour (code changes + testing + database cleanup)

---

## What Needs to Happen

### 1. Code Changes (15 min)
Remove legacy fallback logic from 3 files:
- `app/api/bar-ingredients/route.ts` - Remove 32 lines
- `lib/cocktails.server.ts` - Remove 42 lines  
- `app/api/debug-bar/route.ts` - Remove ~35 lines

**Total**: ~109 lines of legacy code removed

### 2. Testing (30 min)
- Test locally
- Deploy to staging
- Run through user flows on staging
- Deploy to production

### 3. Database Cleanup (5 min)
Run SQL to drop tables

---

## Files to Read

1. **`LEGACY_TABLE_CLEANUP_TASKS.md`** - Step-by-step instructions
2. **`LEGACY_TABLE_CODE_CHANGES.md`** - Exact code changes needed
3. **`LEGACY_TABLES_ANALYSIS.md`** - Detailed analysis

---

## Quick Start

```bash
# 1. Create new branch
git checkout -b cleanup/remove-legacy-inventory-tables

# 2. Update files (see LEGACY_TABLE_CODE_CHANGES.md)
# - app/api/bar-ingredients/route.ts
# - lib/cocktails.server.ts
# - app/api/debug-bar/route.ts

# 3. Test locally
npm run dev
# Test bar ingredients loading, Mix Wizard, Dashboard

# 4. Commit and deploy
git commit -m "refactor: remove legacy inventory table fallback code"
git push
# Deploy code changes to production

# 5. After code is live and working (next day), drop tables:
# Run SQL in Supabase:
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.inventories CASCADE;
```

---

## Why This Matters

✅ **Cleaner code** - Removes 109 lines of legacy fallback logic
✅ **Better performance** - No unnecessary database lookups
✅ **Easier maintenance** - Single clear path for ingredient queries
✅ **Reduced complexity** - One less thing to manage

---

## Safety

- ✅ Fallback code has been in place for months
- ✅ All data has been migrated to `bar_ingredients`
- ✅ No other tables depend on these legacy tables
- ✅ Easy rollback if needed (code revert + table restore)

---

## Next Steps

1. Read `LEGACY_TABLE_CLEANUP_TASKS.md` for step-by-step instructions
2. Read `LEGACY_TABLE_CODE_CHANGES.md` to see exact code changes
3. Make the code changes
4. Test locally
5. Deploy code changes first
6. Wait 1-2 days to verify no issues
7. Drop database tables








