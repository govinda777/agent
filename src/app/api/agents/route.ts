import { NextResponse } from 'next/server';
import { PrismaAgentRepository } from '@/modules/agents/infrastructure/PrismaAgentRepository';
import { CreateAgentUseCase } from '@/modules/agents/useCases/CreateAgentUseCase';
import { GetAgentsUseCase } from '@/modules/agents/useCases/GetAgentsUseCase';
import { requireAuth } from '@/lib/auth';

// Dependency Injection
const repository = new PrismaAgentRepository();
const createAgentUseCase = new CreateAgentUseCase(repository);
const getAgentsUseCase = new GetAgentsUseCase(repository);

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
  } catch (error: any) {
    console.error('Error creating agent:', error);
    
    let status = 500;
    if (error.message === 'Name and Webhook URL are required') status = 400;
    if (error.message.includes('Limite de agentes atingido')) status = 403;

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { tenantId } = await requireAuth(request);
    
    const agents = await getAgentsUseCase.execute(tenantId);
    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
