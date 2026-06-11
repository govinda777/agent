import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';
import crypto from 'crypto';

const { Given, When, Then } = createBdd();

const LOCAL_ENC_KEY = process.env.ENCRYPTION_KEY || 'coloque_aqui_uma_chave_de_32_caracteres_aleatorios';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

Given('que o usuário está autenticado no sistema', async ({ page, context }) => {
  // Set privy token cookie
  await context.addCookies([
    {
      name: 'privy-token',
      value: 'mock-token-e2e-user',
      domain: 'localhost',
      path: '/',
    },
  ]);
  
  // Initialize localStorage flags for usePrivy mock
  await page.addInitScript(() => {
    window.localStorage.setItem('playwright-mock-auth', 'true');
  });
});

Given('existe o agente padrão configurado no banco de dados', async () => {
  const tenantId = 'd1b00000-0000-0000-0000-000000000000';
  const agentName = 'Agente n8n Padrão';
  const webhookUrl = 'http://localhost:5678/webhook/1/webhook/agent-webhook';

  // Ensure Tenant exists
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      status: 'FREE',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      executionsUsed: 0,
    },
  });

  // Ensure Agent exists
  const agent = await prisma.agent.findFirst({
    where: { name: agentName, tenantId },
  });

  if (!agent) {
    await prisma.agent.create({
      data: {
        name: agentName,
        n8nWebhookUrl: webhookUrl,
        n8nAuthToken: encrypt(process.env.N8N_AUTH_TOKEN || 'meu_token_secreto_n8n'),
        channelWeb: true,
        channelWhatsapp: false,
        channelInstagram: false,
        tenantId,
      },
    });
  }
});

When('o usuário navega para a página {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('clica no botão {string} do agente {string}', async ({ page }, buttonText: string, agentName: string) => {
  const agentRow = page.locator('li', { hasText: agentName });
  await agentRow.getByRole('button', { name: buttonText }).click();
});

When('digita {string} no campo de mensagem', async ({ page }, message: string) => {
  const input = page.getByPlaceholder('Digite sua mensagem...');
  await input.fill(message);
});

When('clica no botão de enviar', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

Then('o chat deve renderizar a resposta do agente contendo {string}', async ({ page }, expectedText: string) => {
  // The bot response comes in via stream, so we use a longer timeout and locate the paragraph
  const messageText = page.locator('p', { hasText: expectedText });
  await expect(messageText.first()).toBeVisible({ timeout: 15000 });
});
