# Exact Code Changes for Legacy Table Removal

This document shows the exact changes needed to remove legacy table references.

---

## File 1: app/api/bar-ingredients/route.ts

### BEFORE (Current)
```typescript
export async function GET() {
  try {
    // Get the authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS (matches server-side behavior)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      // Fall back to auth client if no service role key
      console.warn("[API] No service role key, using auth client");
      const { data, error } = await supabaseAuth
        .from("bar_ingredients")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("[API] Error fetching bar_ingredients:", error);
        return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
      }
      
      return NextResponse.json({ ingredients: data || [], source: "bar_ingredients" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ❌ DELETE THIS BLOCK (lines 45-76) ❌
    // First, try the legacy inventories table (matches getUserBarIngredients)
    try {
      const { data: inventories, error: inventoriesError } = await supabase
        .from("inventories")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!inventoriesError && inventories && inventories.length > 0) {
        const inventoryId = inventories[0].id;
        console.log("[API] Found legacy inventory:", inventoryId);

        const { data: inventoryItems, error: itemsError } = await supabase
          .from("inventory_items")
          .select("id, ingredient_id, ingredient_name")
          .eq("inventory_id", inventoryId);

        if (!itemsError && inventoryItems && inventoryItems.length > 0) {
          console.log("[API] Loaded from legacy inventory_items:", inventoryItems.length);
          // Convert to bar_ingredients format
          const ingredients = inventoryItems.map(item => ({
            id: item.id,
            user_id: user.id,
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
          }));
          return NextResponse.json({ ingredients, source: "inventory_items" });
        }
      }
    } catch (legacyError) {
      console.log("[API] Legacy inventories table not found or error:", legacyError);
    }
    // ❌ END DELETE BLOCK ❌

    // Fallback to bar_ingredients table
    const { data: barIngredients, error: barError } = await supabase
      .from("bar_ingredients")
      .select("*")
      .eq("user_id", user.id);

    if (barError) {
      console.error("[API] Error fetching bar_ingredients:", barError);
      return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
    }

    console.log("[API] Loaded from bar_ingredients:", barIngredients?.length || 0);
    return NextResponse.json({ ingredients: barIngredients || [], source: "bar_ingredients" });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### AFTER (Cleaned)
```typescript
export async function GET() {
  try {
    // Get the authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS (matches server-side behavior)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      // Fall back to auth client if no service role key
      console.warn("[API] No service role key, using auth client");
      const { data, error } = await supabaseAuth
        .from("bar_ingredients")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("[API] Error fetching bar_ingredients:", error);
        return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
      }
      
      return NextResponse.json({ ingredients: data || [], source: "bar_ingredients" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load from bar_ingredients table
    const { data: barIngredients, error: barError } = await supabase
      .from("bar_ingredients")
      .select("*")
      .eq("user_id", user.id);

    if (barError) {
      console.error("[API] Error fetching bar_ingredients:", barError);
      return NextResponse.json({ ingredients: [], source: "bar_ingredients" });
    }

    console.log("[API] Loaded from bar_ingredients:", barIngredients?.length || 0);
    return NextResponse.json({ ingredients: barIngredients || [], source: "bar_ingredients" });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Changes**: Removed 32 lines (legacy inventories/inventory_items fallback logic)

---

## File 2: lib/cocktails.server.ts

### BEFORE (Current - Lines 690-732)
Find this section in the function (around line 690):

```typescript
  // First try the old inventories table structure (if it exists)
  try {
    // Check if inventories table exists and has data for this user
    const { data: inventories, error: inventoriesError } = await supabase
      .from('inventories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!inventoriesError && inventories && inventories.length > 0) {
      // Use old table structure
      const inventoryId = inventories[0].id;
      const { data: inventoryItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, ingredient_id, ingredient_name')
        .eq('inventory_id', inventoryId);

      if (!itemsError && inventoryItems) {
        return inventoryItems
          .map(item => {
            const numericId = convertToNumericId(item.ingredient_id, item.ingredient_name);
            if (!numericId) {
              console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID`);
              return null;
            }

            // Get the proper ingredient name from the ingredients table
            const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

            return {
              id: item.id.toString(),
              ingredient_id: numericId,
              ingredient_name: properName,
              ingredient_category: idToCategoryMap.get(numericId) ?? null,
              inventory_id: inventoryId,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      }
    }
  } catch (error) {
    // inventories/inventory_items tables don't exist or are empty, continue to fallback
  }

  // Fallback to bar_ingredients table
  const { data: barIngredients, error } = await supabase
    .from('bar_ingredients')
    .select('id, ingredient_id, ingredient_name')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching bar ingredients:', error);
    return [];
  }

  return (barIngredients || [])
    .map(item => {
      const numericId = convertToNumericId(item.ingredient_id, item.ingredient_name);
      
      // IMPORTANT: Don't drop items we can't convert - preserve them with a fallback ID
      // This prevents data loss when IDs can't be mapped
      if (!numericId) {
        console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID, using fallback`);
        // Use a hash of the string ID as a fallback numeric ID
        // This ensures the item is still displayed even if we can't map it
        const fallbackId = Math.abs(item.ingredient_id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)) || 999999;
        
        return {
          id: item.id.toString(),
          ingredient_id: fallbackId,
          ingredient_name: item.ingredient_name || item.ingredient_id,
          ingredient_category: null,
        };
      }

      // Get the proper ingredient name from the ingredients table
      const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

      return {
        id: item.id.toString(),
        ingredient_id: numericId,
        ingredient_name: properName,
        ingredient_category: idToCategoryMap.get(numericId) ?? null,
        // No inventory_id for bar_ingredients
      };
    });
```

### AFTER (Cleaned)
Replace the entire section above with:

```typescript
  // Load from bar_ingredients table
  const { data: barIngredients, error } = await supabase
    .from('bar_ingredients')
    .select('id, ingredient_id, ingredient_name')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching bar ingredients:', error);
    return [];
  }

  return (barIngredients || [])
    .map(item => {
      const numericId = convertToNumericId(item.ingredient_id, item.ingredient_name);
      
      // IMPORTANT: Don't drop items we can't convert - preserve them with a fallback ID
      // This prevents data loss when IDs can't be mapped
      if (!numericId) {
        console.warn(`Could not convert ingredient ID "${item.ingredient_id}" to numeric ID, using fallback`);
        // Use a hash of the string ID as a fallback numeric ID
        // This ensures the item is still displayed even if we can't map it
        const fallbackId = Math.abs(item.ingredient_id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)) || 999999;
        
        return {
          id: item.id.toString(),
          ingredient_id: fallbackId,
          ingredient_name: item.ingredient_name || item.ingredient_id,
          ingredient_category: null,
        };
      }

      // Get the proper ingredient name from the ingredients table
      const properName = idToNameMap.get(numericId) || item.ingredient_name || item.ingredient_id;

      return {
        id: item.id.toString(),
        ingredient_id: numericId,
        ingredient_name: properName,
        ingredient_category: idToCategoryMap.get(numericId) ?? null,
        // No inventory_id for bar_ingredients
      };
    });
```

**Changes**: Removed 42 lines (entire legacy inventories/inventory_items try/catch block)

---

## File 3: app/api/debug-bar/route.ts

### BEFORE (Current)
```typescript
export async function GET() {
  const results: any = {};

  // Check inventories table
  try {
    const { data: inventories, error } = await supabase
      .from("inventories")
      .select("*")
      .limit(5);

    results.inventories = { data: inventories, error: error?.message };
  } catch (e: any) {
    results.inventories = { error: e.message };
  }

  // Check inventory_items table
  try {
    const { data: inventories } = await supabase
      .from("inventories")
      .select("id")
      .limit(1);

    if (inventories && inventories.length > 0) {
      const { data: items, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("inventory_id", inventories[0].id)
        .limit(5);

      results.inventory_items = { count: items?.length, data: items?.slice(0, 5), error: error?.message };
    } else {
      results.inventory_items = { count: 0, note: "No inventories found" };
    }
  } catch (e: any) {
    results.inventory_items = { error: e.message };
  }

  // ... rest of the function continues ...
}
```

### AFTER (Simplified)
```typescript
export async function GET() {
  const results: any = {};

  // ... other checks continue ...
}
```

**Changes**: Remove the entire inventories and inventory_items check blocks (lines 32-64 approximately)

---

## Summary of Changes

| File | Lines Removed | Change Type |
|------|---|---|
| `app/api/bar-ingredients/route.ts` | 32 | Delete legacy try/catch block |
| `lib/cocktails.server.ts` | 42 | Delete legacy try/catch block |
| `app/api/debug-bar/route.ts` | ~35 | Delete inventories checks |
| **Total** | **~109 lines** | **Code cleanup** |

---

## Migration SQL

After deploying code changes, run this SQL:

```sql
-- Drop inventory_items first (has foreign keys)
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- Drop inventories table
DROP TABLE IF EXISTS public.inventories CASCADE;
```

Or create a migration file: `supabase/migrations/014_remove_legacy_inventory_tables.sql`

```sql
-- =============================================
-- Migration 014: Remove Legacy Inventory Tables
-- =============================================
-- Removes the old inventories/inventory_items tables
-- that have been replaced by the bar_ingredients table
-- =============================================

DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.inventories CASCADE;
```

---

## Testing After Changes

After applying code changes, test:

```typescript
// Test 1: Load user bar ingredients
GET /api/bar-ingredients

// Test 2: Check pub lic bar works
GET /api/public-bar/:username

// Test 3: Use mix wizard
GET /mix (navigate in browser)

// Test 4: View user dashboard
GET /dashboard
```

All should work without any "inventories" table not found errors in logs.


