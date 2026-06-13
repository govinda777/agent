import { createTextStreamResponse } from 'ai';
import { processAgentChatUseCase } from '@/modules/agents/di';
import { requireAuth } from '@/modules/auth/server';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    // Obtém a autenticação e o tenantId de forma segura via token do usuário antes de iniciar o stream
    const { tenantId, userId, privyId } = await requireAuth(request);

    // O Vercel AI SDK envia as mensagens no array 'messages'
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1];
    let lastUserMessage = '';

    if (lastMessage) {
      if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        lastUserMessage = lastMessage.parts
          .filter((part: { type: string; text?: string }) => part.type === 'text')
          .map((part: { type: string; text?: string }) => part.text || '')
          .join('');
      } else {
        lastUserMessage = lastMessage.content || '';
      }
    }

    if (!lastUserMessage) {
      lastUserMessage = body.message || '';
    }

    const textStream = new ReadableStream<string>({
      async start(controller) {
        try {
          const result = await processAgentChatUseCase.execute({
            agentId,
            tenantId,
            userId,
            privyId,
            payload: {
              ...body,
              message: lastUserMessage,
              channel: body.channel || 'web',
            },
          });

          // O n8n retorna `{ response: "..." }` conforme configurado no workflow padrão
          const textResponse =
            result.response || result.output || result.text || JSON.stringify(result);

          // Envia o texto da resposta completo imediatamente para otimizar o tempo de execução no Vercel (limite de 10s no plano Free)
          controller.enqueue(textResponse);
        } catch (error: unknown) {
          console.error('Error in stream processing:', error);

          let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
          const err = error as Error;
          if (err.message === 'TRIAL_EXPIRED' || err.message === 'QUOTA_EXCEEDED') {
            errorMessage =
              'O assistente encontra-se temporariamente indisponível devido aos limites do plano. Por favor, contacte o administrador.';
          } else if (err.message === 'Agent not found') {
            errorMessage = 'Agente não encontrado.';
          } else if (err.message.includes('Status: 404')) {
            errorMessage =
              'Erro 404: O n8n retornou que a URL do Webhook não existe. Por favor, verifique se a URL do Webhook está correta e se o fluxo do n8n está Ativado (Active) no painel do n8n.';
          } else if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
            errorMessage =
              'Erro de Conexão: Não foi possível conectar ao servidor n8n. Por favor, verifique se o serviço n8n está rodando localmente (execute `docker-compose up` no terminal).';
          }

          controller.enqueue(errorMessage);
        } finally {
          controller.close();
        }
      },
    });

    return createTextStreamResponse({ textStream });
  } catch (error: unknown) {
    console.error('Error initializing chat stream:', error);
    const err = error as Error;
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: err.message === 'Unauthorized' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
