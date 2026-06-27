import { NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/session';
import { createTenantHandler } from '@/modules/tenants/di';
import { CreateTenantCommand } from '@/modules/tenants/commands/CreateTenantCommand';
import { createAgentCommandHandler } from '@/modules/agents/commands/CreateAgentCommand';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { userId, privyId, tenants } = session;
  let { tenantId } = session;

  // 1. Se o usuário não tem tenantId, provisionamos um novo
  if (!tenantId) {
    tenantId = crypto.randomUUID();

    // Executa o comando de criação do Tenant
    await createTenantHandler.execute(new CreateTenantCommand(
      tenantId,
      userId,
      privyId
    ));

    // 2. Criação do Agente de Teste
    await createAgentCommandHandler.execute({
      tenantId,
      name: 'Agente de Boas-vindas',
      n8nWebhookUrl: 'https://n8n.example.com/webhook-test',
      n8nAuthToken: 'test-token',
      channels: {
        web: true,
        whatsapp: false,
        instagram: false
      }
    });

    // 3. Atualiza o Cookie de Sessão com o novo tenantId
    await createSession({
      ...session,
      tenantId,
      tenants: [...tenants, tenantId]
    });
  }

  // Redireciona para a dashboard do tenant
  return NextResponse.redirect(new URL(`/${tenantId}/agents`, request.url));
}
