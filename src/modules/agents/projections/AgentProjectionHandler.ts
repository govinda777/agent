import { eventBus } from '@/lib/cqrs/EventBus';
import { agentRepository } from '../di';
import { IEvent } from '@/lib/cqrs/types';

/**
 * Atualiza o Read Model de Agentes.
 */
export const initAgentProjections = () => {

  eventBus.subscribe('AgentCreated', async (event: IEvent) => {
    const p = event.payload;
    const channels = p.channels as Record<string, boolean>;

    await agentRepository.save(event.tenantId, {
        id: event.aggregateId,
        name: p.name as string,
        n8nWebhookUrl: p.n8nWebhookUrl as string,
        n8nAuthToken: p.n8nAuthToken as string,
        channels: {
            web: channels.web ?? false,
            whatsapp: channels.whatsapp ?? false,
            instagram: channels.instagram ?? false,
        }
    });
  });

  eventBus.subscribe('AgentUpdated', async (event: IEvent) => {
    const p = event.payload;

    await agentRepository.update(event.aggregateId, event.tenantId, {
        name: p.name as string,
        n8nWebhookUrl: p.n8nWebhookUrl as string,
        n8nAuthToken: p.n8nAuthToken as string,
        channels: p.channels as any
    });
  });
};
