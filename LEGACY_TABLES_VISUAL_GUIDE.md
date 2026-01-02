# Legacy Tables - Visual Guide

## Current Architecture (WITH Legacy Tables)

```
┌─────────────────────────────────────────────────────────────┐
│                    User Ingredients                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application Code                                          │
│  ├─ useBarIngredients() hook                               │
│  ├─ /api/bar-ingredients endpoint                          │
│  └─ lib/cocktails.server.ts functions                      │
│                      ↓                                       │
│  ┌─────────────────────────────┐                           │
│  │  Legacy Try/Catch Fallback   │  ← TO BE REMOVED          │
│  ├─────────────────────────────┤                           │
│  │  Try to read from:           │                           │
│  │  1. inventories table        │  ← LEGACY               │
│  │  2. inventory_items table    │  ← LEGACY               │
│  │  ↓ (if not found)            │                           │
│  └─────────────────────────────┘                           │
│                      ↓                                       │
│  ┌─────────────────────────────┐                           │
│  │  Fallback to                 │                           │
│  │  bar_ingredients table       │  ← CURRENT ACTIVE       │
│  └─────────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Target Architecture (AFTER Legacy Table Removal)

```
┌─────────────────────────────────────────────────────────────┐
│                    User Ingredients                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application Code                                          │
│  ├─ useBarIngredients() hook                               │
│  ├─ /api/bar-ingredients endpoint                          │
│  └─ lib/cocktails.server.ts functions                      │
│                      ↓                                       │
│  ┌─────────────────────────────┐                           │
│  │  bar_ingredients table       │                           │
│  │  (Single source of truth)    │                           │
│  └─────────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

CLEANER ✓ FASTER ✓ SIMPLER ✓
```

---

## Database Tables Timeline

```
OLD SYSTEM (Pre-Migration)
├─ inventories table        ┐
│  └─ user_id               │
│  └─ name                  ├─ Ingredient tracking
│  └─ created_at            │
│                            │
├─ inventory_items table    │
│  └─ ingredient_id         │
│  └─ ingredient_name       ┘
│  └─ created_at

                    │
                    ▼
           [MIGRATION SCRIPT]
                    │
                    ▼

NEW SYSTEM (Current)
├─ bar_ingredients table ✓
│  └─ user_id
│  └─ ingredient_id
│  └─ ingredient_name
│  └─ created_at

                    │
                    ▼
          [CODE CLEANUP HERE] ← YOU ARE HERE
                    │
                    ▼

FINAL SYSTEM (Post-Cleanup)
├─ bar_ingredients table (only source)
│  └─ Single, clean interface
│  └─ No legacy fallbacks
│  └─ No confusion
```

---

## What Exists Where

### Legacy Inventory System (TO BE REMOVED)
```
Database Tables:
├─ inventories
│  └─ Fields: id, user_id, name, created_at
│  └─ Status: UNUSED ❌
│  └─ Data: All migrated to bar_ingredients ✓
│
├─ inventory_items
│  └─ Fields: id, inventory_id, ingredient_id, ingredient_name, created_at
│  └─ Status: UNUSED ❌
│  └─ Data: All migrated to bar_ingredients ✓

Code References (FALLBACK LOGIC - TO BE REMOVED):
├─ app/api/bar-ingredients/route.ts
│  └─ Lines 45-76: Try to read inventories ❌
│
├─ lib/cocktails.server.ts
│  └─ Lines 690-732: Try to read inventories ❌
│
├─ app/api/debug-bar/route.ts
│  └─ Lines 32-64: Check inventories table ❌
```

### Current Active System (TO KEEP)
```
Database Tables:
├─ bar_ingredients ✓
│  └─ Fields: id, user_id, ingredient_id, ingredient_name, created_at
│  └─ Status: ACTIVE ✓
│  └─ Data: Contains all user ingredients
│
├─ profiles ✓
├─ favorites ✓
├─ ratings ✓
├─ shopping_list ✓
├─ user_preferences ✓
├─ user_badges ✓

Code References (ACTIVE):
├─ useBarIngredients() hook - reads from bar_ingredients
├─ /api/bar-ingredients - reads from bar_ingredients
├─ lib/cocktails.server.ts - reads from bar_ingredients
└─ Many other places - all read from bar_ingredients
```

---

## Code Cleanup Flow

### Phase 1: Code Changes
```
┌─ Update app/api/bar-ingredients/route.ts
│  └─ Remove legacy try/catch (32 lines)
│
├─ Update lib/cocktails.server.ts
│  └─ Remove legacy try/catch (42 lines)
│
└─ Update app/api/debug-bar/route.ts
   └─ Remove legacy checks (~35 lines)

Total: ~109 lines removed
```

### Phase 2: Testing
```
┌─ Test locally
│  ├─ npm run dev
│  ├─ Load /dashboard
│  ├─ Use /mix wizard
│  └─ Check console for errors
│
├─ Deploy to staging
│  ├─ Test all flows
│  ├─ Monitor logs
│  └─ Verify no "inventories" errors
│
└─ Deploy to production
   └─ Monitor for issues
```

### Phase 3: Database Cleanup
```
┌─ Verify no issues in production (1-2 days)
│
├─ Run migration
│  ├─ DROP TABLE inventory_items
│  └─ DROP TABLE inventories
│
└─ Verify tables gone
   └─ No errors in app
```

---

## File Dependency Map

### Files that reference legacy tables:
```
app/api/bar-ingredients/route.ts
    ↓ (contains fallback code for)
    └─ inventories, inventory_items

lib/cocktails.server.ts
    ↓ (contains fallback code for)
    └─ inventories, inventory_items

app/api/debug-bar/route.ts
    ↓ (checks)
    └─ inventories, inventory_items

scripts/migrate-inventory-to-bar-ingredients.ts
    ↓ (migration script - keep for reference)
    └─ inventories, inventory_items

app/api/admin/migrate-bar-ingredients/route.ts
    ↓ (migration endpoint - keep for reference)
    └─ inventories, inventory_items
```

### Files that DO NOT directly reference legacy tables:
```
All other files use:
    ↓
    └─ bar_ingredients (via hooks, API calls, etc.)
```

---

## Expected Changes Summary

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| Code complexity | Higher (2 paths) | Lower (1 path) | Better ✓ |
| Database lookups | 2-3 attempts | 1 attempt | Faster ✓ |
| Error handling | More complex | Simpler | Clearer ✓ |
| Maintenance | Multiple paths | Single path | Easier ✓ |
| Lines of code | 109 more | 109 fewer | Cleaner ✓ |

---

## Rollback Timeline (If Needed)

```
Day 1: Deploy code changes ✓
Day 2-3: Monitor production - no issues ✓
Day 4: Execute database cleanup
    ├─ If OK: Done! ✓
    └─ If issues:
        ├─ Restore from backup
        ├─ Revert code changes
        └─ Try again after investigation
```

---

## Progress Checklist

- [ ] Read CLEANUP_SUMMARY.md
- [ ] Read LEGACY_TABLE_CLEANUP_TASKS.md
- [ ] Read LEGACY_TABLE_CODE_CHANGES.md (for exact changes)
- [ ] Make code changes to 3 files
- [ ] Test locally
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor production (1-2 days)
- [ ] Run database migration
- [ ] Verify cleanup complete ✓








