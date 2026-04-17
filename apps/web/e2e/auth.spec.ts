import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page loads with form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, [data-slot="card-title"]')).toContainText(/iniciar sesión/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page.locator('[id$="-error"]').first()).toBeVisible();
  });

  test('register page loads with all fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2);
  });

  test('register form validates password requirements', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('#reg-password', 'weak');
    await page.fill('#reg-confirm', 'weak');
    await page.click('button[type="submit"]');
    await expect(page.locator('[id="reg-password-error"]')).toBeVisible();
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('navigation between auth pages works', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href*="/register"]');
    await expect(page).toHaveURL(/\/register/);
    await page.click('a[href*="/login"]');
    await expect(page).toHaveURL(/\/login/);
    await page.click('a[href*="/forgot-password"]');
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('unauthenticated access to /chat redirects to /login', async ({ page }) => {
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
  });

  test('i18n: English login page loads with cookie', async ({ page, context }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' }]);
    await page.goto('/login');
    await expect(page.locator('h1, [data-slot="card-title"]')).toContainText(/sign in/i);
  });
});
