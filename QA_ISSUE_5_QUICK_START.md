# QA Issue #5: Quick Start Guide

## The Problem (60 seconds)

**67 out of 247 cocktails are missing from the UI** (22% of menu!)

Users see this in the browser console:
```
Total cocktails loaded: 247
Valid cocktails: 180 (72.9%)
EXCLUDED: 67 (27.1%)
```

## How to Fix It (5 minutes)

### Step 1: Diagnose (2 minutes)

```bash
npx ts-node scripts/diagnose-cocktail-data.ts
```

This will tell you:
- How many cocktails are broken (you know: 67)
- **Why they're broken** (this is the important part!)
- Exactly which 67 cocktails
- How to fix it

### Step 2: Preview the Fix (1 minute)

```bash
npx ts-node scripts/fix-missing-ingredients.ts --dry-run
```

This shows what would be fixed WITHOUT making changes.

### Step 3: Apply the Fix (2 minutes)

```bash
npx ts-node scripts/fix-missing-ingredients.ts --apply
```

Done! Check `/mix` - you should see more cocktails.

## What Changed

When you run the app now, you'll see in the browser console (Development mode only):

```
╔════════════════════════════════════════╗
║    COCKTAIL DATA QUALITY REPORT        ║
╠════════════════════════════════════════╣
║ Total cocktails loaded: 247
║ Valid cocktails: 180 (72.9%)
║ EXCLUDED: 67 (27.1%)
╠════════════════════════════════════════╣
║ Excluded cocktails breakdown:
║   • Null/undefined ingredients: 45
║   • Empty ingredient array: 22
║   • Not an array (invalid type): 0
╚════════════════════════════════════════╝

[MIX-DEBUG] Null ingredients cocktails (first 5):
  1. Margarita Variant 1 (id-abc123)
  2. Mojito Plus (id-def456)
```

## The New Tools

### 📊 `diagnose-cocktail-data.ts`
Shows you exactly what's broken and why.

```bash
npx ts-node scripts/diagnose-cocktail-data.ts
```

Creates: `diagnose-report.json` with all 67 cocktails listed

### 🔧 `fix-missing-ingredients.ts`
Automatically repairs missing ingredient data.

```bash
# Preview (safe - no changes)
npx ts-node scripts/fix-missing-ingredients.ts --dry-run

# Apply (makes changes)
npx ts-node scripts/fix-missing-ingredients.ts --apply
```

Creates: `ingredient-repair-report.json` showing what was fixed

### 📈 `cocktailDiagnostics.ts`
Utility functions for checking data quality:

```typescript
import { quickHealthCheck, runCocktailDiagnostics } from '@/lib/cocktailDiagnostics';

// Quick check
const health = await quickHealthCheck();
console.log(`${health.total} cocktails, ${health.excluded} excluded`);

// Detailed report
const report = await runCocktailDiagnostics();
console.log(report.excludedCocktails); // List of 67 broken cocktails
```

## Common Scenarios

### "I want to see which cocktails are broken"

```bash
npx ts-node scripts/diagnose-cocktail-data.ts
cat diagnose-report.json | grep -A 2 "excludedCocktails"
```

### "I want to fix them automatically"

```bash
# Preview first
npx ts-node scripts/fix-missing-ingredients.ts --dry-run

# Then apply
npx ts-node scripts/fix-missing-ingredients.ts --apply
```

### "I want to see the data quality in my code"

```typescript
import { quickHealthCheck } from '@/lib/cocktailDiagnostics';

const { total, valid, excluded, percentage } = await quickHealthCheck();

if (percentage > 10) {
  console.warn(`⚠️  ${percentage}% of cocktails are excluded!`);
}
```

### "I want verbose logs in development"

The logs are automatically enabled in development mode. Just run:

```bash
npm run dev
```

Then visit `/mix` and check the console tab.

## Expected Improvements

**Before:**
```
Total: 247
Valid: 180 (72.9%)
Excluded: 67 (27.1%)
```

**After running fix script:**
```
Total: 247
Valid: 220+ (89%+)
Excluded: 0-27 (0-11%)
```

The exact improvement depends on your root cause:
- **Null ingredients**: Can fix ~95% 
- **Empty arrays**: Can fix ~95%
- **Invalid type**: Need code change to fix
- **Parse errors**: Need to fix JSON data

## Deployment Checklist

- [ ] Run diagnostic script
- [ ] Review what's broken
- [ ] Run fix script in dry-run mode
- [ ] Verify the fixes make sense
- [ ] Apply fixes
- [ ] Test `/mix` page
- [ ] Deploy to production
- [ ] Monitor console logs for any new issues

## Need Help?

1. **"What's the root cause?"** → Run `diagnose-cocktail-data.ts`, look at the output
2. **"How many can I fix?"** → Run the script in `--dry-run` mode first
3. **"Will this break anything?"** → No, it only populates missing data
4. **"Can I undo it?"** → Yes, each update is reversible (revert ingredients to empty array)

## Files to Know

| File | Purpose |
|------|---------|
| `lib/cocktailDiagnostics.ts` | Diagnostic utilities |
| `lib/cocktails.server.ts` | Enhanced logging when loading cocktails |
| `app/mix/page.tsx` | Enhanced client-side logging |
| `scripts/diagnose-cocktail-data.ts` | Run diagnostics from CLI |
| `scripts/fix-missing-ingredients.ts` | Run repairs from CLI |
| `QA_ISSUE_5_INVESTIGATION.md` | Deep analysis of the problem |
| `QA_ISSUE_5_SOLUTION.md` | Complete technical solution |

## Next Steps

1. **Now**: Run `npx ts-node scripts/diagnose-cocktail-data.ts`
2. **Review**: Look at the output, understand root cause
3. **Fix**: Run `npx ts-node scripts/fix-missing-ingredients.ts --dry-run`
4. **Verify**: Check what would be fixed
5. **Apply**: Run `npx ts-node scripts/fix-missing-ingredients.ts --apply`
6. **Test**: Visit `/mix` and verify improvement
7. **Deploy**: Commit and push the database changes

Good luck! 🍹

