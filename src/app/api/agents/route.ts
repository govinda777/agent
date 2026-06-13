import { NextResponse } from 'next/server';
import { createAgentUseCase, getAgentsUseCase } from '@/modules/agents/di';
import { requireAuth } from '@/modules/auth/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { tenantId } = await requireAuth(request);

    const newAgent = await createAgentUseCase.execute({
      ...body,
      tenantId,
    });

    return NextResponse.json(
      { message: 'Agent created successfully', agent: { id: newAgent.id, name: newAgent.name } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating agent:', error);

    const err = error as Error;
    let status = 500;
    if (err.message === 'Name and Webhook URL are required') status = 400;
    if (err.message.includes('Limite de agentes atingido')) status = 403;

    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);

    const agents = await getAgentsUseCase.execute(tenantId);
    return NextResponse.json({ agents }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'NOT_PROVISIONED') {
      return NextResponse.json({ error: 'User is not provisioned', code: 'NOT_PROVISIONED' }, { status: 403 });
    }
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
