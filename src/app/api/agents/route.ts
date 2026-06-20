import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAgentCommandHandler } from '@/modules/agents/commands/CreateAgentCommand';
import { getPrismaWithRLS } from '@/lib/prisma';

/**
 * AGENTS API: PURE COMMAND FLOW
 *
 * Sem inicializações de projeção (movidas para o Webhook Worker).
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Despacha Comando (Gera evento na EventStore -> QStash)
    const agentId = await createAgentCommandHandler.execute({
      tenantId,
      ...body
    });

    return NextResponse.json({ success: true, agentId }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getPrismaWithRLS(tenantId);
    const agents = await db.agent.findMany();

    return NextResponse.json(agents);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
