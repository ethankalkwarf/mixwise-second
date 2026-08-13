# Email list vs account creation

Two separate intents. Do not blur them in UI copy or follow-up email.

## Path A — Email list (low commitment)

**Surfaces:** homepage mid-page capture, footer subscribe  
**API:** `POST /api/email/signup` (`source`: `homepage` | `footer`)  
**What happens:**
1. Row in `email_signups` (no Auth user)
2. Notify `hello@getmixwise.com` — “New Email List Signup”
3. Resend: “You’re on the MixWise list” + CTA **Create free account & save your bar**

**Conversion:** CTA hits `GET /api/email/convert-to-account?email&source&token`  
→ creates passwordless account → redirects through magic link → user lands on `/mix` → `SetPasswordPrompt` if `needs_password`

## Path B — Account creation (high intent)

**Surfaces:** Navbar Sign Up, AuthDialog, Mix “Save your bar”  
**API:** `POST /api/auth/email-account` (`source`: `mix_save` | `auth_dialog`) or OAuth / password signup  
**What happens:**
1. Auth user + profile created (passwordless email path sets `needs_password: true`)
2. Also logged in `email_signups` for analytics when using Mix email path
3. Notify `hello@getmixwise.com` — “New User Signup”
4. Resend: “Your MixWise account is ready” magic link
5. After login: soft prompt to **add a password**

Password signup via AuthDialog still uses `POST /api/auth/signup` (confirm email flow).

## Goal

Email list → account (password + saved bar) via the nurture CTA.  
Account path already lands them in Mix with bar sync.
