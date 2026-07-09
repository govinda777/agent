import { eventBus } from '@/lib/cqrs/EventBus';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from '@/lib/cqrs/types';

/**
 * Atualiza o Read Model de Agentes.
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

  eventBus.subscribe('AgentUpdated', async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const p = event.payload;

    const updateData: any = {};
    if (p.name !== undefined) updateData.name = p.name;
    if (p.n8nWebhookUrl !== undefined) updateData.n8nWebhookUrl = p.n8nWebhookUrl;
    if (p.n8nAuthToken !== undefined) updateData.n8nAuthToken = p.n8nAuthToken;

    if (p.channels !== undefined) {
      const channels = p.channels as Record<string, boolean>;
      if (channels.web !== undefined) updateData.channelWeb = channels.web;
      if (channels.whatsapp !== undefined) updateData.channelWhatsapp = channels.whatsapp;
      if (channels.instagram !== undefined) updateData.channelInstagram = channels.instagram;
    }

    await db.agent.update({
      where: { id: event.aggregateId },
      data: updateData
    });
  });
};
