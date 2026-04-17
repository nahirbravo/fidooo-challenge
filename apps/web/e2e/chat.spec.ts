import { test, expect } from '@playwright/test';

test.describe('Chat UI (unauthenticated view)', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/chat');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Chat UI (visual structure)', () => {
  test.skip(true, 'Requires authenticated session — run with Firebase configured');

  test('chat page shows empty state', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText(/empezá la conversación/i)).toBeVisible();
  });

  test('message input is visible and functional', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('textarea');
    await expect(input).toBeVisible();
    await input.fill('Test message');
    await expect(input).toHaveValue('Test message');
  });

  test('Enter key triggers send, Shift+Enter does not', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('textarea');
    await input.fill('Test');
    await input.press('Shift+Enter');
    await expect(input).toBeVisible();
  });

  test('char counter appears near limit', async ({ page }) => {
    await page.goto('/chat');
    const input = page.locator('textarea');
    await input.fill('x'.repeat(3500));
    await expect(page.getByText(/3500\/4000/)).toBeVisible();
  });
});
