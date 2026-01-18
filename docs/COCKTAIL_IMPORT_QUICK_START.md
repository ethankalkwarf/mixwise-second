# Quick Start: Adding Hundreds of High-Quality Cocktails

## ⚖️ Legal Notice

**Please read `docs/LEGAL_COCKTAIL_IMPORT.md` before importing.** 

**Safest Options:**
1. ✅ **TheCocktailDB API** - Free public API (legally safe)
2. ✅ **Your own curated recipes** - You control the source
3. ⚠️ **IBA Scraper** - May violate ToS (use with caution)

## 🚀 Safest Way: Use TheCocktailDB Public API

```bash
# List all available cocktails (600+)
npm run import:cocktaildb -- --list-all

# Import all cocktails (uses official API - legally safe)
npm run import:cocktaildb -- --import-all

# Preview first
npm run import:cocktaildb -- --import-all --dry-run
```

## ⚠️ Alternative: Import IBA Official Cocktails

**Warning:** This scrapes the IBA website, which may violate their Terms of Service.

**Recommended Workflow:**
```bash
# 1. Export to CSV for review (automatically skips existing cocktails)
npm run import:iba -- --export-csv

# 2. Review the CSV file: data/iba-cocktails-review.csv

# 3. Import after review
npm run import:curated -- data/iba-cocktails-review.csv
```

**Note:** The script **always skips existing cocktails** automatically - you don't need to worry about duplicates.

IBA (International Bartenders Association) cocktails are the gold standard - professional, verified, high-quality recipes.

```bash
# Preview what will be imported
npm run import:iba -- --dry-run

# Import all IBA cocktails (~90 cocktails)
npm run import:iba -- --apply

# Skip cocktails that already exist
npm run import:iba -- --apply --skip-existing
```

This will add ~90 official professional cocktails from:
- The Unforgettables (classic cocktails)
- Contemporary Classics (modern classics)  
- New Era Drinks (recent innovations)

## 📝 Import Your Own Curated Cocktails

For adding cocktails from professional sources (books, expert bartenders, etc.):

1. **Create a CSV file** using the template:
   ```bash
   # Copy the template
   cp data/curated-cocktails-template.csv data/my-cocktails.csv
   ```

2. **Fill in your cocktails** - See template for format

3. **Import them**:
   ```bash
   # Preview first
   npm run import:curated -- data/my-cocktails.csv --dry-run
   
   # Actually import
   npm run import:curated -- data/my-cocktails.csv
   ```

## 📚 Best Sources for High-Quality Recipes

### Books (Recommended)
- **Death & Co: Modern Classic Cocktails** - 500+ recipes
- **PDT Cocktail Book** - Award-winning recipes
- **The Savoy Cocktail Book** - Classic recipes
- **Liquid Intelligence** by Dave Arnold

### Websites
- **IBA Official** - https://iba-world.com/cocktails/
- **Difford's Guide** - https://www.diffordsguide.com/
- **Punch** - https://punchdrink.com/

## 🎯 Goal: 500+ Cocktails

**Current:** ~200 cocktails  
**Target:** 500+ cocktails

**Strategy:**
1. ✅ Import IBA cocktails (~90) → **~290 total**
2. 📝 Add 100-200 from professional books → **~390-490 total**
3. 📝 Add 50-100 from curated lists → **~500+ total**

## 📖 Full Documentation

See `docs/ADDING_COCKTAILS.md` for complete details on:
- CSV/JSON format specifications
- All available fields
- Troubleshooting
- Data quality guidelines

