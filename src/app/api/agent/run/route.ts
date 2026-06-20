import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { executeAgentCommandHandler } from '@/modules/agents/commands/ExecuteAgentCommand';

/**
 * API ROUTE 2026: EVENT-DRIVEN (ASYNC)
 *
 * O processamento pesado e side-effects são delegados para o Durable Bus.
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    const userId = headersList.get('x-user-id') || 'system';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Tenant ID is required.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Despacha o Comando de Escrita
    const executionId = await executeAgentCommandHandler.execute({
      tenantId,
      agentId: body.agentId,
      userId,
      payload: body.payload
    });

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
