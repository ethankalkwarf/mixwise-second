# Auth Callback Flow Diagram

## Email Confirmation Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SIGNS UP                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. User fills signup form                                      │
│    ├─ Email: user@example.com                                 │
│    ├─ Password: *********                                     │
│    ├─ Name: John Doe                                          │
│    └─ Submits to /api/auth/signup                             │
│                                                                │
│ 2. Server creates user + generates confirmation link          │
│    ├─ admin.auth.generateLink(type: "signup", email: ...)   │
│    ├─ Returns action_link with token                          │
│    └─ Stores user in Supabase auth.users                      │
│                                                                │
│ 3. Server sends confirmation email via Resend                 │
│    ├─ To: user@example.com                                    │
│    ├─ Subject: Confirm your email - MixWise                   │
│    └─ Link: https://www.getmixwise.com/auth/verify?           │
│        token=abc123&type=signup&redirect_to=...               │
│                                                                │
│ 4. Client shows: "Check your email to confirm"                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS EMAIL LINK                       │
├─────────────────────────────────────────────────────────────────┤
│ User receives email and clicks the confirmation link           │
│                                                                │
│ Link: /auth/verify?token=abc123&type=signup&redirect_to=... │
│                                                                │
│ Sequence:                                                      │
│ 1. /auth/verify handler runs (server-side)                     │
│    └─ Redirects to Supabase /auth/v1/verify                   │
│                                                                │
│ 2. Supabase verifies token:                                    │
│    ├─ ✅ If valid (within 1 hour):                           │
│    │   ├─ Creates session                                     │
│    │   ├─ Sets access_token + refresh_token                  │
│    │   └─ Redirects to /auth/callback with tokens in hash    │
│    │                                                           │
│    └─ ❌ If expired (> 1 hour):                               │
│        └─ Redirects to /auth/callback with error in hash      │
│           #error_code=otp_expired&error_description=...       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           CASE 1: VALID LINK (< 1 HOUR OLD)                    │
├─────────────────────────────────────────────────────────────────┤
│ Browser URL:                                                   │
│ /auth/callback?next=/onboarding#access_token=...&refresh=... │
│                                                                │
│ ✅ auth/callback/page.tsx runs:                               │
│                                                                │
│ 1. Parse params & hash                                         │
│    ├─ code: null                                              │
│    ├─ accessToken: "jwt-token"                                │
│    ├─ refreshToken: "refresh-token"                           │
│    └─ authError: null ← No error!                             │
│                                                                │
│ 2. Continue to session exchange                               │
│    └─ supabase.auth.setSession({                              │
│         access_token: accessToken,                            │
│         refresh_token: refreshToken,                          │
│       })                                                       │
│                                                                │
│ 3. Get authenticated user                                      │
│    └─ supabase.auth.getUser() → User { id, email, ... }      │
│                                                                │
│ 4. Determine if onboarding needed                              │
│    ├─ Check user_preferences.onboarding_completed             │
│    ├─ If not found (new user): needsOnboarding = true         │
│    └─ If completed: needsOnboarding = false                   │
│                                                                │
│ 5. Send welcome email (fire-and-forget)                        │
│    └─ POST /api/auth/send-welcome                             │
│                                                                │
│ 6. Redirect to onboarding (or other next param)                │
│    └─ router.replace("/onboarding")                           │
│                                                                │
│ Console logs:                                                  │
│ [AuthCallbackPage] Callback params: { hasCode: false, ...}  │
│ [AuthCallbackPage] Setting session from tokens...             │
│ [AuthCallbackPage] Session set successfully                   │
│ [AuthCallbackPage] User authenticated: <uuid>                 │
│ [AuthCallbackPage] Redirecting to: /onboarding                │
│                                                                │
│ Result: 😊 User sees brief "Signing you in..." then lands    │
│         on onboarding page, logged in and ready!              │
└─────────────────────────────────────────────────────────────────┘

                         OR

┌─────────────────────────────────────────────────────────────────┐
│        CASE 2: EXPIRED LINK (> 1 HOUR OLD) - THE FIX!          │
├─────────────────────────────────────────────────────────────────┤
│ Browser URL:                                                   │
│ /auth/callback?next=/onboarding                               │
│ #error_code=otp_expired&error_description=Email+link+is+... │
│                                                                │
│ ✅ auth/callback/page.tsx DETECTS ERROR EARLY:               │
│                                                                │
│ 1. Parse hash params                                           │
│    └─ hashParams = getHashParams()                            │
│       // = URLSearchParams("error_code=otp_expired&...")       │
│                                                                │
│ 2. ✅ NEW: Call parseAuthError()                              │
│    │   const error = hashParams.get("error")                  │
│    │   const errorCode = hashParams.get("error_code")          │
│    │   const errorDescription = hashParams.get("...")          │
│    │                                                           │
│    │   if (!error && !errorCode) return null;                 │
│    │                                                           │
│    │   return {                                                │
│    │     code: "otp_expired",                                  │
│    │     description: "Email link is invalid or has expired", │
│    │     isExpired: true, ← KEY CHECK                         │
│    │   }                                                       │
│    │                                                           │
│    └─ authError = AuthError { ... }                           │
│                                                                │
│ 3. ✅ NEW: EARLY RETURN on expired link                      │
│    │   if (authError?.isExpired) {                            │
│    │     console.warn("Expired or invalid link detected...")  │
│    │     setStatus("expired") ← NEW STATUS                   │
│    │     setError(authError.description)                      │
│    │     setErrorCode(authError.code)                         │
│    │     setExpiredEmail(null)                                │
│    │     return; ← STOP HERE! Don't try exchange!             │
│    │   }                                                       │
│    └─ Exit useEffect immediately                              │
│                                                                │
│ 4. Component re-renders with status="expired"                  │
│    └─ if (status === "expired") {                             │
│         // Show "Link Expired" UI                             │
│       }                                                        │
│                                                                │
│ ✅ NEW UI SHOWN:                                              │
│    ┌────────────────────────────────────────┐                │
│    │         mixwise.                       │                │
│    │                                        │                │
│    │    Link Expired                        │                │
│    │  Your confirmation link has            │                │
│    │  expired or is invalid.                │                │
│    │                                        │                │
│    │ ┌──────────────────────────────────┐  │                │
│    │ │ Resend Confirmation Email (BTN)  │  │                │
│    │ └──────────────────────────────────┘  │                │
│    │ ┌──────────────────────────────────┐  │                │
│    │ │ Back to Home (BTN)               │  │                │
│    │ └──────────────────────────────────┘  │                │
│    │                                        │                │
│    │ (error message area)                   │                │
│    └────────────────────────────────────────┘                │
│                                                                │
│ Console logs:                                                  │
│ [AuthCallbackPage] Expired or invalid link detected: {        │
│   code: "otp_expired",                                        │
│   description: "Email link is invalid or has expired"         │
│ }                                                              │
│                                                                │
│ ✅ KEY DIFFERENCE FROM BEFORE:                               │
│    BEFORE: Hangs on "Signing you in..." forever              │
│    AFTER:  Shows "Link Expired" instantly (< 500ms)           │
│                                                                │
│ Result: 😊 User sees clear error + recovery option (resend)  │
└────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USER CLICKS "RESEND EMAIL"                     │
├─────────────────────────────────────────────────────────────────┤
│ ✅ NEW FEATURE: handleResendEmail() runs                       │
│                                                                │
│ 1. Get email to resend to                                      │
│    ├─ If expiredEmail set: use it                             │
│    ├─ If not: prompt user "Please enter your email..."       │
│    └─ Validate format                                         │
│                                                                │
│ 2. Button shows "Sending..." (disabled)                        │
│                                                                │
│ 3. Call /api/auth/send-confirmation                            │
│    └─ POST {                                                   │
│         email: "user@example.com"                             │
│       }                                                        │
│                                                                │
│ 4. Server generates NEW confirmation link                      │
│    ├─ admin.auth.generateLink(type: "magiclink", email: ...)  │
│    ├─ Creates new token (valid for 1 hour)                    │
│    └─ Sends email with new link                               │
│                                                                │
│ 5. Page shows: "Check your email for a new link!"             │
│                                                                │
│ 6. Auto-redirect to home after 3 seconds                       │
│    └─ router.replace("/")                                     │
│                                                                │
│ Result: 🎉 User has fresh confirmation link to try again      │
└────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          USER CLICKS NEW CONFIRMATION LINK                      │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Same as CASE 1 (Valid Link):                               │
│    - Token is fresh (new from resend)                         │
│    - Within 1 hour window                                      │
│    - Supabase accepts it                                       │
│    - Session created                                           │
│    - User signed in!                                           │
│                                                                │
│ Result: ✅ Successful signup + confirmation complete!         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status State Diagram

```
                    Page Loads
                        │
                        ▼
                  ┌────────────┐
                  │  "loading" │ ← Initial state
                  └────┬───────┘
                       │
                       ▼
              ┌────────────────────┐
              │ Check for errors   │
              │ in hash params     │
              └────┬───────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ✅ Error found       ❌ No error
         │                   │
         ▼                   ▼
    ┌─────────────┐    ┌──────────────┐
    │ parseAuthError │    │ Continue to  │
    │  { code,       │    │ session setup │
    │  isExpired }   │    └──────┬───────┘
    └────┬─────────┘            │
         │                      ▼
         │                  ┌─────────────┐
         │                  │ Try exchange │
         │                  │ code/tokens │
         │                  └──┬──────┬──┘
         │                     │      │
         │                 ✅ OK   ❌ Fail
         │                     │      │
         │                     ▼      ▼
         │              ┌──────────┐ ┌─────────┐
         │              │ Get user │ │ catch   │
         │              └──┬───────┘ │ block   │
         │                 │         └────┬────┘
         │                 ▼              │
         │           ┌──────────┐         │
         │           │ User     │         │
         │           │ found?   │         │
         │           └──┬──┬────┘         │
         │              │  │              │
         │          ✅ Y │  │ ❌ N         │
         │              │  │              │
         │              │  └──────────┐   │
         │              │             │   │
         │              ▼             ▼   ▼
         │         ┌──────────┐  ┌────────────┐
         │         │Redirect  │  │ setStatus  │
         │         │to next   │  │("error")   │
         │         └──────────┘  └────────────┘
         │                             │
         └──────────┬──────────┬───────┘
                    │          │
       ┌────────────┘          └──────────┐
       │                                  │
       ▼                                  ▼
  ┌─────────────┐                 ┌────────────┐
  │"expired"    │                 │"error"     │
  │ Status      │                 │ Status     │
  ├─────────────┤                 ├────────────┤
  │ Title:      │                 │ Title:     │
  │ Link        │                 │ Sign-in    │
  │ Expired     │                 │ failed     │
  │             │                 │            │
  │ Buttons:    │                 │ Buttons:   │
  │ • Resend    │                 │ • Home     │
  │ • Home      │                 │ • Resend   │
  └─────────────┘                 └────────────┘
```

---

## Error Code Decision Tree

```
                    Hash params received
                           │
                           ▼
                   ┌──────────────────┐
                   │ parseAuthError() │
                   └────────┬─────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ✅ Error found      ❌ No error
                    │               │
                    ▼               ▼
            ┌───────────────┐   Continue to
            │ error_code =? │   session setup
            └───┬───────┬───┘   & exchange
                │       │
    ┌───────────┘       └──────────┐
    │                              │
    ▼                              ▼
┌─────────────────┐         ┌──────────────┐
│ otp_expired?    │         │ Other error? │
│ OR              │         │              │
│ access_denied?  │         │ (network,    │
│                 │         │  invalid_req,│
│ YES             │         │  etc.)       │
│ ↓               │         │ YES          │
│ isExpired=true  │         │ ↓            │
│ ↓               │         │ isExpired=   │
│ setStatus(      │         │   false      │
│  "expired"      │         │ ↓            │
│ )               │         │ setStatus(   │
│ ↓               │         │  "error"     │
│ Show:           │         │ )            │
│ "Link Expired"  │         │ ↓            │
│  UI             │         │ Show:        │
└─────────────────┘         │ Generic      │
                            │ error UI     │
                            └──────────────┘
```

---

## Timing Diagram

```
Valid Link (< 1 hour):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User clicks link
    ↓
Browser navigates to /auth/callback
    ↓ (50ms)
parseAuthError() → no error
    ↓ (10ms)
Continue to setSession()
    ↓ (500ms)
getUser()
    ↓ (100ms)
Check onboarding status
    ↓ (200ms)
Redirect to /onboarding
    ↓
✅ Total: ~1 second, user on onboarding


Expired Link (> 1 hour):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User clicks expired link
    ↓
Browser navigates to /auth/callback
    ↓ (50ms)
parseAuthError() → otp_expired detected
    ↓ (10ms)
setStatus("expired") → early return
    ↓ (100ms) 
Component re-renders with "Link Expired" UI
    ↓
✅ Total: ~300ms, user sees "Link Expired" (NOT hanging!)


Resend Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User clicks "Resend Email"
    ↓ (100ms)
Button shows "Sending..."
    ↓ (50ms)
POST /api/auth/send-confirmation
    ↓ (1500ms)
Server generates link, sends email
    ↓ (200ms)
Response received, show success
    ↓
3 second auto-redirect to home
    ↓
✅ Total: ~3 seconds, new email sent


Before Fix (Expired Link):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User clicks expired link
    ↓
Browser navigates to /auth/callback
    ↓ (50ms)
No error detection ❌
    ↓ (100ms)
Try exchangeCodeForSession(null) ❌
    ↓ (200ms)
Throws error → caught
    ↓ (100ms)
setStatus("error") [but also failSafeTimer running]
    ↓
failSafeTimer fires (12 seconds)
    ↓
Loops or hangs...
    ↓
❌ Total: 12+ seconds, user confused & stuck
```

---

## API Call Sequence

```
Happy Path (Valid Link):
────────────────────────

Browser                    /auth/callback              Supabase
  │                            │                          │
  ├─ Click link ─────────────→ (contains #tokens...)      │
  │                            │                          │
  │                            ├─ parseAuthError()        │
  │                            │  (no error)             │
  │                            │                          │
  │                            ├─ setSession(tokens) ────→ ✅
  │                            │                          │
  │                            │ ← {session}             │
  │                            │                          │
  │                            ├─ getUser() ────────────→ ✅
  │                            │                          │
  │                            │ ← {user}                │
  │                            │                          │
  │ ← redirect /onboarding ────┤                          │
  │                            │                          │
✅ Signed in on onboarding


Expired Link Path:
──────────────────

Browser                    /auth/callback              Supabase
  │                            │                          │
  ├─ Click link ─────────────→ (#error_code=otp_expired)  │
  │                            │                          │
  │                            ├─ parseAuthError()        │
  │                            │  (found error!) ✅       │
  │                            │                          │
  │                            ├─ setStatus("expired")    │
  │                            │ (no API call!)           │
  │                            │                          │
  │ ← show "Link Expired" ─────┤                          │
  │                            │                          │
  │ ← user clicks Resend ──────→                          │
  │                            ├─ POST /api/auth/send-confirmation
  │                            │                          │
  │                            │  ├─ generateLink() ─────→ ✅
  │                            │  │                       │
  │                            │  │ ← {action_link}      │
  │                            │  │                       │
  │                            │  └─ resend.emails.send() │
  │                            │                          │
  │ ← "Check your email" ──────┤                          │
  │                            │                          │
  │ ← user clicks new link ────→ (#new_tokens)           │
  │                            │                          │
  │                            ├─ setSession(tokens) ────→ ✅
  │                            │                          │
  │ ← redirect /onboarding ────┤                          │
  │                            │                          │
✅ Signed in on onboarding
```

---

This comprehensive diagram shows the complete flow before and after the fix.

