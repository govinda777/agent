import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';

const { Before, Given, When, Then } = createBdd();

Before(async ({ page }) => {
  page.on('console', (msg) => {
    console.log(`[BROWSER CONSOLE ${msg.type()}]:`, msg.text());
  });
  page.on('pageerror', (err) => {
    console.log('[BROWSER UNHANDLED EXCEPTION]:', err.message);
  });
});

const tenantId = 'd1b00000-0000-0000-0000-000000000000';

Given('existe o tenant correspondente no banco de dados com plano gratuito', async () => {
  // Ensure the user exists
  const user = await prisma.user.upsert({
    where: { privyId: 'did:privy:e2e-user' },
    update: {},
    create: {
      privyId: 'did:privy:e2e-user',
      email: 'e2e-test@govinda.com',
    },
  });

  // Ensure the tenant exists and is FREE
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      status: 'FREE',
    },
    create: {
      id: tenantId,
      status: 'FREE',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      executionsUsed: 0,
    },
  });

  // Link user and tenant
  await prisma.tenantUser.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenantId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenantId,
      role: 'OWNER',
    },
  });
});

Then('o banner de upgrade {string} deve estar visível', async ({ page }, text: string) => {
  await expect(page.locator('a', { hasText: text })).toBeVisible();
});

Then('o botão {string} na barra de navegação deve estar visível', async ({ page }, text: string) => {
  await expect(page.locator('header').locator('a', { hasText: text })).toBeVisible();
});

When('o usuário clica no botão {string}', async ({ page }, text: string) => {
  const element = page.locator('a, button', { hasText: text }).first();
  await element.click();
});

Then('o usuário deve ser redirecionado para a página {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(path));
});

When('o usuário inicia o processo de pagamento seguro', async ({ page }) => {
  // Intercept the /api/checkout call to return our mock success URL
  await page.route('**/api/checkout', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: '/checkout/success?session_id=mock-stripe-session-id-123',
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Intercept the /api/checkout/verify call to update the DB and return success
  await page.route('**/api/checkout/verify', async (route) => {
    if (route.request().method() === 'POST') {
      // Update tenant in database to ACTIVE
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'ACTIVE' },
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'ACTIVE',
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Click the checkout submission button
  const button = page.locator('button', { hasText: 'Assinar Plano Seguro' });
  await button.click();
});

Then('o usuário deve ser redirecionado para a página de sucesso', async ({ page }) => {
  await expect(page).toHaveURL(/\/checkout\/success/);
});

Then('o banner de upgrade {string} não deve mais estar visível', async ({ page }, text: string) => {
  // Wait for the redirect to complete back to /onboarding
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
  await expect(page.locator('a', { hasText: text })).not.toBeVisible();
});

Then('o botão {string} na barra de navegação não deve mais estar visível', async ({ page }, text: string) => {
  await expect(page.locator('header').locator('a', { hasText: text })).not.toBeVisible();
});
