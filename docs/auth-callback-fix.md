# Auth Callback Fix: Email Confirmation Flow

## Problem Statement

After signup with email confirmation, users who clicked expired or invalid confirmation links were redirected to `/auth/callback` with error parameters in the URL hash:

```
https://www.getmixwise.com/auth/callback?next=/onboarding#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

The page would display:
> "Signing you in… Just a moment while we confirm your account."

**And never resolve.** The spinner would hang indefinitely.

## Root Cause

The `app/auth/callback/page.tsx` component:

1. ✅ Parsed query params (`code`, `next`)
2. ❌ **Did NOT parse the hash fragment** for error parameters
3. When Supabase returned `#error_code=otp_expired`, these errors were ignored
4. The page attempted to exchange a non-existent/invalid code
5. The error was caught but then the 12-second failsafe timer would keep trying to recover
6. No explicit error UI was shown for expired links
7. **Result: Infinite loading state** (failsafe timer looped but never succeeded)

## Solution Implemented

### 1. **Parse Hash Parameters for Errors** (lines 19-31)

Added `parseAuthError()` function that:
- Extracts `error`, `error_code`, `error_description` from hash
- Decodes URL-encoded descriptions
- Identifies expired links (`otp_expired` or `access_denied`)
- Returns structured error object

```typescript
function parseAuthError(hashParams: URLSearchParams): AuthError | null {
  const error = hashParams.get("error");
  const errorCode = hashParams.get("error_code");
  const errorDescription = hashParams.get("error_description");

  if (!error && !errorCode) return null;

  return {
    code: errorCode || error || "unknown_error",
    description: errorDescription ? decodeURIComponent(errorDescription) : error || "An error occurred",
    isExpired: errorCode === "otp_expired" || error === "access_denied",
  };
}
```

### 2. **Early Error Detection** (lines 92-115)

In the `run()` callback, immediately after parsing hash params:

```typescript
// Check for auth errors in hash (e.g., otp_expired)
const authError = parseAuthError(hashParams);
if (authError?.isExpired) {
  console.warn("[AuthCallbackPage] Expired or invalid link detected:", {
    code: authError.code,
    description: authError.description,
  });
  setStatus("expired");
  setError(authError.description);
  setErrorCode(authError.code);
  setExpiredEmail(null); // User can enter email on the UI
  return;
}
```

This **prevents the page from hanging** by immediately returning when an expired link is detected.

### 3. **New "expired" Status** (lines 50)

Added a third status state:
```typescript
const [status, setStatus] = useState<"loading" | "error" | "expired">("loading");
```

### 4. **Expired Link UI** (lines 275-297)

When status is "expired", users see:

```
┌─────────────────────────┐
│      mixwise.          │
│   Link Expired          │
│ Your confirmation link  │
│ has expired or is      │
│ invalid.               │
│                        │
│ [Resend Email] [Home]  │
└─────────────────────────┘
```

### 5. **Resend Confirmation Handler** (lines 235-268)

New `handleResendEmail()` function:

- Validates that email is provided (prompts if not)
- Calls `/api/auth/send-confirmation` endpoint
- Shows success/failure feedback
- Auto-redirects to home after 3s on success

```typescript
const handleResendEmail = async (emailToResend?: string) => {
  const emailToUse = emailToResend || expiredEmail;
  if (!emailToUse) {
    const email = prompt("Please enter your email address:");
    if (!email) return;
    setExpiredEmail(email);
    handleResendEmail(email);
    return;
  }

  setIsResending(true);
  try {
    const res = await fetch("/api/auth/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToUse }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      setError("Check your email for a new confirmation link!");
      setTimeout(() => {
        router.replace("/");
      }, 3000);
    } else {
      setError(data.error || "Failed to resend email. Please try again.");
    }
  } catch (err) {
    console.error("[AuthCallbackPage] Resend error:", err);
    setError("Failed to resend email. Please try again.");
  } finally {
    setIsResending(false);
  }
};
```

### 6. **Comprehensive Logging** (lines 132-149, throughout)

Added detailed console logs that print:
- Whether code/tokens/existing session was found
- Each step of the exchange process
- Any errors encountered
- Final redirect target

Example logs:
```
[AuthCallbackPage] Callback params: { hasCode: false, hasAccessToken: false, hasRefreshToken: false, next: "/onboarding" }
[AuthCallbackPage] Checking for existing session...
[AuthCallbackPage] No callback parameters and no session found
[AuthCallbackPage] Error during auth callback: { message: "Missing auth callback parameters", error: Error }
```

## Files Changed

### `/app/auth/callback/page.tsx`
- ✅ Added `AuthError` interface
- ✅ Added `parseAuthError()` function
- ✅ Added "expired" status state
- ✅ Added resend email handler
- ✅ Updated UI to show expired state with resend button
- ✅ Added comprehensive logging

### `/app/api/auth/send-confirmation/route.ts`
- ✅ **Already exists** - no changes needed
- Generates magiclink confirmation tokens
- Sends via Resend with custom templates
- Rate-limited to 5 requests/minute per IP

## Behavior Changes

### Before

1. ✗ Expired link → infinite "Signing you in…" spinner
2. ✗ No way for user to resend email from error state
3. ✗ Generic "Sign-in failed" message (no "expired" distinction)
4. ✗ No console logging to debug issues

### After

1. ✅ Expired link → "Link Expired" UI with clear message
2. ✅ "Resend Confirmation Email" button → triggers `/api/auth/send-confirmation`
3. ✅ Distinct "expired" vs. "error" states
4. ✅ Full console logging for debugging
5. ✅ Graceful fallback: if session exists despite error, proceed anyway

## How Confirmation Links Work

### Signup Flow

1. User fills signup form
2. Client calls `/api/auth/signup` with email + password
3. Server:
   - Uses `supabaseAdmin.auth.admin.generateLink({ type: "signup", ... })`
   - Creates user + generates confirmation link in one call
   - Sends confirmation email via Resend
   - Link includes token, type, and redirect_to params
4. User clicks link in email
5. Either redirects to:
   - `/auth/verify?token=...&type=...&redirect_to=...` (our safe wrapper)
   - OR Supabase directly (less common)
6. Supabase verifies token, creates session, redirects to `/auth/callback?next=/onboarding`
7. Or if token is expired: redirects with `#error_code=otp_expired`

### Token Expiry

- **Generated by**: `supabaseAdmin.auth.admin.generateLink()`
- **Expires after**: Default is 1 hour (configurable in Supabase Auth settings)
- **Returned on expiry**: Hash parameters with `error_code=otp_expired`
- **Not configurable in code**: Token lifetime is set in Supabase Dashboard

> **Note**: If OTP expiry is too short (e.g., 10 minutes), users may not check email in time. This is configured in Supabase Auth → Authentication Settings → Email Auth → OTP Expiry. The app code cannot override this—only Supabase admin can change it.

## Manual QA Testing

### Test 1: Valid Confirmation Link (Happy Path)

**Goal**: Signup → click valid link → land in onboarding signed-in

**Steps**:
1. Go to `/` and click "Sign Up"
2. Fill form: email, password, first/last name
3. Submit → "Check your email to confirm" message
4. Open email (check Resend dashboard in dev mode)
5. Click confirmation link **within 1 hour**
6. **Expected**: 
   - Browser shows "Signing you in…" briefly
   - Redirects to `/onboarding`
   - User is logged in (can see profile, make saves)
   - Console shows: `[AuthCallbackPage] Redirecting to: /onboarding`

### Test 2: Expired Confirmation Link

**Goal**: Click an expired/invalid link → see "Link Expired" UI → resend email

**Steps**:
1. Use a valid confirmation link from an old signup (>1 hour old)
2. OR manually edit a fresh link to break the token
3. Click the link
4. **Expected**:
   - URL shows `#error_code=otp_expired` (or `#error=access_denied`)
   - Page displays:
     ```
     Link Expired
     Your confirmation link has expired or is invalid.
     [Resend Confirmation Email] [Back to Home]
     ```
   - Console shows: `[AuthCallbackPage] Expired or invalid link detected: { code: "otp_expired", description: "..." }`
5. Click "Resend Confirmation Email"
6. **Expected**:
   - Button shows "Sending…" briefly
   - New email sent
   - Success message appears: "Check your email for a new confirmation link!"
   - Auto-redirects to home after 3 seconds
7. Check email for new link
8. Click new link
9. **Expected**: Complete signin flow as in Test 1

### Test 3: Resend Without Email

**Goal**: Expired state → resend but no email known → prompt user

**Steps**:
1. Land on expired state (Test 2, step 4)
2. Don't pre-populate email
3. Click "Resend Confirmation Email"
4. **Expected**:
   - Browser prompts: "Please enter your email address:"
   - User enters email
   - API call is made with that email
   - Resend flow continues

### Test 4: No Params (Edge Case)

**Goal**: Visit `/auth/callback` with no params/code/tokens

**Steps**:
1. Manually navigate to `/auth/callback` with no params
2. **Expected**:
   - Page checks for existing session (already logged in?)
   - If logged in: silently redirect to onboarding/dashboard
   - If not logged in: "Sign-in failed" error after timeout
   - Console shows: `[AuthCallbackPage] Missing auth callback parameters`

### Test 5: Multiple Resends (Rate Limit)

**Goal**: Resend > 5 times in 60 seconds → hit rate limit

**Steps**:
1. Land on expired state
2. Click "Resend Confirmation Email" 6+ times rapidly
3. **Expected**:
   - Requests 1-5 succeed
   - Request 6+ returns 429: "Too many requests. Please try again later."
   - Error shown on page: "Failed to resend email. Please try again."

### Test 6: Existing Session Override

**Goal**: If user already logged in, don't block on callback params

**Steps**:
1. Sign up & confirm successfully
2. Wait 1 minute
3. Manually visit `/auth/callback?next=/onboarding` (with or without code)
4. **Expected**:
   - Already has session cookie
   - Page detects it immediately (line 98-110)
   - Silently redirects to onboarding
   - User sees no error

## Debugging Checklist

### User lands on infinite "Signing you in…"

**Do**:
1. Open browser DevTools → Console
2. Look for logs:
   - `[AuthCallbackPage] Callback params: ...` (should appear immediately)
   - `[AuthCallbackPage] Expired or invalid link detected: ...` (if expired)
   - `[AuthCallbackPage] Error during auth callback: ...` (if error)
3. Check Network tab → look for `/api/auth/send-confirmation` requests
4. Check browser local storage → verify `SUPABASE_AUTH_TOKEN` cookie exists

**Common causes**:
- ❌ Link truly expired → show "Link Expired" UI (FIXED by this change)
- ❌ Supabase URL mismatch in `.env.local` → check `NEXT_PUBLIC_SUPABASE_URL`
- ❌ Auth redirect URLs not configured in Supabase → check Supabase Dashboard
- ❌ Network issue → check Network tab for failed requests

### "Check your email for a new confirmation link!" but email doesn't arrive

**Do**:
1. Check Resend dashboard → Email logs → search for user email
2. Check spam/promotions folder in email
3. Verify `RESEND_API_KEY` is set in production
4. Check `/api/auth/send-confirmation` logs
5. Verify `NEXT_PUBLIC_SITE_URL` is correct (used for email link)

**Common causes**:
- ❌ `RESEND_API_KEY` not configured → emails won't send
- ❌ Email domain not verified in Resend → emails bounce
- ❌ User's email bounces → Resend suppresses future sends
- ❌ `getCanonicalSiteUrl()` returning wrong domain → link invalid

### Resend button shows "Sending…" forever

**Do**:
1. Check Network tab for hanging `/api/auth/send-confirmation` request
2. Check server logs → look for `[Send Confirmation]` lines
3. Verify Resend API key is valid
4. Check rate limit: IP limited to 5 requests/minute

## Environment Variables Reference

```bash
# Required for auth flow
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side only

# Required for emails
RESEND_API_KEY=re_xxxxxxxxxxxx

# Optional for site redirects
NEXT_PUBLIC_SITE_URL=https://getmixwise.com
```

## Related Files

- `/app/auth/callback/page.tsx` ← Updated (this fix)
- `/app/api/auth/send-confirmation/route.ts` ← Existing (no changes)
- `/app/api/auth/signup/route.ts` ← Existing (generates initial link)
- `/app/auth/verify/route.ts` ← Wrapper to avoid Supabase URL in email hrefs
- `/lib/email/templates.ts` ← Email template (confirmation link)
- `/lib/site.ts` ← Site URL helpers

## Future Improvements

1. **Token Expiry UI Messaging**
   - Add banner to signup confirmation: "Link expires in 1 hour"
   - Let Supabase auth settings control expiry, show in UI

2. **Resend Email Background Jobs**
   - Rate limiting is in-memory (resets on server restart)
   - Could use Redis for persistent rate limiting

3. **Session Recovery**
   - If user has valid session, don't show error (already done)
   - Could auto-refresh token if expired

4. **Analytics**
   - Track confirmation success/failure rates
   - Alert on unusual error patterns

5. **A/B Testing Email Templates**
   - Resend supports sending variants
   - Track which template version works best

