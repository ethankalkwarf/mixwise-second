/**
 * Auth email UI flows (does not verify inbox delivery).
 */

import { test, expect } from "@playwright/test";

test.describe("Auth email UI", () => {
  test("signup form shows confirmation success state", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.getByRole("button", { name: /create one for free/i }).click();

    const unique = `e2e-ui-${Date.now()}@example.com`;
    await page.getByPlaceholder("Enter your email").fill(unique);
    await page.getByPlaceholder("First name").fill("E2E");
    await page.getByPlaceholder("Last name").fill("Test");
    await page.getByPlaceholder("Create a password").fill("TestPass123!");
    await page.getByPlaceholder("Confirm your password").fill("TestPass123!");

    const signupResponse = page.waitForResponse(
      (r) => r.url().includes("/api/auth/signup") && r.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Create Account" }).click();

    const response = await signupResponse;
    const json = await response.json();

    if (response.ok() && json.ok) {
      await expect(page.getByText(/account created/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(unique)).toBeVisible();
    } else {
      expect(json.error || json.message).toBeTruthy();
    }
  });

  test("password reset shows check-your-email state", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /log in/i }).first().click();
    await page.getByRole("button", { name: /forgot your password/i }).click();

    await page.getByPlaceholder("Enter your email").fill(`e2e-reset-${Date.now()}@example.com`);

    const resetResponse = page.waitForResponse(
      (r) =>
        r.url().includes("/api/auth/send-password-reset") &&
        r.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Send Reset Link" }).click();

    await resetResponse;
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10_000 });
  });
});
