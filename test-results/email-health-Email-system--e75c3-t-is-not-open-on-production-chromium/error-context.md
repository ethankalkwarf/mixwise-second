# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: email-health.spec.ts >> Email system health (no secrets) >> email test endpoint is not open on production
- Location: tests/e2e/email-health.spec.ts:46:7

# Error details

```
Error: Production /api/email/test sent email without a secret — set EMAIL_TEST_SECRET (see .env.e2e.example)
```

# Test source

```ts
  1  | /**
  2  |  * Safe health checks — no secrets required.
  3  |  * Run: E2E_BASE_URL=https://www.getmixwise.com npx playwright test email-health
  4  |  */
  5  | 
  6  | import { test, expect } from "@playwright/test";
  7  | import { getBaseUrl } from "./helpers/email-env";
  8  | 
  9  | test.describe("Email system health (no secrets)", () => {
  10 |   test("weekly digest cron rejects unauthenticated requests in production", async ({
  11 |     request,
  12 |   }) => {
  13 |     const base = getBaseUrl();
  14 |     if (base.includes("localhost")) {
  15 |       test.skip();
  16 |       return;
  17 |     }
  18 | 
  19 |     const res = await request.get(`${base}/api/cron/weekly-digest`);
  20 |     // Production should require CRON_SECRET → 401
  21 |     expect([401, 403]).toContain(res.status());
  22 |   });
  23 | 
  24 |   test("send-welcome is not publicly callable without session", async ({
  25 |     request,
  26 |   }) => {
  27 |     const base = getBaseUrl();
  28 |     const res = await request.post(`${base}/api/auth/send-welcome`, {
  29 |       data: { displayName: "E2E" },
  30 |     });
  31 |     // After email PR: 401. Older deploys may return 400 (missing userId) — still not a successful send.
  32 |     expect([400, 401, 403]).toContain(res.status());
  33 |     const body = await res.json().catch(() => ({}));
  34 |     expect(body.emailSent).not.toBe(true);
  35 |   });
  36 | 
  37 |   test("send-signup-notification is not publicly callable without session", async ({
  38 |     request,
  39 |   }) => {
  40 |     const base = getBaseUrl();
  41 |     const res = await request.post(`${base}/api/auth/send-signup-notification`, {});
  42 |     // After email PR: 401. Older deploys may error — must not return ok without auth.
  43 |     expect(res.status()).not.toBe(200);
  44 |   });
  45 | 
  46 |   test("email test endpoint is not open on production", async ({ request }) => {
  47 |     const base = getBaseUrl();
  48 |     if (base.includes("localhost")) {
  49 |       test.skip();
  50 |       return;
  51 |     }
  52 | 
  53 |     const res = await request.post(`${base}/api/email/test`, {
  54 |       data: { template: "confirmation", email: "test@example.com" },
  55 |     });
  56 |     const body = await res.json().catch(() => ({}));
  57 |     // After email PR: 401 without EMAIL_TEST_SECRET. Fails if anyone can send mail.
  58 |     if (res.status() === 200 && body.resendId) {
> 59 |       throw new Error(
     |             ^ Error: Production /api/email/test sent email without a secret — set EMAIL_TEST_SECRET (see .env.e2e.example)
  60 |         "Production /api/email/test sent email without a secret — set EMAIL_TEST_SECRET (see .env.e2e.example)"
  61 |       );
  62 |     }
  63 |     expect([401, 403, 404, 500]).toContain(res.status());
  64 |   });
  65 | });
  66 | 
```