# QA Testing Guide: Auth Callback Email Confirmation Fix

## Overview

This guide covers manual testing of the email confirmation flow after the `otp_expired` fix.

**Target**: Verify that:
1. ✅ Valid confirmation links work (sign in successfully)
2. ✅ Expired links don't hang (show "Link Expired" UI)
3. ✅ Users can resend confirmation emails
4. ✅ New links from resend work
5. ✅ No infinite "Signing you in…" spinner

---

## Prerequisites

- **Test environment**: Development or staging
- **Browser DevTools**: Open Console (F12 → Console tab) to verify logs
- **Email access**: Can read test confirmation emails (Resend dashboard or test mailbox)
- **Test account**: Use a fresh email or one you can receive emails to

---

## Test Suite

### TEST 1: Valid Confirmation Link (Happy Path)

**Objective**: Verify that users can sign up and successfully confirm their email within the OTP window.

**Setup**:
- Fresh test email (e.g., `test.valid.001@example.com`)

**Steps**:
1. Navigate to app homepage
2. Click "Sign Up" button
3. Fill signup form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test.valid.001@example.com`
   - Password: `TestPassword123!`
4. Click "Create Account"
5. **Expected**: Message appears: "Check your email to confirm your account"
6. Open email confirmation email (check Resend dashboard in dev)
7. **Expected**: Subject line similar to: "Confirm your email - MixWise"
8. Click the confirmation link in the email
9. Browser navigates to `/auth/callback?next=/onboarding#access_token=...`
10. **Expected**:
    - Brief "Signing you in…" message shows (< 2 seconds)
    - Page redirects to `/onboarding`
    - No errors in console
    - User is logged in (can see profile, settings)
11. Open browser DevTools Console
12. **Expected logs**:
    ```
    [AuthCallbackPage] Callback params: { hasCode: false, hasAccessToken: true, hasRefreshToken: true, next: "/onboarding" }
    [AuthCallbackPage] Checking for existing session...
    [AuthCallbackPage] Setting session from tokens...
    [AuthCallbackPage] Session set successfully
    [AuthCallbackPage] User authenticated: <UUID>
    [AuthCallbackPage] Redirecting to: /onboarding
    ```

**Pass Criteria**:
- ✅ No spinner hang
- ✅ User successfully signed in
- ✅ Redirected to onboarding
- ✅ Expected logs present
- ✅ No "Link Expired" message

**Failure Scenarios**:
- ❌ Spinner hangs for >5 seconds → check Supabase redirect URL config
- ❌ Redirects to home instead of onboarding → check `next` param in link
- ❌ 404 or auth error → check token validity in Supabase

---

### TEST 2: Expired Confirmation Link

**Objective**: Verify that expired links show clear error and offer resend option.

**Setup**:
- Generate a confirmation link >1 hour old, OR
- Manually create an old signup and wait for OTP to expire, OR
- In dev mode: edit token in link to invalid string

**Steps**:
1. Navigate to expired/invalid confirmation link:
   ```
   https://localhost:3000/auth/callback?next=/onboarding#error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
   ```
   OR click old email link
2. **Expected**: Page loads and shows:
   ```
   ┌─────────────────────────────────────┐
   │      mixwise.                       │
   │                                     │
   │     Link Expired                    │
   │   Your confirmation link has        │
   │   expired or is invalid.            │
   │                                     │
   │ [Resend Confirmation Email]         │
   │ [Back to Home]                      │
   │                                     │
   │ (optional success/error message)    │
   └─────────────────────────────────────┘
   ```
3. **Important**: Should appear **immediately** (< 500ms), NOT a hanging spinner
4. Open browser DevTools Console
5. **Expected logs**:
   ```
   [AuthCallbackPage] Callback params: { hasCode: false, hasAccessToken: false, hasRefreshToken: false, next: "/onboarding" }
   [AuthCallbackPage] Checking for existing session...
   [AuthCallbackPage] Expired or invalid link detected: { code: "otp_expired", description: "Email link is invalid or has expired" }
   ```
6. Click "Resend Confirmation Email"
7. **Expected**:
   - Button text changes to "Sending…"
   - Button is disabled (cannot spam-click)
8. Wait for response (~2-3 seconds)
9. **Expected**:
   - Success message: "Check your email for a new confirmation link!"
   - Button returns to "Resend Confirmation Email"
   - Page auto-redirects to home after 3 seconds

**Pass Criteria**:
- ✅ "Link Expired" UI appears immediately (not spinner)
- ✅ Error state is clear and actionable
- ✅ "Resend" button is present and functional
- ✅ New email is sent successfully
- ✅ Console shows "Expired or invalid link detected"
- ✅ No timeouts or hanging states

**Failure Scenarios**:
- ❌ Spinner hangs → error not detected (check `parseAuthError()`)
- ❌ Resend button doesn't work → check `/api/auth/send-confirmation` endpoint
- ❌ No new email sent → check Resend API key, rate limit

---

### TEST 3: Resend Flow - Email Input

**Objective**: Verify that user can resend to a specific email address.

**Setup**:
- Already on "Link Expired" page from TEST 2
- No email pre-populated (fresh expired state)

**Steps**:
1. Click "Resend Confirmation Email" button
2. **Expected**: Browser prompts: "Please enter your email address:"
3. Enter email: `test.resend.001@example.com`
4. **Expected**:
   - Prompt closes
   - Email is saved to state
   - API call made to `/api/auth/send-confirmation`
5. Wait for response (~2-3 seconds)
6. **Expected**: Success message: "Check your email for a new confirmation link!"
7. Navigate to email inbox
8. **Expected**: New confirmation email received from `noreply@getmixwise.com`

**Pass Criteria**:
- ✅ Email prompt appears and accepts input
- ✅ Resend API is called with correct email
- ✅ New email is sent
- ✅ Success message shown
- ✅ Auto-redirect after 3s

**Failure Scenarios**:
- ❌ Prompt never appears → check `handleResendEmail()` logic
- ❌ "Too many requests" error → hit rate limit (wait 60s and retry)
- ❌ Email not received → check Resend dashboard, email validity

---

### TEST 4: Resend from Error State

**Objective**: Verify that generic auth errors can trigger resend.

**Setup**:
- Navigate to `/auth/callback` with invalid/missing params:
  ```
  https://localhost:3000/auth/callback?next=/onboarding#error=invalid_request
  ```

**Steps**:
1. Page loads
2. **Expected**: Shows "Sign-in failed" UI:
   ```
   ┌─────────────────────────────────────┐
   │      mixwise.                       │
   │                                     │
   │    Sign-in failed                   │
   │  (error message here)               │
   │                                     │
   │ [Back to Home]                      │
   │ [Resend Confirmation Email]         │
   └─────────────────────────────────────┘
   ```
3. Click "Resend Confirmation Email"
4. **Expected**: Status changes to "expired"
5. Click "Resend Confirmation Email" again (from expired state)
6. **Expected**: Email prompt appears
7. Enter email and proceed
8. **Expected**: Success message and new email sent

**Pass Criteria**:
- ✅ Generic error state has "Resend" button
- ✅ Clicking button switches to "expired" state
- ✅ Resend works from expired state
- ✅ User can successfully resend

**Failure Scenarios**:
- ❌ "Resend" button doesn't appear → check error UI rendering
- ❌ Button click doesn't work → check state management

---

### TEST 5: New Confirmation Link After Resend

**Objective**: Verify that new confirmation link sent via resend actually works.

**Setup**:
- Completed TEST 2 and resend was successful
- New confirmation email in inbox

**Steps**:
1. Open new confirmation email
2. Click the confirmation link
3. **Expected**: Browser navigates to `/auth/callback`
4. **Expected**: "Signing you in…" appears briefly
5. **Expected**: Redirects to `/onboarding`
6. **Expected**: User is now logged in
7. Open DevTools Console
8. **Expected logs**:
   ```
   [AuthCallbackPage] User authenticated: <UUID>
   [AuthCallbackPage] Redirecting to: /onboarding
   ```

**Pass Criteria**:
- ✅ New link successfully authenticates user
- ✅ Onboarding completes
- ✅ User is signed in
- ✅ No loops or errors

**Failure Scenarios**:
- ❌ Still gets "Link Expired" → resend didn't work properly
- ❌ Wrong redirect → check `next` param

---

### TEST 6: Multiple Resend Attempts (Rate Limit)

**Objective**: Verify that rate limiting prevents abuse (5 requests per minute per IP).

**Setup**:
- On "Link Expired" page
- Ready to click resend button repeatedly

**Steps**:
1. Click "Resend Confirmation Email"
2. **Expected**: Email sent, success message
3. Wait ~5 seconds
4. Click "Resend Confirmation Email" again
5. Repeat until request 6
6. **Expected for requests 1-5**: Success messages
7. **Expected for request 6**: Error: "Too many requests. Please try again later."
8. Wait 60 seconds
9. Click "Resend Confirmation Email"
10. **Expected**: Works again (rate limit window reset)

**Pass Criteria**:
- ✅ First 5 requests within 60s succeed
- ✅ Request 6 is rate limited
- ✅ Error message is user-friendly
- ✅ Rate limit resets after 60 seconds

**Failure Scenarios**:
- ❌ Rate limit doesn't work → check rate limit logic
- ❌ Wrong error message → update error handling
- ❌ Rate limit is too strict → adjust window/count

---

### TEST 7: User Already Logged In (Session Override)

**Objective**: Verify that if user is already logged in, callback page doesn't interfere.

**Setup**:
- User already signed in and logged in
- User has valid session cookie

**Steps**:
1. While logged in, manually navigate to:
   ```
   https://localhost:3000/auth/callback?next=/onboarding
   ```
2. **Expected**: Page loads briefly with "Signing you in…"
3. **Expected**: Silently redirects to `/onboarding`
4. **Expected**: No errors shown
5. **Expected**: User remains logged in
6. Open DevTools Console
7. **Expected logs**:
   ```
   [AuthCallbackPage] Checking for existing session...
   [AuthCallbackPage] Found existing session, user already authenticated
   [AuthCallbackPage] Redirecting authenticated user to: /onboarding
   ```

**Pass Criteria**:
- ✅ No error shown to user
- ✅ Silent redirect to onboarding
- ✅ User remains logged in
- ✅ Expected logs appear

**Failure Scenarios**:
- ❌ Shows error UI → session detection failed
- ❌ Doesn't redirect → check redirect logic

---

### TEST 8: Network Timeout (Failsafe Timer)

**Objective**: Verify that 12-second failsafe timer prevents infinite wait.

**Setup**:
- Network throttling in DevTools: Set to "Offline" or "GPRS" (very slow)
- Navigate to valid confirmation link

**Steps**:
1. Enable network throttling in DevTools (Network tab → Throttling)
2. Click confirmation link
3. Page loads slowly
4. Wait 12 seconds (failsafe timer duration)
5. **Expected after 12s**: One of:
   - Session exists → redirect silently
   - Session doesn't exist → "Sign-in failed" error appears
6. **Expected**: Never infinite spinner for >12 seconds

**Pass Criteria**:
- ✅ Failsafe timer fires after ~12 seconds
- ✅ User doesn't wait forever
- ✅ Appropriate action taken (redirect or error)
- ✅ User sees feedback

**Failure Scenarios**:
- ❌ Spinner hangs >12 seconds → failsafe not working
- ❌ Wrong action taken → check failsafe logic

---

## Regression Testing (After Fix)

### Verify Existing Flows Still Work

**TEST 9: Google OAuth**

1. Click "Sign Up" → "Sign in with Google"
2. Complete Google flow
3. **Expected**: Redirects to `/auth/callback` with valid tokens
4. **Expected**: Successfully signs in
5. **Expected**: No "Link Expired" message

**Pass**: ✅ if oauth flow unchanged

---

**TEST 10: Password Reset**

1. Click "Forgot password"
2. Enter email
3. Check email for reset link
4. Click reset link
5. **Expected**: Redirects to `/reset-password`
6. Reset password successfully
7. **Expected**: Can log in with new password

**Pass**: ✅ if password reset flow unchanged

---

## Browser Compatibility

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Android)

**Expected**: Identical behavior across all browsers

---

## Console Log Checklist

When testing, verify these logs appear in DevTools Console:

### For Valid Link Flow:
```
[AuthCallbackPage] Callback params: { hasCode: false, hasAccessToken: true, hasRefreshToken: true, next: "/onboarding" }
[AuthCallbackPage] Checking for existing session...
[AuthCallbackPage] Setting session from tokens...
[AuthCallbackPage] Session set successfully
[AuthCallbackPage] User authenticated: <UUID>
[AuthCallbackPage] Redirecting to: /onboarding
```

### For Expired Link Flow:
```
[AuthCallbackPage] Callback params: { hasCode: false, hasAccessToken: false, hasRefreshToken: false, next: "/onboarding" }
[AuthCallbackPage] Checking for existing session...
[AuthCallbackPage] Expired or invalid link detected: { code: "otp_expired", description: "Email link is invalid or has expired" }
```

### For Resend:
```
[AuthCallbackPage] Resend error: <response details>
```

---

## Known Issues & Workarounds

### Issue: "Email not received"
**Cause**: Email delivery, domain verification
**Workaround**: Check Resend dashboard, verify domain, check spam folder

### Issue: "Rate limited after 2 resends"
**Cause**: Multiple failed resends count against limit
**Workaround**: Wait 60 seconds, try again with correct email

### Issue: "Old token still works"
**Cause**: Token cache in browser storage
**Workaround**: Clear LocalStorage, try fresh link

---

## Sign-Off

| Tester Name | Date | Status | Notes |
|-------------|------|--------|-------|
| [Name] | [Date] | ✅ Pass / ❌ Fail | [Any issues found] |

---

## Summary

**Total Tests**: 10 + regression tests

**Expected Pass Rate**: 100%

**Critical Path**: TEST 1 (valid) + TEST 2 (expired) + TEST 3 (resend)

**If all critical tests pass**: ✅ Safe to deploy

