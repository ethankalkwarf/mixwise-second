# MixWise QA Issues - Quick Reference

## Quick Links to Issues

| # | Issue | Severity | Category | Time Est | Status |
|---|-------|----------|----------|----------|--------|
| 1 | Auth dialog not closing on signup | CRITICAL | Auth Flow | 2 days | Not started |
| 2 | Race condition (email → onboarding) | CRITICAL | Auth State | 3 days | Not started |
| 3 | Ingredient ID type mismatches | HIGH | Data | 3 days | Not started |
| 4 | Missing null checks on profile | HIGH | Rendering | 1 day | Not started |
| 5 | Missing ingredient arrays in recipes | HIGH | Data | 2 days | Not started |
| 6 | Async data race in Mix page | HIGH | State Mgmt | 2 days | Not started |
| 7 | localStorage desync on auth | MEDIUM | Sync | 2 days | Not started |
| 8 | Image preload warnings | MEDIUM | Performance | 1 day | Not started |
| 9 | Loading spinner timeout | MEDIUM | UX | 1 day | Not started |
| 10 | Deep link routing issues | MEDIUM | Routing | 1 day | Not started |
| 11 | Missing error handling | MEDIUM | Error Mgmt | 3 days | Not started |
| 12 | Subscription cleanup leaks | LOW | Memory | 1 day | Not started |

**Total Estimated Effort**: ~22 days of focused work

---

## How to Use This Document

### Step 1: Pick an Issue
Choose from the priority list below.

### Step 2: Open QA_ISSUE_PROMPTS.md
Find the corresponding issue section.

### Step 3: Copy the Prompt
Copy the entire prompt for that issue (from "You are..." to "DELIVERABLE").

### Step 4: New Chat Session
- Start a new Cursor chat
- Paste the prompt
- Let it work on that issue independently

### Step 5: Track Progress
Update this document as you go:
```
| 1 | Auth dialog... | CRITICAL | ... | In progress | 1 of 3 tasks done |
```

---

## Recommended Starting Order

### Critical Issues (Start Here)
These block the core auth flow and must be fixed first:

1. **Issue #2**: Race condition in email confirmation → onboarding
   - **Why first**: Blocks new user onboarding
   - **Impact**: Users get stuck or stuck in loops
   - **Effort**: 3 days

2. **Issue #1**: Auth dialog not closing on signup  
   - **Why second**: Affects UX after signup
   - **Impact**: Confusing user experience
   - **Effort**: 2 days

### High Priority (Fix Next)
These affect user features but don't block core flow:

3. **Issue #3**: Ingredient ID type mismatches
   - **Why**: Causes recommendation engine to fail
   - **Impact**: Users see 0 cocktails when they should see many
   - **Effort**: 3 days

4. **Issue #5**: Missing ingredient arrays in recipes
   - **Why**: Data integrity issue
   - **Impact**: 22% of cocktail menu hidden from users
   - **Effort**: 2 days

5. **Issue #6**: Async data race in Mix page
   - **Why**: Causes confusing count flickering
   - **Impact**: Users click during data load, get wrong results
   - **Effort**: 2 days

### Medium Priority (Then These)
These improve reliability and UX:

6. **Issue #4**: Missing null checks on profile
   - **Effort**: 1 day
   - **Why**: Prevents crashes for new users

7. **Issue #7**: localStorage desync on auth
   - **Effort**: 2 days
   - **Why**: Users lose data when signing up

8. **Issue #11**: Missing error handling
   - **Effort**: 3 days
   - **Why**: Users don't get feedback on failures

9. **Issue #9**: Loading spinner timeout
   - **Effort**: 1 day
   - **Why**: Users get stuck indefinitely

10. **Issue #10**: Deep link routing
    - **Effort**: 1 day
    - **Why**: Bookmarked links don't work well

### Low Priority (Last)
These are less urgent:

11. **Issue #8**: Image preload warnings
    - **Effort**: 1 day
    - **Why**: Console noise, low user impact

12. **Issue #12**: Subscription cleanup
    - **Effort**: 1 day
    - **Why**: Edge case memory leaks

---

## Progress Tracking

### Phase 1: Critical Auth (Week 1)
- [ ] Issue #2 - Race condition (3 days)
- [ ] Issue #1 - Dialog closing (2 days)
- [ ] Testing & fixes (2 days)

### Phase 2: High Priority Data (Week 2-3)
- [ ] Issue #3 - ID type mismatches (3 days)
- [ ] Issue #5 - Missing ingredients (2 days)
- [ ] Issue #6 - Data race (2 days)
- [ ] Testing & integration (1 day)

### Phase 3: Medium Priority (Week 3-4)
- [ ] Issue #4 - Null checks (1 day)
- [ ] Issue #7 - localStorage sync (2 days)
- [ ] Issue #11 - Error handling (3 days)
- [ ] Issue #9 - Timeouts (1 day)
- [ ] Issue #10 - Routing (1 day)

### Phase 4: Low Priority (Week 4)
- [ ] Issue #8 - Image preloading (1 day)
- [ ] Issue #12 - Cleanup (1 day)
- [ ] Final testing (1 day)

---

## Tips for Each Issue

### For the Person Fixing Issue #1-2 (Auth)
- Test both signup paths: email + password, and Google OAuth
- Use network throttling (3G) to test timing issues
- Check browser cookies throughout the flow
- Verify no redirect loops

### For the Person Fixing Issue #3-6 (Data)
- Add comprehensive logging to trace data flow
- Test with both empty and full ingredient lists
- Use React DevTools profiler to find render loops
- Check console for type errors

### For the Person Fixing Issue #7-12 (Maintenance)
- Add error boundaries where missing
- Test with network failures
- Check memory leaks with DevTools
- Add toast notifications for user feedback

---

## Common Patterns You'll See

### Pattern 1: Silent Failures
Many errors are logged to console but don't affect user. Look for:
```typescript
.catch(err => {
  console.error("Error:", err);  // ← User never sees this
  // No fallback or toast notification
})
```

**Fix**: Add `toast.error()` or show UI error state.

### Pattern 2: Race Conditions  
Multiple async operations without proper sequencing:
```typescript
setData(null);
await fetchDataAsync();  // What if this is slow?
// State might be empty when component renders
```

**Fix**: Use proper loading states and guards.

### Pattern 3: Type Coercion
IDs treated as different types:
```typescript
const id: string = "42";
const dbId: number = 42;
if (id === dbId) { }  // Always false!
```

**Fix**: Normalize to single type early.

---

## Testing Each Fix

### Minimum Tests for Every Fix:
1. Normal case works (happy path)
2. Error case doesn't crash (sad path)
3. Network delay doesn't break it
4. No console errors or warnings
5. Mobile and desktop both work

### Network Throttling Tests:
- Use Chrome DevTools → Network tab
- Slow 3G profile
- Offline then reconnect
- High latency, packet loss

### Memory Tests:
- Take heap snapshot before action
- Do action 10 times
- Take heap snapshot after
- Compare in DevTools Memory tab
- Should not grow indefinitely

---

## Committing Your Work

When you finish an issue:

1. **Branch name**: `fix/issue-#-description`
   - Example: `fix/issue-2-email-confirmation-race-condition`

2. **Commit message**:
   ```
   Fix: Issue #N - Brief description
   
   - Detailed change 1
   - Detailed change 2
   
   Fixes #N
   Test: [describe test approach]
   ```

3. **Before pushing**:
   - Run `npm run dev` - no build errors
   - Test in browser - expected behavior
   - Check console - no new warnings
   - Run linter - no style issues

4. **Update this document**:
   - Mark issue as ✅ Complete
   - Add commit hash
   - Note any unexpected findings

---

## Questions to Ask While Debugging

For EVERY issue, ask:
- [ ] When does this fail? (fast network? slow? offline?)
- [ ] What does the user see? (spinner? error? blank?)
- [ ] What does the browser console show? (errors? warnings?)
- [ ] What does the network tab show? (requests? failures?)
- [ ] What does the React DevTools show? (state? props?)
- [ ] How would I test if this is fixed?

---

## Resources in the Codebase

- **Auth architecture**: `docs/auth-and-profiles.md`
- **API routes**: `app/api/` directory
- **Data types**: `lib/types.ts` and `lib/supabase/database.types.ts`
- **Debug logs**: Search for `console.log` with `[CATEGORY]` prefix
- **Tests**: `tests/` directory (if any)

---

## Getting Help

If you get stuck on an issue:

1. Check the debug logs (they're verbose)
2. Look at related code in other files
3. Test with React DevTools profiler
4. Check network requests in browser
5. Ask in the analysis document - context is there

---

## Done! Now What?

Once all 12 issues are fixed:

1. **Integration test**: Entire user flow from signup to dashboard
2. **Performance audit**: Check Core Web Vitals
3. **Security review**: Auth flow, data access
4. **Documentation**: Update README with any architecture changes
5. **Deployment**: Stage in production-like environment first

---

Good luck! Each issue is self-contained, so you can work on them in parallel if you have multiple people.







