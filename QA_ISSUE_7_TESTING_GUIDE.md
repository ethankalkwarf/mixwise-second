# QA Issue #7: Testing Guide

## Test Environment Setup

### Prerequisites
1. Access to staging/development environment
2. Browser developer tools (DevTools)
3. Database access for manual verification
4. Test accounts for authentication
5. Network throttling capability (for failure scenarios)

### Browser DevTools Setup
```javascript
// Open Console and paste to monitor syncs:
window.addEventListener('storage', (e) => {
  console.log('[Storage Change]', e.key, e.newValue);
});

// Monitor Supabase operations:
const logs = [];
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0]?.includes('bar_ingredients')) {
    console.log('[DB Query]', args[0], args[1]?.method);
  }
  return originalFetch.apply(this, args);
};
```

## Manual Test Cases

### Test 1: Clean Sync (No Existing Server Data)

**Objective**: Verify basic sync when user has no previous bar data

**Steps**:
1. Open DevTools → Application → Local Storage
2. Clear all site data
3. Reload `/mix` page (not logged in)
4. Add ingredients to bar (5-10 items)
5. Verify localStorage contains `mixwise-bar-inventory` key
6. Click "Save my bar" button
7. Complete signup flow
8. After redirect, check `/mix` page

**Expected Results**:
```
Before Login:
  localStorage['mixwise-bar-inventory'] = [uuid-1, uuid-2, ..., uuid-5]
  database bar_ingredients = (empty)

After Login:
  database bar_ingredients = [uuid-1, uuid-2, ..., uuid-5]
  localStorage['mixwise-bar-inventory'] = (empty - cleared)
  
Console Logs:
  ✅ [useBarIngredients] Sync complete: 5 items synced, 0 deleted
  ✅ UI displays all 5 ingredients
  ✅ No errors in console
```

**Failure Cases**:
```
❌ FAIL: Database has fewer than 5 items
  → Check upsert error logs
  
❌ FAIL: localStorage not cleared
  → Check if clearLocal() was called
  
❌ FAIL: UI shows different count
  → Check if state updates match database
```

---

### Test 2: Merge Server + Local Data

**Objective**: Verify sync merges existing server data with new local items

**Setup**:
1. Sign in with test account that already has bar items saved (3 items)
2. Sign out
3. Clear cookies/session
4. Return to `/mix` (logged out)
5. Add new ingredients (2-3 items, different from existing)
6. Sign in with same account

**Expected Results**:
```
Before Login:
  localStorage = [new-uuid-1, new-uuid-2, new-uuid-3]
  database = [existing-uuid-1, existing-uuid-2, existing-uuid-3]

After Login:
  database = [existing-uuid-1, existing-uuid-2, existing-uuid-3, 
              new-uuid-1, new-uuid-2, new-uuid-3] (deduplicated)
  localStorage = (cleared)
  
Console Logs:
  ✅ [useBarIngredients] Sync complete: 6 items synced, 0 deleted
  ✅ UI shows 6 items
```

**Verification**:
```sql
-- Run in database to verify merge
SELECT COUNT(*) as count FROM bar_ingredients 
WHERE user_id = 'test-user-id';
-- Should return 6
```

---

### Test 3: Handle Legacy ID Normalization

**Objective**: Verify sync handles legacy IDs correctly

**Setup**:
1. Manually insert legacy IDs into localStorage:
```javascript
// In DevTools Console:
const legacyData = [
  'vodka_classic',      // Legacy string ID
  'uuid-modern-1',      // Modern UUID
  'gin_premium',        // Another legacy ID
];
localStorage.setItem('mixwise-bar-inventory', JSON.stringify(legacyData));
```

2. Sign in

**Expected Results**:
```
Before Login:
  localStorage = ['vodka_classic', 'uuid-modern-1', 'gin_premium']
  
During Sync:
  ✅ [useBarIngredients] Syncs normalized IDs only
  ✅ Legacy IDs converted to canonical UUIDs
  ✅ If unmappable: "[bar] Dropped 0 unmigratable ingredient IDs"
  
After Sync:
  database = [canonical-uuid-1, canonical-uuid-2, ...]
  localStorage = (cleared)
  
Console Logs:
  ✅ [useBarIngredients] Sync complete: 3 items synced, 0 deleted
```

---

### Test 4: Network Failure During Sync

**Objective**: Verify data preservation when network fails

**Setup**:
1. Add 5 ingredients locally (logged out)
2. Open DevTools → Network tab
3. Select "Offline" mode
4. Click "Save my bar" → complete signup
5. Turn network back on
6. Check results

**Expected Results**:
```
During Offline Sync Attempt:
  ✅ [useBarIngredients] Upsert failed: (network error)
  ✅ [useBarIngredients] Sync failed with exception: (error details)
  ✅ Falls back to loading server data
  
After Network Restored:
  ✅ localStorage still contains the 5 items
  ✅ UI shows fallback data (usually empty for new user)
  ✅ Toast message: "Failed to save bar - local changes preserved"
  
User Can Retry:
  ✅ Clicking button again syncs the saved local items
  ✅ Check console: "[useBarIngredients] Successfully synced 5 items to server"
```

**Verification**:
```javascript
// In DevTools Console after network restored:
JSON.parse(localStorage.getItem('mixwise-bar-inventory'))
// Should still contain the 5 items
```

---

### Test 5: Partial Deletion Failure

**Objective**: Verify deletion continues even if one item fails

**Setup**:
1. Sign in with account that has 5 items
2. Remove 2 items locally
3. Trigger sync
4. (This might not be easily reproducible without DB manipulation)

**Expected Results**:
```
During Sync:
  ✅ Upsert new items: SUCCESS
  ✅ Identify items to delete: 2 items
  ✅ Delete item 1: SUCCESS
  ✅ Delete item 2: WARN - "Failed to delete ingredient uuid-2: (error)"
  ✅ Continue and complete
  
Result:
  ✅ Item 1 deleted
  ✅ Item 2 may remain (logged as warning)
  ✅ New items are safe (already upserted)
  ✅ Partial success is acceptable and logged
```

---

### Test 6: Large Bar (100+ Items)

**Objective**: Verify performance with large ingredient list

**Setup**:
1. Create test account with pre-populated bar
2. Add 100-150 items via SQL or scripts
3. Sign in
4. Observe performance

**Expected Results**:
```
Performance Metrics:
  ✅ Sync completes within 30 seconds
  ✅ No timeout errors
  ✅ All items successfully upserted
  
Console:
  ✅ [useBarIngredients] Sync complete: 100 items synced, 0 deleted
  ✅ No performance warnings
  
Memory:
  ✅ React state updates without crashing
  ✅ UI renders smoothly (no freezing)
```

---

### Test 7: Duplicate IDs in Local Storage

**Objective**: Verify deduplication works correctly

**Setup**:
1. Manually create localStorage with duplicates:
```javascript
// In DevTools Console:
const dataWithDupes = ['uuid-1', 'uuid-2', 'uuid-1', 'uuid-3', 'uuid-2'];
localStorage.setItem('mixwise-bar-inventory', JSON.stringify(dataWithDupes));
```

2. Sign in

**Expected Results**:
```
Before Login:
  localStorage = ['uuid-1', 'uuid-2', 'uuid-1', 'uuid-3', 'uuid-2']
  
During Sync:
  ✅ Merge uses Set to deduplicate
  ✅ mergedIds = ['uuid-1', 'uuid-2', 'uuid-3']
  
After Sync:
  database = ['uuid-1', 'uuid-2', 'uuid-3'] (no duplicates)
  localStorage = (cleared)
  
Console:
  ✅ [useBarIngredients] Sync complete: 3 items synced, 0 deleted
```

---

### Test 8: Empty Bar Sync

**Objective**: Verify behavior when syncing empty bar

**Setup**:
1. Sign in with account that has items
2. Remove all items
3. Sign out
4. Sign back in

**Expected Results**:
```
Before Login:
  localStorage = [] (empty)
  database = [] (previously cleared)
  
During Sync:
  ✅ [useBarIngredients] No local items to sync (early return)
  
After Sync:
  ✅ UI shows empty bar
  ✅ No errors
  ✅ localStorage remains empty
```

---

### Test 9: Concurrent Sync Attempts (Edge Case)

**Objective**: Verify upsert handles concurrent operations safely

**Setup**:
1. (This requires modification to test environment)
2. Trigger multiple sync operations simultaneously
3. Monitor database logs for conflicts

**Expected Results**:
```
✅ Upsert conflict handling prevents duplicates
✅ Last write wins (Supabase upsert behavior)
✅ No data corruption
✅ All items eventually consistent
```

---

### Test 10: Browser Close During Sync

**Objective**: Verify data safety if browser closes mid-sync

**Setup**:
1. Add 5 items locally (logged out)
2. Start signin/sync process
3. **Immediately close browser** (before completion)
4. Reopen browser and return to app

**Expected Results**:
```
Before Close:
  localStorage = [5 items]
  database = (nothing synced yet)
  
After Reopen & Sign In:
  ✅ localStorage still contains items
  ✅ New sync completes successfully
  ✅ No duplicate syncs
  
Database:
  ✅ Contains exactly 5 items (not 10)
  ✅ No corruption from partial writes
```

---

## Automated Test Cases (Jest/Testing)

```typescript
describe('useBarIngredients - localStorage sync', () => {
  
  test('should sync local items to server on authentication', async () => {
    const { result } = renderHook(() => useBarIngredients(), {
      wrapper: AuthProvider
    });
    
    // Add items locally
    await act(async () => {
      await result.current.addIngredient('uuid-1');
      await result.current.addIngredient('uuid-2');
    });
    
    // Simulate authentication
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    // Should sync on next render
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('bar_ingredients');
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });
  });

  test('should preserve local storage on upsert failure', async () => {
    mockSupabase.upsert.mockRejectedValueOnce(new Error('Network error'));
    
    // ... setup ...
    
    await waitFor(() => {
      expect(localStorage.getItem('mixwise-bar-inventory')).toBeTruthy();
    });
  });

  test('should merge server and local data', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [
          { ingredient_id: 'uuid-1' },
          { ingredient_id: 'uuid-2' }
        ]
      })
    });
    
    // Add local items
    localStorage.setItem('mixwise-bar-inventory', 
      JSON.stringify(['uuid-3', 'uuid-4']));
    
    // Authenticate
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-123' }
    });
    
    await waitFor(() => {
      expect(result.current.ingredientIds).toEqual([
        'uuid-1', 'uuid-2', 'uuid-3', 'uuid-4'
      ]);
    });
  });

  test('should clear localStorage after successful sync', async () => {
    // ... setup successful sync ...
    
    await waitFor(() => {
      expect(localStorage.getItem('mixwise-bar-inventory')).toBe(null);
    });
  });

  test('should handle normalization during sync', async () => {
    localStorage.setItem('mixwise-bar-inventory',
      JSON.stringify(['legacy-id', 'uuid-1']));
    
    mockNormalizeIngredientIds.mockReturnValue(['uuid-canonical']);
    
    // ... authenticate ...
    
    await waitFor(() => {
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ ingredient_id: 'uuid-canonical' })
        ])
      );
    });
  });

});
```

---

## Database Verification Queries

### Check User's Bar Items
```sql
SELECT * FROM bar_ingredients 
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC;
```

### Verify No Duplicates
```sql
SELECT ingredient_id, COUNT(*) as count 
FROM bar_ingredients
WHERE user_id = 'test-user-id'
GROUP BY ingredient_id
HAVING count > 1;
-- Should return 0 rows
```

### Check Sync History (if logging table exists)
```sql
SELECT * FROM sync_logs 
WHERE user_id = 'test-user-id'
ORDER BY created_at DESC
LIMIT 10;
```

### Verify Data Integrity
```sql
SELECT 
  bi.user_id,
  COUNT(DISTINCT bi.ingredient_id) as unique_items,
  COUNT(*) as total_items
FROM bar_ingredients bi
GROUP BY bi.user_id
HAVING COUNT(*) != COUNT(DISTINCT bi.ingredient_id);
-- Should return 0 rows (no duplicates for any user)
```

---

## Console Log Verification

### Expected Log Patterns

**Successful Sync**:
```
[useBarIngredients] Sync complete: 5 items synced, 0 deleted
```

**Ingredient Addition**:
```
[useBarIngredients] Ingredient uuid-1 added, bar size: 5
```

**Ingredient Removal**:
```
[useBarIngredients] Ingredient uuid-2 removed, bar size: 4
```

**Server Sync**:
```
[useBarIngredients] Successfully synced 3 items to server
```

**Sync Failure with Fallback**:
```
[useBarIngredients] Upsert failed: (error message)
[useBarIngredients] Sync failed with exception: (error message)
```

**Validation Failure**:
```
[useBarIngredients] Validation failed: invalid normalized IDs
```

---

## Performance Benchmarks

| Scenario | Target | Actual |
|----------|--------|--------|
| Sync 10 items | < 2s | ? |
| Sync 100 items | < 5s | ? |
| Sync 1000 items | < 30s | ? |
| Add single item | < 500ms | ? |
| Remove single item | < 500ms | ? |
| Merge dedup | < 100ms | ? |

*Update "Actual" column during testing*

---

## Regression Test Checklist

- [ ] Bar doesn't lose data on login
- [ ] Local items sync to server
- [ ] Server items appear on login
- [ ] Duplicates are removed
- [ ] Legacy IDs are normalized
- [ ] Failed syncs preserve local data
- [ ] Empty bar works correctly
- [ ] Large bars (100+ items) sync successfully
- [ ] localStorage is cleared after successful sync
- [ ] localStorage is preserved on error
- [ ] Correct console logs for all operations
- [ ] No UI freezing or lag
- [ ] Offline sync fails gracefully
- [ ] Retry sync works after network restored
- [ ] No duplicate items after merge
- [ ] All items queryable in database
- [ ] Database has no orphaned records
- [ ] Badge checking still works
- [ ] Navigation after sync works
- [ ] Multiple logins don't corrupt data

---

## Deployment Verification

### Pre-Deployment
- [ ] Code review complete
- [ ] Unit tests passing
- [ ] Manual tests above completed
- [ ] No new console errors
- [ ] Performance benchmarks acceptable

### Post-Deployment
- [ ] Monitor error logs for sync failures
- [ ] Check success rate in first 24 hours
- [ ] Verify no spike in support tickets
- [ ] Monitor database performance
- [ ] Check localStorage clearing logs

### Rollback Criteria
- [ ] Sync success rate < 95%
- [ ] Data loss incidents reported
- [ ] Performance degradation observed
- [ ] Critical bugs discovered

---

## Notes

- All timestamps in test results should be recorded for performance analysis
- Screenshots of successful syncs are helpful for documentation
- Keep test accounts around for regression testing
- Update this guide as new edge cases are discovered







