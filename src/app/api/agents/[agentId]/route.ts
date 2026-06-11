import { NextResponse } from 'next/server';
import { agentRepository, updateAgentUseCase } from '@/modules/agents/di';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { tenantId } = await requireAuth(request);

    // Verify agent belongs to this tenant
    const agentCheck = await agentRepository.findById(agentId, tenantId);
    if (!agentCheck) {
      return NextResponse.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    // Retrieve decrypted details for the edit form
    const agent = await agentRepository.getDecryptedById(agentId);
    
    return NextResponse.json({ agent }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
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

    // Verify agent belongs to this tenant
    const agentCheck = await agentRepository.findById(agentId, tenantId);
    if (!agentCheck) {
      return NextResponse.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    // Update agent properties
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
    console.error('Error updating agent:', error);
    
    let status = 500;
    if (error.message.includes('cannot be empty')) status = 400;

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
