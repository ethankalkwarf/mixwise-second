# Legal Considerations for Cocktail Import

## ⚖️ Important Legal Information

### Recipe Copyright Status

**Good News:**
- **Ingredient lists and basic instructions are generally NOT copyrightable** - they're considered factual information
- You can legally use the ingredient list and basic preparation steps

**Important Limitations:**
- **Creative descriptions, narratives, and photos ARE copyrightable** - don't copy these verbatim
- **Website Terms of Service** - Even if recipes aren't copyrighted, scraping may violate ToS
- **Attribution is recommended** - Always credit sources when known

### Legal Best Practices

1. ✅ **Use Public APIs** - TheCocktailDB offers a free API (though quality varies)
2. ✅ **Public Domain Sources** - Historical recipes (pre-1928) are in public domain
3. ✅ **Rewrite Descriptions** - Use your own words for descriptions, not verbatim copies
4. ✅ **Attribute Sources** - Credit where recipes come from
5. ⚠️ **Check Terms of Service** - Review ToS before scraping any website
6. ❌ **Don't Copy Images** - Use your own images or properly licensed ones

## 🚨 Current Script Risks

### IBA Scraper (`importIBACocktails.ts`)

**Risks:**
- Scraping IBA website may violate their Terms of Service
- Copying their descriptions verbatim could be copyright infringement
- Using their images without permission is problematic

**Safer Approach:**
- IBA recipes (ingredients/instructions) are standardized and public knowledge
- But we should:
  - Write our own descriptions
  - Use our own images or properly sourced ones
  - Not scrape their website directly
  - Consider manual entry of IBA recipes instead

### Recommended Safe Sources

#### ✅ Public APIs (Legal & Safe)
1. **TheCocktailDB API** - Free, public API
   - URL: `https://www.thecocktaildb.com/api/json/v1/1/`
   - Terms: Free to use, attribution recommended
   - Quality: Variable (user-submitted)

#### ✅ Public Domain Sources
1. **Historical Recipe Books** (pre-1928)
   - The Savoy Cocktail Book (1930) - May have some public domain recipes
   - Jerry Thomas' Bartender's Guide (1862) - Public domain
   - Harry Craddock's recipes - Many in public domain

2. **Government/Public Sources**
   - Some historical recipe collections in public libraries
   - Public domain recipe databases

#### ✅ Your Own Content
- Recipes you create yourself
- Recipes from bartenders who give explicit permission
- Recipes you've adapted/rewritten in your own words

## 🔧 Recommended Approach

### Option 1: Use Public APIs (Safest)

```bash
# TheCocktailDB has a free public API
# We can create a script that uses their API instead of scraping
```

**Pros:**
- Completely legal
- No ToS violations
- Free to use

**Cons:**
- Quality varies (user-submitted)
- You mentioned you don't want these

### Option 2: Manual Entry with Attribution

1. **Source recipes from public domain or with permission**
2. **Rewrite descriptions in your own words**
3. **Use your own images or properly licensed stock photos**
4. **Attribute the source** (e.g., "Based on IBA Official Recipe")

### Option 3: Curated Import (You Control Sources)

1. **You provide recipes** from sources you've verified
2. **You ensure you have rights** to use them
3. **You write descriptions** in your own words
4. **You provide images** you have rights to

## 📝 Updated Import Script Recommendations

We should update the scripts to:

1. **Add source attribution fields** - Track where recipes come from
2. **Warn about ToS violations** - Don't scrape without checking ToS
3. **Encourage rewriting descriptions** - Don't copy verbatim
4. **Use public APIs when available** - Safer than scraping

## ⚠️ Disclaimer

**This is not legal advice.** Copyright law varies by jurisdiction and can be complex. 

**Recommendations:**
- Consult with a lawyer for your specific use case
- When in doubt, use public APIs or your own content
- Always attribute sources
- Don't copy creative expressions verbatim
- Check Terms of Service before scraping

## 🎯 Safe Path Forward

1. **Use TheCocktailDB API** (if you change your mind about quality)
2. **Manual entry** of recipes you've verified rights to
3. **Public domain sources** (historical recipes)
4. **Your own recipes** or recipes with explicit permission

The curated import script (`importCuratedCocktails.ts`) is the safest option because **you control the source** and can ensure you have proper rights.

