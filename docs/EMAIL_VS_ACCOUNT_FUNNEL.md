# Email list vs MixWise account

Two identities. Same person can have both. Do not treat them as one.

## External (what the person hears)

**List** — homepage / footer “join the list”  
You will get weekly cocktail emails. This is **not** an account. Saving a bar requires a separate, optional step.

**Account** — Sign Up, Mix “save your bar”, OAuth  
You can save a bar, favorites, and shopping list. Weekly digest is an account preference (`email_preferences.weekly_digest`).

**If an account holder later joins the list**  
Confirm the list only. Do not offer “create an account.”

## Internal (where we store them)

| Identity | Source of truth | Marketing mail | Transactional mail |
|---|---|---|---|
| List-only | `email_signups` | Resend General segment (`mixwise_list=true`, `mixwise_account=false`) | none |
| Account | `auth.users` + `profiles` + `email_preferences` | Thursday digest cron if `weekly_digest`; Resend broadcasts if still subscribed | magic link, password, account welcome |
| Both | both rows, same email | union of the above | account transactional |

Resend contact properties: `mixwise_list`, `mixwise_account`.  
Unsubscribing from the **list** deletes `email_signups` for that source. If they still have an account, do **not** mark the Resend contact unsubscribed.

## Path A — Email list

**Surfaces:** homepage capture, footer  
**API:** `POST /api/email/signup` (`source`: `homepage` | `footer`)

1. Row in `email_signups` (no Auth user)
2. Resend contact tagged `mixwise_list=true`
3. Notify `hello@getmixwise.com` — “New Email List Signup”
4. Confirmation email: Thursday drink + optional “set a password” CTA **only if they have no account**.

**Conversion (list-only):** email CTA → `/join?email&source&token`. They set a password. `POST /api/email/convert-to-account` creates a confirmed Auth user with that password, then the page signs them in and sends them to `/mix`. Google / Apple still work. Older one-click GET links still create a passwordless account and redirect through a magic link.

## Path B — Account creation

**Surfaces:** Navbar Sign Up, AuthDialog, Mix “Save your bar”  
**API:** `POST /api/auth/email-account` or OAuth / `POST /api/auth/signup`

1. Auth user + profile
2. `email_preferences` (defaults weekly digest on)
3. Notify `hello@getmixwise.com` — “New User Signup”
4. Magic link / confirmation — **not** the list welcome

Do not log Mix/auth signups as if they joined the public list. `email_signups` with `source=mix_save` is analytics only.
