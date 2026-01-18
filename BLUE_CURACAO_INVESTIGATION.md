# Blue Curaçao Missing in Mix Wizard - Investigation

## Problem
A drink says the user is missing "Blue Curaçao" but they can't find it in the mix wizard to add to their profile.

## Potential Causes

1. **Name Variation**: The database might have "Blue Curacao" (without accent) while recipes show "Blue Curaçao" (with accent)
2. **Missing Ingredient**: The ingredient might not exist in the database at all
3. **Category Filter**: The ingredient might be filtered out by category
4. **Staple Filter**: The ingredient might be incorrectly marked as a staple
5. **Search Issue**: The search might not handle accent-insensitive matching

## Investigation Plan

1. Check database for "Blue Curaçao" variations
2. Check how ingredient matching works between recipes and database
3. Improve search to handle accent variations
4. Verify ingredient is not filtered out incorrectly

## Code Locations

- Mix Wizard Ingredient List: `components/mix/MixInventoryPanel.tsx` (line 103)
- Ingredient Fetching: `lib/cocktails.ts` - `getMixIngredients()` (line 119)
- Ingredient Matching: `lib/ingredientMatching.ts` - `matchIngredientName()` (line 139)

## Search Filter Logic

Current implementation (line 103 of MixInventoryPanel.tsx):
```typescript
filtered = filtered.filter((i) => i.name.toLowerCase().includes(q));
```

**Issue**: This uses `.includes()` which is accent-sensitive. If database has "Blue Curacao" (no accent) but user searches "Blue Curaçao" (with accent), it might not match depending on how the database stores it.

## Solution ✅ IMPLEMENTED

### 1. Added Accent-Insensitive Search ✅
**File**: `components/mix/MixInventoryPanel.tsx`

Added `normalizeForSearch()` function that:
- Normalizes strings using NFD (Normalized Form Decomposed)
- Removes diacritics (accents) for comparison
- Handles variations like:
  - "Blue Curacao" ↔ "Blue Curaçao"
  - "Cafe" ↔ "Café"
  - etc.

**Changes**:
- Added `normalizeForSearch()` helper function
- Updated search filter to use accent-insensitive comparison
- Search now matches ingredients regardless of accent variations

### 2. Next Steps

If the ingredient still doesn't appear after this fix, possible causes:
1. **Ingredient missing from database** - Need to check if "Blue Curaçao" exists in ingredients table
2. **Ingredient marked as staple** - Check if it's incorrectly filtered out as a staple
3. **Category filter** - Check if it's hidden by category filter
4. **Data integrity issue** - Recipe references ingredient that doesn't exist

### Testing

To test the fix:
1. Go to mix wizard
2. Search for "blue curacao" (without accent)
3. Search for "blue curaçao" (with accent)
4. Both should now find the ingredient if it exists in the database
