import { NextResponse } from 'next/server';
import { PrismaAgentRepository } from '@/modules/agents/infrastructure/PrismaAgentRepository';
import { ProcessAgentChatUseCase } from '@/modules/agents/useCases/ProcessAgentChatUseCase';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

// Dependency Injection
const repository = new PrismaAgentRepository();
const processAgentChatUseCase = new ProcessAgentChatUseCase(repository);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    // Obtém a autenticação e o tenantId de forma segura via token do usuário
    const { tenantId, userId, privyId } = await requireAuth(request);

    const result = await processAgentChatUseCase.execute({
      agentId,
      tenantId,
      userId,
      privyId,
      payload: body,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error proxying chat to n8n:', error);
    
    // Tratamento de Erros de Quota / Paywall
    if (error.message === 'TRIAL_EXPIRED' || error.message === 'QUOTA_EXCEEDED') {
      // Devolve um 200 com mensagem amigável para o visitante no chat
      return NextResponse.json(
        { response: 'O assistente encontra-se temporariamente indisponível devido aos limites do plano. Por favor, contacte o administrador.' },
        { status: 200 } // Não lançamos 402 para o widget para evitar erros no frontend do visitante, mostramos apenas a mensagem
      );
    }

    let status = 500;
    if (error.message === 'Agent not found') status = 404;
    else if (error.message.includes('not configured')) status = 400;
    else if (error.message.includes('Error communicating')) status = 502;

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
