import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { executeAgentCommandHandler } from '@/modules/agents/commands/ExecuteAgentCommand';
import { initExecutionProjections } from '@/modules/agents/projections/ExecutionProjectionHandler';
import { initQuotaEvents } from '@/modules/agents/projections/QuotaEventHandler';

// Inicializa os handlers (Em produção, isso seria feito em um local centralizado)
initExecutionProjections();
initQuotaEvents();

/**
 * API ROUTE 2026: EVENT-DRIVEN & CQRS
 *
 * Este endpoint não executa o agente diretamente; ele posta um comando
 * que gera um evento imutável na EventStore.
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    const userId = headersList.get('x-user-id') || 'system'; // Em produção, viria do JWT validado

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Tenant ID is required.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 1. Despacha o Comando de Escrita
    const executionId = await executeAgentCommandHandler.execute({
      tenantId,
      agentId: body.agentId,
      userId,
      payload: body.payload
    });

    // 2. Retorna o ID da execução imediatamente
    // O progresso pode ser acompanhado via Query na ExecutionProjection
    return NextResponse.json({
      success: true,
      executionId,
      status: 'PENDING',
      links: {
        status: `/api/agent/execution/${executionId}`
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', message },
      { status: 500 }
    );
  }
}
