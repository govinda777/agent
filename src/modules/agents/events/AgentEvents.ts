import { IEvent } from '@/lib/cqrs/types';

export const AGENT_CREATED = 'AgentCreated';
export const AGENT_UPDATED = 'AgentUpdated';
export const AGENT_CHAT_STARTED = 'AgentChatStarted';
export const AGENT_CHAT_COMPLETED = 'AgentChatCompleted';

export interface AgentCreatedEvent extends IEvent {
  eventType: typeof AGENT_CREATED;
  payload: {
    name: string;
    n8nWebhookUrl: string;
    n8nAuthToken: string;
    channels: {
      web: boolean;
      whatsapp: boolean;
      instagram: boolean;
    };
  };
}
