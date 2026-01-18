# IBA Import Workflow - Review Before Import

## Recommended Workflow

The IBA import script now supports exporting to CSV for manual review before importing. This is the **recommended approach**.

### Step 1: Export to CSV for Review

```bash
# Export all new IBA cocktails to CSV (skips existing ones automatically)
npm run import:iba -- --export-csv

# Or specify custom output file
npm run import:iba -- --export-csv data/my-iba-review.csv
```

This will:
- ✅ Scrape IBA website for cocktails
- ✅ Check your database for existing cocktails
- ✅ **Automatically skip any cocktails that already exist**
- ✅ Export only NEW cocktails to CSV
- ✅ Include all fields (ingredients, instructions, flavor profiles, etc.)

### Step 2: Review the CSV File

Open the CSV file in Excel, Google Sheets, or any text editor:

```bash
# Default location
data/iba-cocktails-review.csv
```

**Review and edit:**
- ✅ Check ingredient lists
- ✅ Verify instructions
- ✅ Adjust flavor profiles if needed
- ✅ Edit descriptions
- ✅ Add missing information
- ✅ Remove any cocktails you don't want

### Step 3: Import the Reviewed CSV

After reviewing and editing:

```bash
# Import the reviewed CSV
npm run import:curated -- data/iba-cocktails-review.csv

# Or with skip-existing (extra safety)
npm run import:curated -- data/iba-cocktails-review.csv --skip-existing
```

## Alternative: Direct Import (No Review)

If you trust the data and want to import directly:

```bash
# Preview first (dry run)
npm run import:iba -- --dry-run

# Actually import (automatically skips existing)
npm run import:iba -- --apply
```

**Note:** Even with `--apply`, the script **always skips existing cocktails** by default. You don't need to worry about duplicates.

## CSV File Format

The exported CSV includes all fields:

- `slug` - URL slug
- `name` - Cocktail name
- `ingredients` - Pipe-delimited (e.g., "2 oz gin|1 oz vermouth")
- `instructions` - Preparation instructions
- `base_spirit` - Primary spirit
- `category_primary` - Main category
- `categories_all` - Pipe-delimited categories
- `tags` - Pipe-delimited tags
- `glassware` - Glass type
- `garnish` - Garnish description
- `technique` - Preparation method
- `difficulty` - easy/moderate/advanced
- `short_description` - Brief description
- `seo_description` - SEO description
- `image_url` - Image URL
- `image_alt` - Image alt text
- `flavor_strength` - 1-10
- `flavor_sweetness` - 1-10
- `flavor_tartness` - 1-10
- `flavor_bitterness` - 1-10
- `flavor_aroma` - 1-10
- `flavor_texture` - 1-10
- `metadata_json` - JSON metadata

## Automatic Duplicate Prevention

The script **always**:
1. ✅ Checks your database for existing cocktails
2. ✅ Compares by slug (URL-friendly name)
3. ✅ Skips any cocktails that already exist
4. ✅ Only processes NEW cocktails

You don't need to worry about duplicates - they're automatically filtered out.

## Example Output

```bash
$ npm run import:iba -- --export-csv

🍸 IBA Official Cocktails Importer
=====================================

📋 Checking for existing cocktails in database...
   Found 200 existing cocktails

🔍 Scraping IBA website for official cocktails...
📂 Processing category: the-unforgettables
  Found 30 cocktails
  🍸 Processing: Old Fashioned
  ...
✅ Found 90 IBA cocktails

⏭️  Skipping 15 cocktails that already exist

📤 Ready to process 75 new cocktails

✅ Exported 75 cocktails to CSV
📁 File: /path/to/data/iba-cocktails-review.csv

📝 Next steps:
   1. Review the CSV file in Excel or a text editor
   2. Edit any fields you want to change
   3. Import using: npx tsx scripts/importCuratedCocktails.ts data/iba-cocktails-review.csv
```

## Tips

1. **Always review the CSV** - Check for quality before importing
2. **Edit as needed** - You can modify any field in the CSV
3. **Remove unwanted cocktails** - Delete rows for cocktails you don't want
4. **Add missing data** - Fill in any gaps before importing
5. **Re-run safely** - The import script will skip existing cocktails automatically

## Troubleshooting

**Q: What if I want to import ALL cocktails, even if they exist?**
A: The script always skips existing cocktails for safety. If you need to update existing cocktails, do it manually in the database or through your admin interface.

**Q: Can I edit the CSV and re-export?**
A: No, but you can edit the CSV and import it. The export is a one-time snapshot.

**Q: What if the CSV has errors?**
A: The curated import script will validate the CSV and show errors. Fix them and try again.

