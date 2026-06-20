import { ICommand, ICommandHandler } from '@/lib/cqrs/types';
import { EventStore } from '@/lib/cqrs/EventStore';
import * as nodeCrypto from 'crypto';

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
    // VALIDAÇÃO DE DOMÍNIO 2026
    if (!command.name || command.name.length < 3) {
      throw new Error('O nome do agente deve ter pelo menos 3 caracteres.');
    }

    if (!command.n8nWebhookUrl.startsWith('https://')) {
      throw new Error('A URL do webhook deve ser segura (HTTPS).');
    }

    const agentId = nodeCrypto.randomUUID();

    // Grava o evento na EventStore
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'AGENT',
      aggregateId: agentId,
      eventType: 'AgentCreated',
      payload: {
        name: command.name,
        n8nWebhookUrl: command.n8nWebhookUrl,
        n8nAuthToken: command.n8nAuthToken,
        channels: command.channels,
        timestamp: new Date().toISOString()
      }
    });

    return agentId;
  }
}

export const createAgentCommandHandler = new CreateAgentCommandHandler();
