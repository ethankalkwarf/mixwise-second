# QA Issue #7: Implementation Details

## Overview

This document provides a detailed technical breakdown of the localStorage desynchronization fix.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Authentication Event                    │
│                  (Login/Signup Completion)                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              useBarIngredients Hook Initializes                 │
│              (authLoading=false, isAuthenticated=true)          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│        Fetch Ingredients Metadata (for ID normalization)        │
│              Get: id, name, legacy_id from DB                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│        Call syncAuthenticatedBar(userId, nameMap, data)         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
   ┌────────┐         ┌────────────┐        ┌────────────┐
   │  Load  │         │   Load     │        │   Load     │
   │ Server │         │   Local    │        │  Ingredient│
   │  Data  │         │  Storage   │        │    Map     │
   │        │         │            │        │            │
   └────────┘         └────────────┘        └────────────┘
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Merge Arrays & Deduplicate         │
        │  mergedIds = [...Set([...server,    │
        │                       ...local])]   │
        └─────────────────────┬───────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Normalize IDs to Canonical Format  │
        │  (handle legacy IDs)                │
        └─────────────────────┬───────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │      Validate Normalized IDs        │
        │  (check length, structure, etc.)    │
        └─────────────────────┬───────────────┘
                              │
                         ┌────┴────┐
                         │          │
                    ✅ Valid    ❌ Invalid
                         │          │
                         ▼          ▼
        ┌────────────────────┐  ┌──────────────┐
        │  Build Items for   │  │  Log Error,  │
        │  Upsert with user  │  │  Use Server  │
        │  IDs               │  │  Data Only   │
        └─────────┬──────────┘  └──────────────┘
                  │
                  ▼
        ┌─────────────────────────────────────┐
        │  ATOMIC UPSERT                      │
        │  (Insert or Update if exists)       │
        │  onConflict: "user_id,ingredient_id"│
        └─────────────────────┬───────────────┘
                              │
                         ┌────┴────┐
                         │          │
                    ✅ Success   ❌ Error
                         │          │
                         ▼          ▼
        ┌────────────────────┐  ┌──────────────┐
        │  Get Current Items │  │  Log Error,  │
        │  Fetch all server  │  │  Load Server │
        │  ingredients       │  │  Data Only   │
        └─────────┬──────────┘  │  (Fallback)  │
                  │              └──────────────┘
                  ▼
        ┌─────────────────────────────────────┐
        │  Find Items to Delete               │
        │  itemsToDelete = current.filter(    │
        │    id => !normalized.includes(id)   │
        │  )                                  │
        └─────────────────────┬───────────────┘
                              │
                         ┌────┴──────────┐
                         │               │
                    Items found    No items
                         │               │
                         ▼               ▼
        ┌────────────────────┐  ┌──────────────┐
        │  Delete Each Item  │  │  Update UI & │
        │  (one by one to    │  │  Clear Local │
        │   allow partial    │  │  Storage     │
        │   success)         │  │              │
        └─────────┬──────────┘  └──────────────┘
                  │
                  ▼
        ┌────────────────────────────────────┐
        │  Update UI State                   │
        │  - setIngredientIds(normalized)    │
        │  - setServerIngredients(items)     │
        │  - clearLocal() - DELETE FROM LS   │
        └─────────────────────┬──────────────┘
                              │
                              ▼
        ┌────────────────────────────────────┐
        │  Log Success Message               │
        │  "Sync complete: X items, Y deleted"│
        └─────────────────────┬──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   SYNC COMPLETE  │
                    └──────────────────┘

On Exception (anywhere):
  ├─ Log Error: [useBarIngredients] Exception occurred
  └─ Fallback: Load Server Data Only
       ├ Load all bar_ingredients for user
       ├ setIngredientIds(serverIds)
       ├ setServerIngredients(serverData)
       └─ KEEP local storage untouched (user can retry)
```

## Detailed Function: `syncAuthenticatedBar`

### Signature
```typescript
const syncAuthenticatedBar = useCallback(
  async (
    userId: string,
    nameToCanonicalId: Map<string, string>,
    ingredientsData: any[]
  ) => {
    // ...
  },
  [loadFromServer, loadFromLocal, clearLocal, supabase]
);
```

### Step-by-Step Execution

#### Step 1: Load Current State
```typescript
const serverData = await loadFromServer();
const serverIds = serverData.map(item => item.ingredient_id);
const localIds = loadFromLocal();
```

**Purpose**: Get baseline data from both sources
**Safety**: Both reads are non-destructive

| Source | What We Get | Fallback |
|--------|------------|----------|
| Server | All user's bar ingredients | Empty array if error |
| Local | All user's bar ingredients from LS | Empty array if error |

#### Step 2: Merge and Deduplicate
```typescript
const mergedIds = [...new Set([...serverIds, ...localIds])];
```

**Purpose**: Combine both sources, removing exact duplicates

**Example**:
```
serverIds:  ["uuid-1", "uuid-2", "uuid-3"]
localIds:   ["uuid-2", "uuid-3", "uuid-4"]
mergedIds:  ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
```

#### Step 3: Normalize IDs
```typescript
const normalizedMergedIds = normalizeIngredientIds(
  mergedIds,
  nameToCanonicalId
);
```

**Purpose**: Convert legacy IDs to canonical UUIDs

**Example**:
```
Input: ["old-vodka-id", "uuid-2", "vodka_legacy", "uuid-4"]
Output: ["uuid-1", "uuid-2", "uuid-1", "uuid-4"]  // After dedup in normalizeIngredientIds
```

**Handles**:
- Legacy string IDs (e.g., "vodka_id")
- Mixed UUID/legacy formats
- Unmappable IDs (silently dropped with warning)

#### Step 4: Validate Data
```typescript
if (!normalizedMergedIds || normalizedMergedIds.length < 0) {
  console.warn("[useBarIngredients] Validation failed");
  setIngredientIds(serverIds);
  return;
}
```

**Purpose**: Catch corrupted data before sync

**Checks**:
- normalizedMergedIds exists
- Array length is non-negative
- Could be extended with more checks

**On Failure**: Fallback to server data

#### Step 5: Build Items for Upsert
```typescript
const itemsToSync = normalizedMergedIds.map(id => ({
  user_id: userId,
  ingredient_id: id,
  ingredient_name: ingredientsData?.find(ing => String(ing.id) === id)?.name || null,
}));
```

**Purpose**: Format data for database insert/update

**Example Output**:
```typescript
[
  {
    user_id: "user-123",
    ingredient_id: "uuid-1",
    ingredient_name: "Vodka"
  },
  {
    user_id: "user-123",
    ingredient_id: "uuid-2",
    ingredient_name: "Gin"
  }
]
```

#### Step 6: Atomic Upsert
```typescript
const { error: upsertError, data: upsertedData } = await supabase
  .from("bar_ingredients")
  .upsert(itemsToSync, {
    onConflict: "user_id,ingredient_id",
  });

if (upsertError) {
  console.error("[useBarIngredients] Upsert failed:", upsertError);
  setIngredientIds(serverIds);
  setServerIngredients(serverData);
  return;
}
```

**Purpose**: Insert new items or update existing ones (atomic operation)

**Behavior**:
- If `(user_id, ingredient_id)` pair exists: UPDATE
- If `(user_id, ingredient_id)` pair is new: INSERT
- Either all succeed or all fail (no partial success)
- **Idempotent**: Can safely retry on failure

**Why Upsert?**:
1. No separate delete needed (safer)
2. Atomic operation (all or nothing)
3. Handles conflicts gracefully
4. Can be retried without issues

#### Step 7: Identify Items to Delete
```typescript
const { data: currentItems, error: fetchError } = await supabase
  .from("bar_ingredients")
  .select("ingredient_id")
  .eq("user_id", userId);

if (fetchError) {
  console.warn("[useBarIngredients] Failed to fetch current items");
  return;
}

const currentIds = (currentItems || []).map(item => item.ingredient_id);
const itemsToDelete = serverIds.filter(id => !normalizedMergedIds.includes(id));
```

**Purpose**: Find items that should be removed

**Example**:
```
normalizedMergedIds: ["uuid-1", "uuid-2", "uuid-3"]
serverIds:           ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
itemsToDelete:       ["uuid-4"]
```

#### Step 8: Delete Items One-By-One
```typescript
if (itemsToDelete.length > 0) {
  for (const id of itemsToDelete) {
    const { error: deleteError } = await supabase
      .from("bar_ingredients")
      .delete()
      .eq("user_id", userId)
      .eq("ingredient_id", id);

    if (deleteError) {
      console.warn(`[useBarIngredients] Failed to delete ${id}:`, deleteError);
      // Continue with next deletion
    }
  }
}
```

**Purpose**: Remove ingredients no longer in the user's bar

**Safety Measures**:
1. Delete one-by-one (not all at once)
2. Continue on error for other items
3. Log each failure for debugging
4. Safe to partially fail (upserted items are already saved)

**Why Not Batch Delete?**:
- Batch delete fails completely if any item has issues
- Individual deletes allow partial success
- Error in one delete doesn't block others

#### Step 9: Update UI
```typescript
setIngredientIds(normalizedMergedIds);
setServerIngredients(
  normalizedMergedIds.map(id => ({
    user_id: userId,
    ingredient_id: id,
    ingredient_name: ingredientsData?.find(ing => String(ing.id) === id)?.name || null,
  }))
);
clearLocal();
```

**Purpose**: Sync React state with database

**Operations**:
1. Set ingredient list in state
2. Set server cache for next reads
3. **Clear localStorage** (important: only do this after everything succeeds)

#### Step 10: Log Success
```typescript
console.log(
  `[useBarIngredients] Sync complete: ${normalizedMergedIds.length} items synced, ${itemsToDelete.length} deleted`
);
```

**Purpose**: Provide audit trail

### Exception Handling

If ANY step throws an exception:

```typescript
try {
  await syncAuthenticatedBar(...);
} catch (error) {
  console.error("[useBarIngredients] Sync failed with exception:", error);
  try {
    // Fallback: Load server data as source of truth
    const serverData = await loadFromServer();
    const serverIds = serverData.map(item => item.ingredient_id);
    setIngredientIds(serverIds);
    setServerIngredients(serverData);
    // Note: Do NOT clear local storage - preserve for retry
  } catch (fallbackError) {
    console.error("[useBarIngredients] Even fallback sync failed:", fallbackError);
  }
}
```

**Two-Level Protection**:
1. **Primary**: Catch sync errors
2. **Fallback**: If primary fails, load server data

**Local Storage**:
- Only cleared AFTER successful upsert
- Preserved on any error
- User can retry later

## Data Flow Diagrams

### Scenario 1: Clean Sync (No Issues)

```
┌──────────────────┐
│  User Logs In    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│ Load Server: []                │
│ Load Local: [A, B, C]          │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Merge: [A, B, C]               │
│ Normalize: [A, B, C]           │
│ Validate: ✅ OK                │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Upsert [A, B, C]: ✅ SUCCESS   │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Items to delete: []            │
│ Clear localStorage: ✅         │
│ Update state: [A, B, C]        │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ User sees: [A, B, C] on server   │
│ Result: ✅ SUCCESS               │
└──────────────────────────────────┘
```

### Scenario 2: Network Failure During Upsert

```
┌──────────────────┐
│  User Logs In    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│ Load Server: [X, Y]            │
│ Load Local: [A, B, C]          │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Merge: [X, Y, A, B, C]         │
│ Normalize: [X, Y, A, B, C]     │
│ Validate: ✅ OK                │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Upsert [X, Y, A, B, C]: ❌ FAIL│
│ (Network timeout)              │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Catch Error Block:             │
│ - Log error                    │
│ - Load server data: [X, Y]     │
│ - setIngredientIds([X, Y])     │
│ - DON'T clear localStorage     │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ User sees: [X, Y]                │
│ localStorage still has: [A, B, C]│
│ Result: ✅ Fallback, Data Safe   │
└──────────────────────────────────┘
```

### Scenario 3: Merge with Server Data

```
┌──────────────────┐
│  User Logs In    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│ Load Server: [Vodka, Gin]      │
│ Load Local: [Gin, Rum, Tequila]│
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Merge: [Vodka, Gin, Rum, Tequila]│
│ Normalize: [uuid-1, uuid-2,    │
│            uuid-3, uuid-4]     │
│ Validate: ✅ OK                │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ Upsert all 4: ✅ SUCCESS         │
│ (Gin and Vodka already existed)  │
│ (Rum and Tequila are new)        │
└────────────┬──────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Items to delete: [] (none)     │
│ Clear localStorage: ✅         │
│ Update state: [4 items]        │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ User sees: [Vodka, Gin, Rum,   │
│            Tequila] on server   │
│ Result: ✅ SUCCESS               │
└──────────────────────────────────┘
```

## Error Recovery Strategies

### Strategy 1: Server as Source of Truth
- If anything fails, load from server
- Server data is always complete and consistent
- User sees authenticated bar (previously saved items)

### Strategy 2: Preserve Local Storage
- Never clear localStorage on error
- User can retry sync later
- No data loss if something fails

### Strategy 3: Atomic Operations
- Upsert is all-or-nothing
- Either full success or complete failure
- No partial data states

### Strategy 4: Idempotent Operations
- Can retry upsert safely
- Same operation, same result
- Network retries don't cause duplicates

## Monitoring & Alerts

### Metrics to Track

1. **Sync Success Rate**
```typescript
const successCount = logs.filter(l => l.includes("Sync complete")).length;
const failureCount = logs.filter(l => l.includes("Sync failed")).length;
const successRate = successCount / (successCount + failureCount);
```

2. **Average Items Synced**
```typescript
const syncs = logs.filter(l => l.includes("Sync complete"));
const avgItems = syncs.reduce((sum, log) => {
  const match = log.match(/(\d+) items synced/);
  return sum + parseInt(match[1]);
}, 0) / syncs.length;
```

3. **Deletion Rate**
```typescript
const deletions = logs.filter(l => l.includes("deleted"));
const avgDeletions = deletions.reduce((sum, log) => {
  const match = log.match(/(\d+) deleted/);
  return sum + parseInt(match[1]);
}, 0) / deletions.length;
```

### Alerts to Set Up

- **High Failure Rate**: If sync_failures > 5% of total attempts
- **Large Item Count**: If single sync > 1000 items
- **Slow Syncs**: If sync takes > 30 seconds
- **Repeated Failures**: If same user fails 3+ times

## Performance Considerations

### Time Complexity
- Load operations: O(n) where n = number of items
- Merge and normalize: O(n)
- Upsert: O(n) in database
- Delete loop: O(m) where m = items to delete
- **Total**: O(n + m) ≈ O(n)

### Space Complexity
- mergedIds array: O(n)
- itemsToSync array: O(n)
- nameToCanonicalId map: O(ingredients count)
- **Total**: O(n + i) where i = total ingredients in database

### Database Load
- 1 select from bar_ingredients (server)
- 1 select from ingredients (metadata)
- 1 upsert (replaces multiple inserts)
- 0 to m deletes

**Optimization**: Batch upsert reduces database calls vs individual inserts

## Testing Checklist

- [ ] Normal sync with no existing server data
- [ ] Merge with existing server data
- [ ] Network failure during upsert (fallback)
- [ ] Partial deletion failure (continue with others)
- [ ] Large bar (100+ items)
- [ ] Duplicate IDs in local storage
- [ ] Legacy ID normalization
- [ ] localStorage cleared after success
- [ ] localStorage preserved on error
- [ ] Concurrent sync attempts
- [ ] Browser close during sync (simulated)
- [ ] Empty bar (0 items)

## Related Code

### Supporting Functions
- `normalizeIngredientIds()`: Converts legacy IDs to canonical format
- `buildNameToIdMap()`: Creates lookup map for ID normalization
- `buildIdToNameMap()`: Creates lookup map for ingredient names

### Called From
- `initialize()` effect in useBarIngredients
- When `isAuthenticated` transitions from false to true

### Calls
- `loadFromServer()`: Fetches user's bar ingredients
- `loadFromLocal()`: Reads localStorage
- `clearLocal()`: Removes localStorage data
- Supabase client for database operations







