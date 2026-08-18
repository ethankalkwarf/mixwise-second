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
    expect([401, 403]).toContain(res.status());
  });

  test("friday and lifecycle crons reject unauthenticated requests in production", async ({
    request,
  }) => {
    const base = getBaseUrl();
    if (base.includes("localhost")) {
      test.skip();
      return;
    }

    const friday = await request.get(`${base}/api/cron/friday-personalized`);
    const lifecycle = await request.get(`${base}/api/cron/email-lifecycle`);
    expect([401, 403]).toContain(friday.status());
    expect([401, 403]).toContain(lifecycle.status());
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

  test("email image proxy returns jpeg for catalog webp", async ({
    request,
  }) => {
    const base = getBaseUrl();
    const source =
      "https://ehexkpoxir62prtp.public.blob.vercel-storage.com/catalog/cocktails/daiquiri.webp";
    const res = await request.get(
      `${base}/api/email-image?url=${encodeURIComponent(source)}&w=640&q=75`
    );
    if (base.includes("localhost") && (res.status() === 404 || res.status() === 500)) {
      test.skip();
      return;
    }
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/jpeg");
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(1000);
    expect(body[0]).toBe(0xff);
    expect(body[1]).toBe(0xd8);
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
