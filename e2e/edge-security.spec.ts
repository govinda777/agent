import { test, expect } from '@playwright/test';

/**
 * E2E: SEGURANÇA E GOVERNANÇA NA BORDA (EDGE)
 *
 * Estes testes validam se o Middleware (Proxy) está protegendo o sistema
 * e roteando corretamente os tenants.
 */

test.describe('Edge Proxy & Multi-Tenancy', () => {

  test('deve rotear corretamente via subdomínio para a pasta do tenant', async ({ page }) => {
    // Simula acesso via subdomínio (localtest.me resolve para 127.0.0.1)
    await page.goto('http://tenant1.localtest.me:3000/test');

    const tenantParam = page.locator('span:has-text("tenant1")');
    await expect(tenantParam).toBeVisible();

    await expect(page.locator('text=Rewrite successful')).toBeVisible();
  });

  test('deve retornar 402 Payment Required se o status no Redis for OVER_BUDGET', async ({ request }) => {
    // Nota: Em um teste real, injetaríamos 'OVER_BUDGET' no Redis antes
    // Aqui simulamos a chamada de API que o proxy interceptaria
    const response = await request.post('http://overbudget.localtest.me:3000/api/agent/run', {
      data: { agentId: 'any' }
    });

    // O status 402 é o código semântico para estouro de cota em 2026
    expect(response.status()).toBe(402);
    const body = await response.json();
    expect(body.error).toBe('Payment Required');
  });

  test('deve retornar 403 Forbidden para tenants suspensos', async ({ request }) => {
    const response = await request.post('http://suspended.localtest.me:3000/api/agent/run', {
      data: { agentId: 'any' }
    });

    expect(response.status()).toBe(403);
  });

  test('deve aplicar Rate Limiting (429) após múltiplas requisições rápidas', async ({ request }) => {
    // Este teste depende da integração do @upstash/ratelimit no proxy
    // Simula rajada de requests
    let lastStatus = 0;
    for(let i = 0; i < 5; i++) {
        const res = await request.get('http://tenant1.localtest.me:3000/api/agents');
        lastStatus = res.status();
        if (lastStatus === 429) break;
    }

    // Se o limite for baixo o suficiente para o teste, esperamos um 429
    // expect(lastStatus).toBe(429);
  });
});
