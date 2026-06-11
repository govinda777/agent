import { createTextStreamResponse } from 'ai';
import { processAgentChatUseCase } from '@/modules/agents/di';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
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
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
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
              channel: body.channel || 'web'
            },
          });

          // O n8n retorna `{ response: "..." }` conforme configurado no workflow padrão
          const textResponse = result.response || result.output || result.text || JSON.stringify(result);

          // Simula o efeito de digitação enviando palavra por palavra
          const words = textResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const suffix = i === words.length - 1 ? '' : ' ';
            
            // Envia o fragmento de texto puro
            controller.enqueue(word + suffix);
            
            // 30ms de delay por palavra gera um efeito visual excelente e fluido
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
        } catch (error: any) {
          console.error('Error in stream processing:', error);
          
          let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
          if (error.message === 'TRIAL_EXPIRED' || error.message === 'QUOTA_EXCEEDED') {
            errorMessage = 'O assistente encontra-se temporariamente indisponível devido aos limites do plano. Por favor, contacte o administrador.';
          } else if (error.message === 'Agent not found') {
            errorMessage = 'Agente não encontrado.';
          }
          
          controller.enqueue(errorMessage);
        } finally {
          controller.close();
        }
      }
    });

    return createTextStreamResponse({ textStream });
  } catch (error: any) {
    console.error('Error initializing chat stream:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
