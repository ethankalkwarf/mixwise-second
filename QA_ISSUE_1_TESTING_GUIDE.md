# QA Issue #1: Auth Dialog Not Closing - TESTING GUIDE

**Purpose**: Verify that the auth dialog properly closes after email signup confirmation  
**Date**: 2026-01-01  
**Status**: READY FOR TESTING

---

## Pre-Test Setup

### Requirements
- Node.js running with the dev server
- Email service (Supabase Auth or test email configured)
- Browser Developer Tools open (for console monitoring)
- A test email address you can access

### Browser Console Setup

Open your browser's Developer Tools (F12 or Cmd+Option+I) and go to the Console tab. You'll be monitoring for these log messages:

```
[AuthCallbackPage] ...
[AuthDialog] ...
[UserProvider] ...
```

---

## Test Cases

### 🟢 TEST 1: Email Signup Flow (Happy Path)

**Objective**: Verify dialog closes after email confirmation

#### Steps:

1. **Open the app** in your browser
   - Navigate to `http://localhost:3000` (or your dev server)
   - Verify the homepage loads

2. **Click "Sign Up Free"** or similar CTA
   - The auth dialog should open
   - Dialog shows "Create your free MixWise account"

3. **Fill out the signup form**
   - Email: `test+{timestamp}@example.com` (e.g., `test+20260101123456@example.com`)
   - First Name: `Test`
   - Last Name: `User`
   - Password: `SecurePassword123!`
   - Confirm Password: `SecurePassword123!`

4. **Click "Create Account"**
   - Dialog should show loading state
   - Monitor console for: `[AuthCallbackPage] Signup API call...` or similar
   - Dialog should transition to "Account created!" message
   - Display: "We sent a confirmation link to test+{timestamp}@example.com"

5. **Copy the confirmation email link**
   - Check the email inbox for test email address
   - Find email from MixWise with subject like "Confirm your email"
   - Copy the confirmation link (contains code and tokens)

6. **Click the confirmation link**
   - Click directly or copy-paste into browser address bar
   - You'll be redirected to `/auth/callback`
   - Page shows "Signing you in… Just a moment while we confirm your account."

7. **Monitor console output**
   - Watch for these logs in order:
     ```
     [AuthCallbackPage] Callback params: { hasCode: true, ... }
     [AuthCallbackPage] Exchanging code for session...
     [AuthCallbackPage] Code exchanged successfully
     [AuthCallbackPage] Have valid tokens, redirecting directly to: /onboarding
     [AuthCallbackPage] Navigating to: /onboarding
     [AuthDialog] Email confirmation detected, closing dialog  ← KEY LINE
     ```

8. **Verify the outcome**
   - [ ] Redirected to `/onboarding` page
   - [ ] Auth dialog is NOT visible
   - [ ] Console shows `[AuthDialog] Email confirmation detected, closing dialog`
   - [ ] No console errors about "unmounted component"
   - [ ] Can proceed through onboarding flow normally

#### Expected Result: ✅ PASS
Dialog closes cleanly, user is authenticated, no visual or console errors.

#### If Test Fails:
- [ ] Dialog still visible on onboarding page → Issue with event dispatch
- [ ] Console error about unmounted component → React state issue
- [ ] No `[AuthDialog] Email confirmation detected` log → Event not firing
- [ ] User not authenticated on onboarding page → Auth callback issue

---

### 🟢 TEST 2: Email Signup with Manual Dialog Close

**Objective**: Verify dialog handles user closing it manually

#### Steps:

1. **Repeat steps 1-4 from TEST 1**
   - Get to the "Account created!" message in dialog

2. **Close the dialog manually**
   - Click the X button (top right of dialog)
   - Dialog should close

3. **Click the confirmation email link**
   - User is NOT on a page with the dialog
   - Auth callback processes normally
   - User is redirected to onboarding

4. **Verify outcome**
   - [ ] No errors in console about dialog listeners
   - [ ] User is authenticated
   - [ ] No broken UI state

#### Expected Result: ✅ PASS
Dialog closes when user manually dismisses it, email confirmation still works separately.

---

### 🟢 TEST 3: Different Tab/Window Confirmation

**Objective**: Verify signup works across tabs

#### Steps:

1. **Open app in Tab A**
   - Click "Sign Up Free"
   - Fill signup form
   - Click "Create Account"
   - Dialog shows "Check your email"

2. **Open email confirmation link in Tab B**
   - In a new tab/window, click the confirmation link
   - Auth callback completes
   - Tab B is redirected to onboarding, user authenticated

3. **Switch back to Tab A**
   - Dialog is still visible with "Check your email" message
   - This is expected - no email link was clicked on this tab

4. **Manually close dialog on Tab A**
   - Click X button to dismiss

#### Expected Result: ✅ PASS
Each tab is independent; email confirmation only affects the tab where the link was clicked.

---

### 🟢 TEST 4: Google OAuth Flow (Regression Test)

**Objective**: Verify existing OAuth signup still works

#### Steps:

1. **Open the app**
   - Click "Sign Up Free"

2. **Click "Continue with Google"**
   - You'll be redirected to Google login
   - Authenticate with a Google account
   - Redirected back to app

3. **Monitor console**
   - Look for: `[UserProvider] Auth state change: SIGNED_IN`
   - Should NOT see `[AuthDialog] Email confirmation detected...` (wrong flow)

4. **Verify outcome**
   - [ ] Dialog closes automatically
   - [ ] Redirected to onboarding
   - [ ] User is authenticated
   - [ ] No dialog visible

#### Expected Result: ✅ PASS
Google OAuth flow continues working via the existing `isAuthenticated` useEffect.

---

### 🟢 TEST 5: Email/Password Login (Regression Test)

**Objective**: Verify email login still works

#### Steps:

1. **Have an existing account** from previous tests
   - If not, create one (TEST 1)

2. **Open the app**
   - Click "Log in" (or switch dialog to login mode)

3. **Fill login form**
   - Email: (account created in step 1)
   - Password: (password created in step 1)
   - Click "Log In"

4. **Monitor console**
   - Should see `isAuthenticated` become true
   - Dialog should close automatically

5. **Verify outcome**
   - [ ] Dialog closes immediately after successful login
   - [ ] Authenticated without email confirmation
   - [ ] No new `emailConfirmed` events in console

#### Expected Result: ✅ PASS
Email password login continues working, dialog closes via existing mechanism.

---

### 🔴 TEST 6: Invalid Confirmation Link

**Objective**: Verify error handling

#### Steps:

1. **Start email signup** (TEST 1 steps 1-4)
   - Get to "Check your email" message

2. **Manually navigate to auth callback with invalid code**
   - Go to: `http://localhost:3000/auth/callback?code=invalid_code`

3. **Observe the error page**
   - Should show error message
   - Options to retry or go home

4. **Verify outcome**
   - [ ] Dialog is closed (user navigated away)
   - [ ] Error page displays correctly
   - [ ] No console errors about dialog

#### Expected Result: ✅ PASS
Invalid confirmations handled gracefully, no dialog-related issues.

---

### 🔴 TEST 7: Expired Confirmation Link

**Objective**: Verify expired link handling

#### Steps:

1. **Wait for confirmation link to expire**
   - Typically 24 hours from signup
   - Or use link from old email

2. **Click the expired confirmation link**
   - Redirected to auth callback
   - Should show "Link Expired" message

3. **Option to resend**
   - Button to resend confirmation email
   - Follow resend flow

4. **Verify outcome**
   - [ ] Proper error messaging
   - [ ] No dialog-related errors
   - [ ] Resend flow works

#### Expected Result: ✅ PASS
Expired links handled with proper UX.

---

### 🟡 TEST 8: Network Latency Simulation

**Objective**: Verify behavior with slow network

#### Steps:

1. **Open Developer Tools → Network tab**
   - Set throttling to "Slow 3G" or similar
   - Or use Chrome DevTools "Slow 3G" preset

2. **Complete email signup**
   - Click confirmation link
   - Auth callback takes longer
   - Observe "Signing you in…" message persists

3. **Monitor console**
   - Should eventually show: `[AuthDialog] Email confirmation detected...`
   - No errors or timeouts

4. **Verify outcome**
   - [ ] Dialog closes even with delay
   - [ ] No "timeout" errors
   - [ ] User eventually authenticated
   - [ ] Proper loading states shown

#### Expected Result: ✅ PASS
Slow networks handled gracefully, dialog closes correctly.

---

### 🟡 TEST 9: Rapid Form Submission

**Objective**: Verify handling of double-clicks/rapid submissions

#### Steps:

1. **Open signup dialog**
   - Fill out form

2. **Rapidly click "Create Account" multiple times**
   - Button should be disabled after first click
   - Only one API call should be made

3. **Monitor form behavior**
   - Button shows loading state
   - Can't submit again while loading

4. **Verify outcome**
   - [ ] Only one account created
   - [ ] No duplicate errors
   - [ ] Dialog shows "Check Your Email" once

#### Expected Result: ✅ PASS
Form submission properly debounced.

---

### 🟡 TEST 10: Browser Back Button After Confirmation

**Objective**: Verify browser navigation edge case

#### Steps:

1. **Complete email signup and confirmation** (TEST 1)
   - User is on `/onboarding` page
   - User is authenticated

2. **Click browser Back button**
   - Should go to previous page
   - User remains authenticated

3. **Navigate to auth-related pages**
   - Try to access `/auth/callback` manually
   - Should redirect since already authenticated

4. **Verify outcome**
   - [ ] Back button works normally
   - [ ] Auth state persists
   - [ ] No unexpected redirects

#### Expected Result: ✅ PASS
Browser navigation works correctly.

---

## Console Log Checklist

During email signup confirmation, you should see these console logs in order:

```
✅ [AuthCallbackPage] Callback params: { hasCode: true, hasAccessToken: false, hasRefreshToken: false, next: '/' }
✅ [AuthCallbackPage] Checking for existing session...
✅ [AuthCallbackPage] Exchanging code for session...
✅ [AuthCallbackPage] Code exchanged successfully
✅ [AuthCallbackPage] Have valid tokens, redirecting directly to: /onboarding
✅ [AuthCallbackPage] Navigating to: /onboarding
✅ [AuthDialog] Email confirmation detected, closing dialog      ← CRITICAL
✅ [UserProvider] Auth state change: SIGNED_IN, ...
✅ [UserProvider] Updating auth state: { hasSession: true, ... }
✅ [UserProvider] Fetching profile for user: {userId}
✅ [UserProvider] Profile fetched: true
✅ [UserProvider] Setting loading to false
```

### ⚠️ If You DON'T See:
`[AuthDialog] Email confirmation detected, closing dialog`

Then the custom event is not firing. Check:
1. Are you on the /auth/callback page? (Should be)
2. Are there JavaScript errors? (Check console)
3. Is the window object available? (Should be on client side)
4. Are there DOM errors? (Check browser console)

---

## Errors to Watch For

### 🔴 Critical Errors

**"Can't perform a React state update on an unmounted component"**
- Indicates: Component unmounted while state update pending
- Solution: Check useEffect cleanup logic
- Status: Should NOT occur with this fix

**"Failed to establish session"**
- Indicates: Auth callback failed
- Solution: Check email confirmation link validity
- Status: Expected for expired/invalid links

### 🟡 Warnings

**"Event listener added/removed repeatedly"**
- Indicates: Maybe performance issue
- Status: Normal if signup happens multiple times in development

### ✅ OK Messages

**"Failsafe timer triggered"**
- Indicates: Auth callback took >3 seconds
- Status: Normal on slow networks, not a failure

---

## Mobile Testing

### iOS Safari

1. Send test email to phone
2. Click link in email
3. Observe same behavior as desktop
4. Check for any rendering issues

### Android Chrome

1. Send test email to phone
2. Click link in email
3. Observe same behavior as desktop
4. Check for keyboard/input issues

---

## Test Report Template

Use this template to document your test results:

```
## Test Execution Report

**Tester**: [Name]
**Date**: [YYYY-MM-DD]
**Platform**: [OS, Browser, Version]
**Build Version**: [Commit hash or tag]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| TEST 1: Email Signup | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 2: Manual Close | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 3: Different Tab | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 4: Google OAuth | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 5: Email Login | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 6: Invalid Link | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 7: Expired Link | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 8: Slow Network | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 9: Rapid Submit | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 10: Back Button | ✅ PASS / ❌ FAIL | [Notes] |

### Summary
- Total Passed: [X]
- Total Failed: [Y]
- Blockers: [Y/N]

### Console Output
(Paste relevant console logs below)

### Screenshots
(Attach screenshots of any issues)

### Recommendations
(Any additional notes or improvements)
```

---

## Automation Suggestions

For CI/CD pipelines, consider adding:

```javascript
// Check that event fires during signup confirmation
test('dispatch emailConfirmed event during auth callback', async () => {
  const listener = jest.fn();
  window.addEventListener('mixwise:emailConfirmed', listener);
  
  // Simulate auth callback
  render(<AuthCallbackPage />);
  
  // Wait for redirect
  await waitFor(() => {
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mixwise:emailConfirmed'
      })
    );
  });
});

// Check that dialog closes
test('dialog closes when emailConfirmed event fires', async () => {
  const { getByRole, queryByRole } = render(
    <AuthDialog isOpen={true} onClose={jest.fn()} />
  );
  
  fireEvent(window, new CustomEvent('mixwise:emailConfirmed', {
    detail: { success: true }
  }));
  
  await waitFor(() => {
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

---

## Sign-Off

When all tests pass, sign off:

```
✅ All tests passed
✅ No console errors
✅ No regression in other auth flows
✅ Ready for production deployment

Approved by: [QA Name]
Date: [Date]
```

---

## Quick Reference

### Fastest Way to Test

1. Start dev server
2. Open browser console
3. Click "Sign Up Free"
4. Fill form with unique email
5. Click "Create Account"
6. Click email confirmation link
7. Check console for: `[AuthDialog] Email confirmation detected`
8. Verify you're on onboarding page without dialog

**Time**: ~2 minutes per full test cycle

### Key Files to Monitor

- `components/auth/AuthDialog.tsx` - Dialog closure logic
- `app/auth/callback/page.tsx` - Event dispatch
- Browser console - Log messages

---

## Support

If tests fail:

1. **Check console logs** - Look for errors
2. **Verify email service** - Confirmation email sending correctly
3. **Check auth config** - Supabase settings
4. **Review recent changes** - Any conflicting modifications
5. **Clear browser cache** - Old code in memory
6. **Try incognito mode** - Isolate from extensions

**Report issues** with:
- Exact test number and steps
- Browser/OS details
- Console error messages
- Screenshots if applicable

