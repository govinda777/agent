import { NextResponse } from 'next/server';
import { tokenVerifier } from '@/modules/auth/di';
import { userRepository } from '@/modules/users/di';
import { EventStore } from '@/lib/cqrs/EventStore';
import { createSession } from '@/lib/session';
import { createTenantHandler } from '@/modules/tenants/di';
import { CreateTenantCommand } from '@/modules/tenants/commands/CreateTenantCommand';
import { createAgentCommandHandler } from '@/modules/agents/commands/CreateAgentCommand';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    // 1. Validar o token Privy
    const privyId = await tokenVerifier.verifyToken(accessToken);

    // 2. Garantir que o usuário existe na DB global via Repository
    let user = await userRepository.findByPrivyId(privyId);

    if (!user) {
      user = await userRepository.create(privyId);
    }

    // 3. Provisionar Tenant se o usuário não tiver nenhum
    let tenantId = user.tenants[0]?.tenantId || '';
    let tenantsList = user.tenants.map(t => t.tenantId);

    if (!tenantId) {
      tenantId = crypto.randomUUID();
      tenantsList = [tenantId];

      // Executa o comando de criação do Tenant
      await createTenantHandler.execute(new CreateTenantCommand(
        tenantId,
        user.id,
        privyId
      ));

      // Criação do Agente de Teste (Trial Agent)
      await createAgentCommandHandler.execute({
        tenantId,
        name: 'Agente Trial',
        n8nWebhookUrl: 'https://n8n.example.com/webhook-trial',
        n8nAuthToken: 'trial-token',
        channels: {
          web: true,
          whatsapp: false,
          instagram: false
        }
      });
    }

    // 4. Registrar Evento de Login
    await EventStore.append({
      tenantId: tenantId || 'GLOBAL',
      aggregateType: 'USER',
      aggregateId: user.id,
      eventType: 'UserLoggedIn',
      payload: {
        userId: user.id,
        privyId: privyId,
        timestamp: new Date().toISOString()
      }
    });

    // 5. Criar Sessão JWE
    await createSession({
      privyToken: accessToken,
      tenantId,
      userId: user.id,
      privyId,
      tenants: tenantsList
    });

    return NextResponse.json({ success: true, userId: user.id, tenantId });
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}
