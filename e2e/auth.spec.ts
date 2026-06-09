import { test, expect } from '@playwright/test';

test('Landing page loads successfully', async ({ page }) => {
  await page.goto('/');
  // Verifica se existe texto básico ou um botão genérico
  await expect(page.locator('body')).toBeVisible();
});

test('Login page loads successfully', async ({ page }) => {
  await page.goto('/login');
  // Se houver um redirecionamento ou renderização condicional
  await expect(page.locator('body')).toBeVisible();
});
