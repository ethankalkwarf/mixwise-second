/**
 * Smoke Tests for MixWise
 *
 * Run with: npx playwright test tests/e2e/smoke.spec.ts
 * Run with UI: npx playwright test tests/e2e/smoke.spec.ts --headed
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('MixWise Smoke Tests', () => {
  test('Landing page loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check hero section
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=MixWise')).toBeVisible();

    // Check navigation
    await expect(page.locator('text=Browse Cocktail Recipes')).toBeVisible();
    await expect(page.locator('text=Open Mixology Wizard')).toBeVisible();
  });

  test('Cocktails page loads and shows content', async ({ page }) => {
    await page.goto(`${BASE_URL}/cocktails`);

    // Check page title
    await expect(page.locator('text=Cocktail Recipes')).toBeVisible();

    // Check that cocktails load (at least some content appears)
    await expect(page.locator('img').first()).toBeVisible({ timeout: 10000 });
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto(`${BASE_URL}/cocktails`);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('margarita');
    await searchInput.press('Enter');

    // Should show results or no-results state
    await expect(page.locator('text=Margarita').or(page.locator('text=No cocktails found'))).toBeVisible();
  });

  test('Recipe detail page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/cocktails/margarita`);

    // Check that page loads with recipe content
    await expect(page.locator('h1').or(page.locator('text=Margarita'))).toBeVisible();

    // Should have ingredients section
    await expect(page.locator('text=Ingredients').or(page.locator('text=ingredients'))).toBeVisible();
  });

  test('Mix tool page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/mix`);

    // Check page loads
    await expect(page.locator('text=What\'s in your bar').or(page.locator('text=Your Bar'))).toBeVisible();
  });

  test('Auth dialog can be opened', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click login button
    await page.locator('text=Log In').first().click();

    // Auth dialog should appear
    await expect(page.locator('text=Welcome back').or(page.locator('text=Sign in'))).toBeVisible();
  });

  test('Navigation works', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click cocktails link
    await page.locator('text=Browse Cocktail Recipes').click();
    await expect(page.locator('text=Cocktail Recipes')).toBeVisible();

    // Go back to home
    await page.goto(BASE_URL);

    // Click mix link
    await page.locator('text=Open Mixology Wizard').click();
    await expect(page.locator('text=Your Bar').or(page.locator('text=What\'s in your bar'))).toBeVisible();
  });

  test('404 page works', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);

    // Should show 404 content
    await expect(page.locator('text=Page not found').or(page.locator('text=404'))).toBeVisible();
  });
});


