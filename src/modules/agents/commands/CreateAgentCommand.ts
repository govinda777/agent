import { ICommand, ICommandHandler } from '@/lib/cqrs/types';
import { EventStore } from '@/lib/cqrs/EventStore';
import { crypto } from 'crypto';

export interface CreateAgentCommand extends ICommand {
  name: string;
  n8nWebhookUrl: string;
  n8nAuthToken: string;
  channels: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
}

export class CreateAgentCommandHandler implements ICommandHandler<CreateAgentCommand> {
  async execute(command: CreateAgentCommand): Promise<string> {
    const agentId = crypto.randomUUID();

    // Grava o evento na EventStore
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'AGENT',
      aggregateId: agentId,
      eventType: 'AgentCreated',
      payload: {
        name: command.name,
        n8nWebhookUrl: command.n8nWebhookUrl,
        n8nAuthToken: command.n8nAuthToken, // Em produção, criptografar antes de postar o evento ou no handler
        channels: command.channels,
        timestamp: new Date().toISOString()
      }
    });

    return agentId;
  }
}

export const createAgentCommandHandler = new CreateAgentCommandHandler();
