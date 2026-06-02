/**
 * Live email delivery tests — requires secrets.
 *
 * Copy .env.e2e.example → .env.e2e and fill values, then:
 *   export $(grep -v '^#' .env.e2e | xargs) && E2E_LIVE_EMAIL_TESTS=1 npx playwright test email-live
 *
 * @live
 */

import { test, expect } from "@playwright/test";
import {
  getBaseUrl,
  hasLiveEmailConfig,
  hasCronSecret,
  uniqueTestEmail,
  waitForResendDelivery,
} from "./helpers/email-env";

test.describe("Live email delivery @live", () => {
  test.beforeEach(() => {
    test.skip(!hasLiveEmailConfig(), "Set E2E_LIVE_EMAIL_TESTS=1, RESEND_API_KEY, E2E_TEST_INBOX");
  });

  test("signup sends confirmation via Resend", async ({ request }) => {
    const email = uniqueTestEmail();
    const password = "E2eTestPass123!";

    const res = await request.post(`${getBaseUrl()}/api/auth/signup`, {
      data: {
        firstName: "E2E",
        lastName: "Playwright",
        email,
        password,
      },
    });

    const body = await res.json();
    expect(res.ok(), JSON.stringify(body)).toBeTruthy();
    expect(body.emailSent).toBe(true);

    const delivery = await waitForResendDelivery({
      to: email,
      subjectIncludes: "Confirm",
    });
    expect(delivery.found, "Confirmation email not found in Resend dashboard API").toBe(true);
  });

  test("resend confirmation sends email", async ({ request }) => {
    const email = process.env.E2E_TEST_INBOX!;
    const res = await request.post(`${getBaseUrl()}/api/auth/send-confirmation`, {
      data: { email },
    });
    expect(res.ok()).toBeTruthy();

    const delivery = await waitForResendDelivery({
      to: email,
      subjectIncludes: "Confirm",
    });
    expect(delivery.found).toBe(true);
  });

  test("password reset sends email for existing user", async ({ request }) => {
    const email = process.env.E2E_TEST_INBOX!;
    const res = await request.post(`${getBaseUrl()}/api/auth/send-password-reset`, {
      data: { email },
    });
    expect(res.ok()).toBeTruthy();

    const delivery = await waitForResendDelivery({
      to: email,
      subjectIncludes: "Password",
    });
    expect(delivery.found).toBe(true);
  });

  test("weekly digest cron sends when authorized", async ({ request }) => {
    test.skip(!hasCronSecret(), "CRON_SECRET required");

    const res = await request.get(`${getBaseUrl()}/api/cron/weekly-digest`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const body = await res.json();
    expect(res.ok(), JSON.stringify(body)).toBeTruthy();
    expect(body.success).toBe(true);
    expect(typeof body.sent).toBe("number");
  });
});
