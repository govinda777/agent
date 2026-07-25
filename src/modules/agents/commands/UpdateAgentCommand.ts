import { ICommand, ICommandHandler } from '@/lib/cqrs/types';
import { EventStore } from '@/lib/cqrs/EventStore';

export interface UpdateAgentCommand extends ICommand {
  id: string;
  name?: string;
  n8nWebhookUrl?: string;
  n8nAuthToken?: string;
  channels?: {
    web?: boolean;
    whatsapp?: boolean;
    instagram?: boolean;
  };
}

export class UpdateAgentCommandHandler implements ICommandHandler<UpdateAgentCommand> {
  async execute(command: UpdateAgentCommand): Promise<void> {
    // Emit AgentUpdated event
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'AGENT',
      aggregateId: command.id,
      eventType: 'AgentUpdated',
      payload: {
        ...command,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const updateAgentCommandHandler = new UpdateAgentCommandHandler();
