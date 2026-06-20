import { eventBus } from '@/lib/cqrs/EventBus';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from '@/lib/cqrs/types';

/**
 * Atualiza o Read Model de Agentes (Tabela Agent clássica).
 */
export const initAgentProjections = () => {

  eventBus.subscribe('AgentCreated', async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const p = event.payload;

    const channels = p.channels as Record<string, boolean>;

    await db.agent.create({
      data: {
        id: event.aggregateId,
        tenantId: event.tenantId,
        name: p.name as string,
        n8nWebhookUrl: p.n8nWebhookUrl as string,
        n8nAuthToken: p.n8nAuthToken as string,
        channelWeb: channels.web ?? false,
        channelWhatsapp: channels.whatsapp ?? false,
        channelInstagram: channels.instagram ?? false,
      }
    });
  });
};
