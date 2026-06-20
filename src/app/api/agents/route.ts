import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAgentCommandHandler } from '@/modules/agents/commands/CreateAgentCommand';
import { initAgentProjections } from '@/modules/agents/projections/AgentProjectionHandler';
import { getPrismaWithRLS } from '@/lib/prisma';

// Inicializa o handler de projeção
initAgentProjections();

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Despacha Comando
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
