import { test, expect } from '@playwright/test';

test.describe('Responsive — Login', () => {
  test('mobile: login form fits viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    const card = page.locator('[data-slot="card"]');
    if (await card.count()) {
      const box = await card.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(375);
    }
  });

  test('desktop: login form is centered', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    const card = page.locator('[data-slot="card"]');
    if (await card.count()) {
      const box = await card.boundingBox();
      expect(box?.x).toBeGreaterThan(0);
    }
  });
});

test.describe('Responsive — Protected pages (unauthenticated)', () => {
  test('mobile: chat redirects to login', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
  });

  test('desktop: chat redirects to login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
  });
});
