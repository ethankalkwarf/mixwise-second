# QA Issue #5: Recipe Loading Failures - Investigation Report

## Problem Summary
**67 out of 247 cocktails (22%) are silently dropped from the UI** when users visit `/mix`. Users see only 180 cocktails when the database contains 247, causing 67 recipes to be completely invisible.

## Root Cause Analysis

### Current Filtering Logic
In `app/mix/page.tsx` (lines 93-112):
```typescript
const validCocktails = cocktails.filter(cocktail => {
  const isValid = cocktail &&
                 cocktail.ingredients &&
                 Array.isArray(cocktail.ingredients) &&
                 cocktail.ingredients.length > 0;
  return isValid;
});
```

This filter drops cocktails where:
- `cocktail.ingredients` is `null` or `undefined`
- `cocktail.ingredients` is not an array
- `cocktail.ingredients` is an empty array `[]`

### Data Structure
- **Cocktails Table**: Has a JSONB `ingredients` field (migration 004_cocktails.sql, line 38)
- **Ingredients Format**: Stored as JSON array in the cocktails table
- **Data Source**: `/api/cocktails/with-ingredients` endpoint calls `getCocktailsWithIngredients()` from `lib/cocktails.server.ts`

### Where Data Gets Transformed

#### 1. **Server-side Processing** (`lib/cocktails.server.ts`, lines 301-435)
The `getCocktailsWithIngredients()` function:
- Queries cocktails table
- Tries to parse the JSON `ingredients` field
- Maps ingredient text to ingredient IDs from the ingredients table
- Returns `ingredientsWithIds` array

#### 2. **API Response** (`app/api/cocktails/with-ingredients/route.ts`)
- Transforms `ingredientsWithIds` → `ingredients` in the response
- Logs show first cocktail keys should include `ingredients`

#### 3. **Client-side Mapping** (`lib/cocktails.ts`, lines 220-239)
Maps server response to MixCocktail format:
```typescript
ingredients: cocktail.ingredientsWithIds
```

## Potential Issues

### Issue 1: Empty or Null JSON in Database
Some cocktails may have:
- `ingredients = null`
- `ingredients = '[]'` (empty string array)
- `ingredients = []` (empty array)
- Missing ingredients field entirely

### Issue 2: JSON Parsing Failures
In `lib/cocktails.server.ts`, the ingredient parsing (lines 304-385) may fail for:
- Malformed JSON
- Unexpected ingredient format
- Missing `text` or `name` fields
- Ingredient IDs that don't map to any ingredient in the ingredients table

### Issue 3: Silent Filtering in Multiple Places
Filtering happens at:
1. **Server-side** (cocktails.server.ts, lines 451-458) - Filters out cocktails with no valid ingredients
2. **Client-side** (mix/page.tsx, lines 93-112) - Filters again based on ingredients array

## Current Logging
Development console shows:
- `[MIX-DEBUG] Filtering cocktails, total: 247`
- `[MIX-DEBUG] After filtering: valid cocktails: 180`
- But **no list** of which 67 cocktails were excluded!

## Missing Diagnostic Information

To identify the 67 broken cocktails, we need:
1. ✅ List of cocktail IDs with empty/null ingredients
2. ✅ Count of how many have null vs empty vs missing
3. ✅ Sample of cocktail names that are being filtered
4. ✅ Database query showing the raw ingredients JSON for broken cocktails
5. ✅ Check if ingredients parsing is working correctly

## Solution Strategy

### Phase 1: Diagnosis
- Create diagnostic script to query database directly
- Identify all 67 cocktails with missing ingredients
- Show exact ingredient data for broken cocktails
- Determine if this is:
  - Data migration issue (incomplete ingredient population)
  - Schema mismatch (expected format doesn't match actual format)
  - Legacy data that needs cleanup

### Phase 2: Fix Logging
- Add comprehensive logging to track excluded cocktails
- Show cocktail names, IDs, and reason for exclusion
- Create development warning showing which cocktails are being dropped

### Phase 3: Data Repair (if applicable)
- If ingredients can be populated from another source, do so
- If not, decide: filter silently or show "coming soon"
- Prevent future cocktails from being created without ingredients

### Phase 4: Monitoring
- Add production alerts if exclusion count spikes
- Show exclusion metrics in admin dashboard
- Track data quality metrics

## Next Steps
1. Run diagnostic query against Supabase
2. Generate list of 67 broken cocktails
3. Analyze why ingredients are missing
4. Implement fix based on root cause

