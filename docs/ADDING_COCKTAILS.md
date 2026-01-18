# Adding High-Quality Cocktails to MixWise

This guide explains how to add hundreds of high-quality cocktails to your site.

## ⚖️ Legal Considerations

**IMPORTANT:** Before importing cocktails, please review `docs/LEGAL_COCKTAIL_IMPORT.md` for important legal information about:
- Recipe copyright status
- Terms of Service violations
- Safe import methods
- Attribution requirements

**Quick Summary:**
- ✅ Recipe ingredients/instructions are generally not copyrightable (factual)
- ⚠️ Website scraping may violate Terms of Service
- ✅ Public APIs are safest (TheCocktailDB offers a free API)
- ✅ Your own curated recipes are safest

## Overview

MixWise currently has ~200 cocktails. To expand to 500+ high-quality cocktails, you have several options:

1. **Import IBA Official Cocktails** (Recommended) - ~90 official professional cocktails
2. **Import Curated Cocktails** - Add cocktails from reputable sources via CSV/JSON
3. **Manual Entry** - Use the structured import format for individual cocktails

## Option 1: Import IBA Official Cocktails

The International Bartenders Association (IBA) maintains the official list of professional cocktails. These are the gold standard.

### Quick Start

```bash
# Preview what would be imported (dry run)
npx tsx scripts/importIBACocktails.ts --dry-run

# Import all IBA cocktails
npx tsx scripts/importIBACocktails.ts --apply

# Skip cocktails that already exist
npx tsx scripts/importIBACocktails.ts --apply --skip-existing
```

### What Gets Imported

- ~90 official IBA cocktails from three categories:
  - The Unforgettables (classic cocktails)
  - Contemporary Classics (modern classics)
  - New Era Drinks (recent innovations)
- Ingredients, instructions, glassware, garnish
- Images from IBA website (when available)
- Proper categorization and tagging

## Option 2: Import Curated Cocktails

Use this for adding cocktails from:
- Professional cocktail books (Death & Co, PDT, The Savoy Cocktail Book, etc.)
- Award-winning recipes
- Curated lists from expert bartenders
- Your own high-quality recipes

### CSV Format

Create a CSV file with the following columns:

**Required:**
- `name` - Cocktail name
- `ingredients` - Pipe-delimited list (e.g., "2 oz gin|1 oz vermouth|2 dashes bitters")
- `instructions` - Preparation instructions

**Optional:**
- `slug` - URL slug (auto-generated from name if not provided)
- `short_description` - Brief description
- `base_spirit` - Primary spirit (Gin, Vodka, Rum, etc.)
- `category_primary` - Main category (Classic, Contemporary, Modern, etc.)
- `glassware` - Glass type (rocks, coupe, highball, etc.)
- `garnish` - Garnish description
- `technique` - Preparation method (shaken, stirred, built, etc.)
- `difficulty` - easy, moderate, advanced
- `tags` - Pipe or comma-delimited tags
- `categories_all` - Pipe or comma-delimited categories
- `image_url` - URL to cocktail image
- `flavor_strength`, `flavor_sweetness`, etc. - Flavor profile (1-10)

### Example CSV

See `data/curated-cocktails-template.csv` for a complete example.

### Import Command

```bash
# Import from CSV
npx tsx scripts/importCuratedCocktails.ts data/your-cocktails.csv

# Dry run to preview
npx tsx scripts/importCuratedCocktails.ts data/your-cocktails.csv --dry-run

# Skip existing cocktails
npx tsx scripts/importCuratedCocktails.ts data/your-cocktails.csv --skip-existing
```

### JSON Format

You can also use JSON format:

```json
[
  {
    "name": "Old Fashioned",
    "slug": "old-fashioned",
    "ingredients": [
      { "text": "2 oz bourbon" },
      { "text": "1/4 oz simple syrup" },
      { "text": "2 dashes Angostura bitters" }
    ],
    "instructions": "Stir all ingredients with ice...",
    "base_spirit": "Bourbon",
    "category_primary": "Classic",
    "glassware": "rocks",
    "garnish": "Orange peel"
  }
]
```

## Option 3: High-Quality Sources

Here are recommended sources for finding high-quality cocktail recipes:

### Books
- **Death & Co: Modern Classic Cocktails** - 500+ recipes
- **PDT Cocktail Book** - Award-winning recipes
- **The Savoy Cocktail Book** - Classic recipes from 1930
- **The Craft of the Cocktail** by Dale DeGroff
- **Liquid Intelligence** by Dave Arnold

### Websites
- **IBA Official Cocktails** - https://iba-world.com/cocktails/
- **Difford's Guide** - https://www.diffordsguide.com/
- **Punch** - https://punchdrink.com/
- **Imbibe Magazine** - https://imbibemagazine.com/

### Professional Resources
- **IBA Official Cocktail List** - The definitive professional list
- **Tales of the Cocktail** - Award-winning recipes
- **World Class** - Competition recipes

## Data Quality Guidelines

When adding cocktails, ensure:

1. **Accurate Recipes** - Use verified sources, not random internet recipes
2. **Complete Information** - Include ingredients, instructions, glassware, garnish
3. **Proper Categorization** - Use consistent categories and tags
4. **High-Quality Images** - Use professional photos when possible
5. **Ingredient Formatting** - Use standard format: "amount unit ingredient" (e.g., "2 oz gin")

## Ingredient Matching

The import scripts will:
- Parse ingredient text (e.g., "2 oz gin")
- Match to existing ingredients in your database
- Create ingredient relationships automatically

If an ingredient doesn't match, it will still be stored as text, but won't be linked to your ingredient database.

## Batch Import Workflow

1. **Collect Recipes** - Gather cocktails from reputable sources
2. **Format Data** - Create CSV or JSON file following the template
3. **Dry Run** - Test import with `--dry-run` flag
4. **Review** - Check preview output for any issues
5. **Import** - Run actual import
6. **Verify** - Check database and website to ensure cocktails appear correctly

## Troubleshooting

### Duplicate Slugs
If you get duplicate slug errors:
- Use `--skip-existing` to skip cocktails that already exist
- Or manually set unique slugs in your CSV

### Missing Ingredients
If ingredients don't match:
- Check ingredient names in your database
- Use exact ingredient names from your database
- Ingredients will still be stored as text even if not matched

### Import Errors
- Check CSV format matches template
- Ensure required fields (name, ingredients) are present
- Verify Supabase credentials in `.env.local`

## Next Steps

1. Start with IBA cocktails: `npx tsx scripts/importIBACocktails.ts --apply`
2. Add curated cocktails from professional sources
3. Build your collection to 500+ high-quality cocktails

## Questions?

If you need help:
- Check the script help: `npx tsx scripts/importIBACocktails.ts --help`
- Review the template: `data/curated-cocktails-template.csv`
- Check existing cocktails in your database for format reference

