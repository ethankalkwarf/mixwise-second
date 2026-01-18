# Homepage Update - Hero Section Improvements

## Changes Made

### 1. Updated Cocktail Count
- **File**: `components/home/Hero.tsx`
- **Change**: Updated badge text from "190+ Cocktail Recipes" to "300+ Cocktail Recipes"

### 2. Added Rotating Image Feature
- **File**: `components/home/Hero.tsx`
- **Change**: Implemented rotating image carousel similar to wedding cocktail page
  - Added `featuredCocktails` prop support
  - Implemented image rotation every 3 seconds using `useEffect`
  - Added label overlay showing cocktail name and base spirit
  - Multiple images with opacity transitions
  - Maintains existing badge with updated count

### 3. Updated Homepage Integration
- **File**: `app/page.tsx`
- **Change**: Passed `featuredCocktails` prop to Hero component

## Files Modified
- `components/home/Hero.tsx`
- `app/page.tsx`

## Deployment Steps

If you have the git repository in a different location, run:

```bash
# Navigate to your git repository
cd /path/to/your/git/repo

# Pull latest changes
git pull origin main

# Copy the modified files (if needed)
# Or if this is a sync folder, changes should already be there

# Stage changes
git add components/home/Hero.tsx app/page.tsx

# Commit
git commit -m "feat: update homepage hero with rotating images and 300+ cocktail count"

# Push to production
git push origin main
```

Vercel will automatically deploy after pushing to main branch.

## Verification
- ✅ No linting errors
- ✅ TypeScript types correct
- ✅ Follows existing patterns (similar to wedding cocktail page)
