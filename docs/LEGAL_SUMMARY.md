# Legal Summary: Cocktail Import Options

## ✅ SAFEST Options (Recommended)

### 1. TheCocktailDB Public API ⭐ **RECOMMENDED**
- **Legal Status:** ✅ Completely legal - uses official public API
- **Quality:** ⚠️ Variable (user-submitted recipes)
- **Quantity:** 600+ cocktails
- **Usage:** `npm run import:cocktaildb -- --import-all`
- **Why Safe:** Public API, no scraping, no ToS violations

### 2. Your Own Curated Recipes
- **Legal Status:** ✅ 100% safe - you own/control the content
- **Quality:** ✅ You control quality
- **Quantity:** Unlimited
- **Usage:** `npm run import:curated -- data/your-cocktails.csv`
- **Why Safe:** You verify rights before importing

### 3. Public Domain Sources
- **Legal Status:** ✅ Safe - public domain content
- **Quality:** ✅ High (historical classics)
- **Quantity:** Limited (pre-1928 recipes)
- **Usage:** Manual entry or curated import
- **Why Safe:** Public domain = no copyright

## ⚠️ RISKY Options (Use with Caution)

### 4. IBA Website Scraper
- **Legal Status:** ⚠️ **May violate Terms of Service**
- **Quality:** ✅ High (official recipes)
- **Quantity:** ~90 cocktails
- **Usage:** `npm run import:iba -- --apply`
- **Why Risky:** 
  - Scraping may violate IBA website ToS
  - Even though recipes aren't copyrighted, scraping is problematic
  - **Recommendation:** Manual entry of IBA recipes instead

### 5. Scraping Other Websites
- **Legal Status:** ❌ **High risk**
- **Why Risky:**
  - Violates Terms of Service
  - May violate copyright (descriptions, images)
  - Could face legal action

## 📋 What's Legal vs. What's Not

### ✅ Legal (Generally Safe)
- **Recipe ingredients lists** - Factual, not copyrightable
- **Basic instructions** - Factual, not copyrightable  
- **Using public APIs** - Explicitly allowed
- **Your own content** - You own it
- **Public domain content** - No copyright

### ❌ Not Legal (Risky)
- **Scraping websites** - Violates Terms of Service
- **Copying descriptions verbatim** - Copyrighted creative expression
- **Using images without permission** - Copyrighted
- **Copying from books** - Copyrighted works

## 🎯 Recommended Approach

1. **Start with TheCocktailDB API** (if you're okay with variable quality)
   - Completely legal
   - 600+ cocktails
   - Free public API

2. **Add your own curated recipes**
   - Highest quality
   - You control sources
   - Completely safe

3. **Manual entry of IBA recipes** (don't scrape)
   - High quality
   - Official recipes
   - Safe if you write your own descriptions

## ⚖️ Disclaimer

**This is not legal advice.** Copyright law is complex and varies by jurisdiction. When in doubt:
- Consult a lawyer
- Use public APIs
- Use your own content
- Always attribute sources

