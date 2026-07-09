import { NextResponse } from 'next/server';
import { agentRepository } from '@/modules/agents/di';
import { updateAgentCommandHandler } from '@/modules/agents/commands/UpdateAgentCommand';
import { requireAuth } from '@/modules/auth/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { tenantId } = await requireAuth(request);

    const agent = await agentRepository.findById(agentId, tenantId);

    if (!agent) {
      return NextResponse.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ agent }, { status: 200 });
  } catch (_error: unknown) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { tenantId } = await requireAuth(request);
    const body = await request.json();

    // Use Command-based architecture
    await updateAgentCommandHandler.execute({
      id: agentId,
      tenantId,
      ...body
    });

    return NextResponse.json(
      { message: 'Solicitação de atualização processada com sucesso' },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
