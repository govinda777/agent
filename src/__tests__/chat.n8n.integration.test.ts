import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '@/app/api/agents/[agentId]/chat/route';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const LOCAL_ENC_KEY =
  process.env.ENCRYPTION_KEY || 'coloque_aqui_uma_chave_de_32_caracteres_aleatorios';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(LOCAL_ENC_KEY.slice(0, 32).padEnd(32, '0')),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

describe('Cenário: Conversar com o agente n8n ativo via integração', () => {
  const tenantId = 'integration-test-tenant';
  const agentId = 'integration-test-agent';
  const userId = 'integration-test-user';
  const privyId = 'did:privy:integration-test-user';

  beforeAll(async () => {
    // 1. Limpar registros anteriores de teste
    await prisma.agent.deleteMany({ where: { tenantId } });
    await prisma.tenantUser.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { privyId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });

    // 2. Criar Tenant de teste
    await prisma.tenant.create({
      data: {
        id: tenantId,
        status: 'FREE',
        trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias de trial ativo
        executionsUsed: 0,
      },
    });

    // 3. Criar Usuário de teste
    await prisma.user.create({
      data: {
        id: userId,
        privyId,
        tenants: {
          create: {
            tenantId,
            role: 'OWNER',
          },
        },
      },
    });

    // 4. Criar Agente apontando para o n8n local
    await prisma.agent.create({
      data: {
        id: agentId,
        name: 'Agente de Teste de Integração',
        n8nWebhookUrl: 'http://localhost:5678/webhook/1/webhook/agent-webhook',
        n8nAuthToken: encrypt(process.env.N8N_AUTH_TOKEN || 'meu_token_secreto_n8n'),
        channelWeb: true,
        channelWhatsapp: false,
        channelInstagram: false,
        tenantId,
      },
    });
  });

  afterAll(async () => {
    // Limpar banco ao finalizar
    await prisma.agent.deleteMany({ where: { tenantId } });
    await prisma.tenantUser.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { privyId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
  });

  describe('Dado que o usuário possui sessão ativa e um agente cadastrado', () => {
    describe('Quando ele envia uma mensagem na API de chat', () => {
      it('Então a mensagem é enviada ao webhook correto e a resposta do n8n é recebida via stream com sucesso', async () => {
        // Envia mensagem "Olá!"
        const request = new Request(`http://localhost/api/agents/${agentId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer mock-token-${userId}`, // Ativa o mock de Privy que mapeia para o userId
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Olá!' }],
          }),
        });

        // Executa a rota
        const response = await POST(request, {
          params: Promise.resolve({ agentId }),
        });

        expect(response.status).toBe(200);

        // Lê a resposta em stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
          }
        }

        // Verifica se a resposta foi obtida com sucesso e contém dados válidos
        expect(result).toContain('Olá!');

        // Verifica se o contador de execuções do tenant foi incrementado no banco
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
        });
        expect(tenant?.executionsUsed).toBe(1);
      });
    });
  });
});
