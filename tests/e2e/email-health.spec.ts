/**
 * Safe health checks — no secrets required.
 * Run: E2E_BASE_URL=https://www.getmixwise.com npx playwright test email-health
 */

import { test, expect } from "@playwright/test";
import { getBaseUrl } from "./helpers/email-env";

test.describe("Email system health (no secrets)", () => {
  test("weekly digest cron rejects unauthenticated requests in production", async ({
    request,
  }) => {
    const base = getBaseUrl();
    if (base.includes("localhost")) {
      test.skip();
      return;
    }

    const res = await request.get(`${base}/api/cron/weekly-digest`);
    // Production should require CRON_SECRET → 401
    expect([401, 403]).toContain(res.status());
  });

  test("send-welcome is not publicly callable without session", async ({
    request,
  }) => {
    const base = getBaseUrl();
    const res = await request.post(`${base}/api/auth/send-welcome`, {
      data: { displayName: "E2E" },
    });
    // After email PR: 401. Older deploys may return 400 (missing userId) — still not a successful send.
    expect([400, 401, 403]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(body.emailSent).not.toBe(true);
  });

  test("send-signup-notification is not publicly callable without session", async ({
    request,
  }) => {
    const base = getBaseUrl();
    const res = await request.post(`${base}/api/auth/send-signup-notification`, {});
    // After email PR: 401. Older deploys may error — must not return ok without auth.
    expect(res.status()).not.toBe(200);
  });

  test("email test endpoint is not open on production", async ({ request }) => {
    const base = getBaseUrl();
    if (base.includes("localhost")) {
      test.skip();
      return;
    }

    const res = await request.post(`${base}/api/email/test`, {
      data: { template: "confirmation", email: "test@example.com" },
    });
    const body = await res.json().catch(() => ({}));
    // After email PR: 401 without EMAIL_TEST_SECRET. Fails if anyone can send mail.
    if (res.status() === 200 && body.resendId) {
      throw new Error(
        "Production /api/email/test sent email without a secret — set EMAIL_TEST_SECRET (see .env.e2e.example)"
      );
    }
    expect([401, 403, 404, 500]).toContain(res.status());
  });
});
