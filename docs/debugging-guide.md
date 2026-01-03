# Debugging Guide

**Quick reference for common debugging patterns and pitfalls in MixWise.**

## 🎯 The Golden Rule: Compare Working vs Broken

**When one feature works and another doesn't, compare their implementations. The difference is usually the fix.**

### Example: Shopping List State Management

**Problem:** Add/remove/toggle didn't work, but "Clear All" did.

**Working code:**
```typescript
// clearAll - WORKED
setItems([]);  // Direct state update
```

**Broken code:**
```typescript
// addItem/removeItem/toggleItem - BROKEN
const freshItems = await fetchFromServer();  // Re-fetch (stale data)
setItems(freshItems);
```

**Fix:** Use optimistic state updates (direct state manipulation) instead of re-fetching.

---

## 🔍 Debugging Checklist

### 1. Identify the Layer

**Is it backend or frontend?**

- ✅ **Backend working if:** API returns 200, data exists in DB, network tab shows success
- ❌ **Frontend issue if:** Backend works but UI doesn't update, state is stale, one operation works but others don't

**Quick test:** Check browser DevTools → Network tab. If API calls succeed, the problem is likely frontend state management.

### 2. Check State Management Patterns

**Look for inconsistent patterns:**

```typescript
// ❌ BAD: Mixing patterns
const addItem = async () => {
  await api.post();
  const fresh = await fetchFromServer();  // Re-fetch
  setItems(fresh);
};

const clearAll = async () => {
  await api.delete();
  setItems([]);  // Direct update - different pattern!
};
```

**✅ GOOD: Consistent optimistic updates**

```typescript
// All operations use the same pattern
const addItem = async () => {
  await api.post();
  setItems(prev => [newItem, ...prev]);  // Direct update
};

const clearAll = async () => {
  await api.delete();
  setItems([]);  // Direct update
};
```

### 3. Supabase Schema Cache Issues

**Symptom:** 400 errors for columns that exist in the database.

**Root cause:** PostgREST schema cache is out of sync with actual DB schema.

**Solutions (in order of preference):**

1. **Use API route with service role key** (bypasses RLS and cache issues)
   ```typescript
   // app/api/resource/route.ts
   const supabase = createClient(url, serviceRoleKey);
   ```

2. **Use SQL functions (RPC)** - bypasses PostgREST entirely
   ```sql
   CREATE FUNCTION get_shopping_list(p_user_id UUID) ...
   ```

3. **Remove problematic columns from queries** (temporary workaround)
   ```typescript
   // Don't select columns that cause cache errors
   .select("id, name")  // Instead of .select("*")
   ```

**When to use each:**
- API route: Best for CRUD operations, maintains type safety
- RPC: Best for complex queries, but adds SQL maintenance overhead
- Column removal: Last resort, breaks type safety

### 4. Authentication State Issues

**Symptom:** Redirects, auth dialogs, or "not authenticated" errors.

**Check:**
- Is `UserProvider` wrapping the app? (`app/layout.tsx`)
- Is auth state loading? Check `isLoading` before using `user`
- Are redirects happening before auth state updates? Add delays or use `authReady` promise

**Pattern:**
```typescript
const { user, isAuthenticated, isLoading } = useUser();

if (isLoading) return <Loading />;
if (!isAuthenticated) return <AuthDialog />;
// Now safe to use user
```

### 5. Console Debugging

**If console is empty:**
- Check browser console filter settings
- Add `alert()` temporarily to confirm JavaScript execution
- Check if code is running in production build (minified/optimized)

**Effective logging:**
```typescript
console.log("[ComponentName] Action:", data);  // Prefix for filtering
console.error("[ComponentName] Error:", err);  // Use error level
```

---

## 🚨 Common Pitfalls

### 1. Re-fetching After Mutations

**Problem:** After successful API call, re-fetching returns stale/cached data.

**Solution:** Use optimistic updates - update state directly based on the mutation result.

```typescript
// ❌ BAD
const removeItem = async (id) => {
  await api.delete(id);
  const fresh = await fetchFromServer();  // Might be stale
  setItems(fresh);
};

// ✅ GOOD
const removeItem = async (id) => {
  await api.delete(id);
  setItems(prev => prev.filter(i => i.id !== id));  // Direct update
};
```

### 2. Assuming Backend is Broken

**Problem:** UI doesn't update, so we assume API is failing.

**Reality:** API might be working fine, but frontend state isn't updating.

**Solution:** Always check Network tab first. If API returns 200, the problem is frontend.

### 3. Inconsistent Error Handling

**Problem:** Some operations show errors, others fail silently.

**Solution:** Standardize error handling:

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    const error = await response.json();
    toast.error(error.message || "Operation failed");
    return;
  }
  // Success handling
} catch (err) {
  console.error("[Component] Error:", err);
  toast.error("Network error");
}
```

### 4. Not Testing the Working Case

**Problem:** We fix broken code but don't understand why working code works.

**Solution:** When debugging, always ask: "What's different about the code that works?"

---

## 📋 Quick Debugging Workflow

1. **Reproduce the issue** - Can you consistently trigger it?
2. **Check Network tab** - Is the API call succeeding (200) or failing (400/500)?
3. **Check Console** - Any JavaScript errors?
4. **Compare with working code** - What's different?
5. **Test the fix** - Does it work? Does it break anything else?

---

## 🛠️ Useful Commands

### Check Supabase Schema
```sql
-- List all columns in a table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shopping_list';

-- Check RPC functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

### Test API Routes Locally
```bash
# Check if route exists
curl http://localhost:3000/api/shopping-list

# Test with auth (requires session cookie)
# Use browser DevTools → Network → Copy as cURL
```

### Debug State in React
```typescript
useEffect(() => {
  console.log("[Component] State changed:", { items, isLoading, user });
}, [items, isLoading, user]);
```

---

## 📚 Related Documentation

- [Authentication & Profiles](./auth-and-profiles.md) - Auth setup and user management
- [Production Notes](./production-notes.md) - Production-specific debugging
- [Supabase Migrations](../supabase/migrations/) - Database schema changes

---

## 💡 Remember

**The fastest fix is usually the simplest one.** If you're adding complex workarounds, step back and ask: "What's the real problem here?"

Most bugs are:
- State not updating (use optimistic updates)
- Schema cache mismatch (use API route or RPC)
- Auth timing issues (wait for auth state)
- Type mismatches (check ID types: string vs number)

