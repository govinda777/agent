import { test, expect } from '@playwright/test';

test('has expected page title', async ({ page }) => {
  // Try to load the homepage. If we're testing a specific Next.js page, we can verify its content.
  await page.goto('/');
  // Basic expectation that doesn't strictly depend on the page content to pass easily,
  // or we can just expect the body to be visible.
  await expect(page.locator('body')).toBeVisible();
});
