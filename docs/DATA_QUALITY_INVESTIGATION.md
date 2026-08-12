# Data Quality Investigation - Cocktail Count Discrepancy

## Issue

- **README says**: "400+ cocktail recipes"
- **Actual count**: ~190 cocktails (as reported)
- **Concern**: Potential bad data or duplicates

## Investigation Steps

### Step 1: Run Diagnostic Script

I've created a script to check your actual cocktail count and identify data quality issues:

```bash
npx tsx scripts/check-cocktail-count.ts
```

This script will:
- ✅ Count total cocktails in Supabase
- ✅ Check for duplicate names
- ✅ Check for duplicate slugs (CRITICAL - slugs must be unique)
- ✅ Identify empty/invalid data
- ✅ Show sample data

### Step 2: Check for Common Issues

#### Potential Issues:

1. **Duplicate Slugs** (CRITICAL)
   - Slug must be unique (enforced by database constraint)
   - If duplicates exist, database queries will fail
   - Script will identify these

2. **Duplicate Names** (WARNING)
   - Multiple cocktails with same name
   - May be intentional (variations) or duplicates
   - Review manually to determine if cleanup needed

3. **Empty/Invalid Data**
   - Cocktails with empty names or slugs
   - These will cause display/query issues

4. **Outdated README**
   - README says "400+" but actual count is ~190
   - Should be updated to reflect actual count

### Step 3: Update Documentation

Once you've confirmed the actual count, update:

1. **README.md** - Line 19:
   ```markdown
   - 🍸 **Cocktail Directory**: Browse 190+ cocktail recipes with detailed ingredients and instructions
   ```

2. **Any marketing materials** that mention "400+ cocktails"

## Quick Fix: Update README

If the count is actually ~190, update README now:

```bash
# Update README.md line 19
sed -i '' 's/400+/190+/g' README.md
```

Or manually edit `README.md` line 19.

## Next Steps

1. Run the diagnostic script: `npx tsx scripts/check-cocktail-count.ts`
2. Review the output for data quality issues
3. If duplicates found, investigate and clean up
4. Update README with correct count
5. Update any other documentation/marketing materials

## Questions to Answer

After running the script:

1. What's the actual count? (should be ~190)
2. Are there duplicate slugs? (should be 0 - CRITICAL if > 0)
3. Are there duplicate names? (review manually)
4. Are there empty/invalid entries? (should be 0)
5. Is the README outdated? (likely yes - update to actual count)

## Data Source

Based on your codebase:
- **Current source**: Supabase `cocktails` table
- **Migration**: Migration 004 shows cocktails moved from Sanity to Supabase
- **Previous**: May have been in Sanity CMS (old scripts reference Sanity)

The script checks the Supabase database directly.

