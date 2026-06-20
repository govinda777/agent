import { NextResponse } from 'next/server';
import { agentRepository, updateAgentUseCase } from '@/modules/agents/di';
import { requireAuth } from '@/modules/auth/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { tenantId } = await requireAuth(request);

    // O RLS via requireAuth (db) garante o isolamento.
    // O agentRepository agora também utiliza RLS internamente.
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

    const updatedAgent = await updateAgentUseCase.execute({
      id: agentId,
      tenantId,
      ...body
    });

    return NextResponse.json(
      { message: 'Agente atualizado com sucesso', agent: updatedAgent },
      { status: 200 }
    );
  } catch (error: any) {
    let status = 500;
    if (error.message.includes('cannot be empty')) status = 400;

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
