# Cocktail Import Instructions

## Overview
This guide will help you import 105 new cocktails from `data/cocktail addon.csv` and update their image URLs from Supabase storage.

## Prerequisites
1. Supabase credentials configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Images uploaded to Supabase Storage bucket: `cocktail-images-fullsize`

## Step 1: Audit (Optional)
Run the audit script to validate the CSV:
```bash
npx tsx scripts/auditCocktailImport.ts "data/cocktail addon.csv"
```

## Step 2: Dry Run Import
Test the import without making changes:
```bash
npx tsx scripts/importCuratedCocktails.ts "data/cocktail addon.csv" --dry-run --skip-existing
```

This will show you:
- How many cocktails will be imported
- Sample cocktails that will be imported
- Any warnings or issues

## Step 3: Import Cocktails
Once the dry run looks good, run the actual import:
```bash
npx tsx scripts/importCuratedCocktails.ts "data/cocktail addon.csv" --skip-existing
```

The `--skip-existing` flag will skip any cocktails that already exist (by slug).

Expected output:
- ✅ Loaded 105 cocktails from file
- 📤 Ready to import X cocktails (after skipping duplicates)
- ✅ Imported X/X cocktails...

## Step 4: Update Image URLs

### Dry Run (Check matches)
First, check which cocktails will get image URLs:
```bash
npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --dry-run
```

This will show:
- How many cocktails match images
- Which files match which cocktails
- Which cocktails don't have matches

### Apply Image URL Updates
Once you're satisfied with the matches, apply the updates:
```bash
npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply
```

The script will:
1. Fetch all cocktails from the database
2. List all files in the `cocktail-images-fullsize` bucket
3. Match cocktails to images by slug (with fuzzy matching)
4. Update the `image_url` field with public Supabase storage URLs

### Update Single Cocktail (Optional)
To update just one cocktail:
```bash
npx tsx scripts/updateCocktailImageUrlsFromStorage.ts --apply --slug "bloody-mary"
```

## Step 5: Verify
1. Check a few cocktails in your database to verify:
   - Data imported correctly
   - Image URLs are populated
   - Images are accessible

2. Check the website to ensure cocktails display correctly

## Troubleshooting

### Import Errors
- **Missing required fields**: Check that all rows have `name` and `ingredients`
- **Duplicate slugs**: Use `--skip-existing` to skip duplicates
- **Database connection**: Verify Supabase credentials in `.env.local`

### Image URL Issues
- **No matches found**: 
  - Verify images are in the `cocktail-images-fullsize` bucket
  - Check that filenames match slug patterns (e.g., "Bloody Mary.jpg" or "bloody-mary.jpg")
- **Wrong matches**: 
  - Review the dry-run output
  - Manually update specific cocktails if needed
- **Images not loading**: 
  - Verify Supabase storage bucket is public
  - Check that URLs are correctly formatted

## Files Created
- `scripts/auditCocktailImport.ts` - CSV validation script
- `scripts/updateCocktailImageUrlsFromStorage.ts` - Image URL updater
- `COCKTAIL_IMPORT_AUDIT.md` - Schema compatibility report
- `COCKTAIL_IMPORT_INSTRUCTIONS.md` - This file

## Notes
- The CSV uses pipe-delimited format for arrays (categories_all, tags, ingredients)
- Ingredients are converted to JSONB array format: `[{text: "2 oz vodka"}, ...]`
- Empty `image_url` fields are expected - they're populated in Step 4
- The `ID` column in the CSV is ignored (not in database schema)
