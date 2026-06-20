import { ICommand, ICommandHandler } from '@/lib/cqrs/types';
import { EventStore } from '@/lib/cqrs/EventStore';
import * as nodeCrypto from 'crypto';

export interface ExecuteAgentCommand extends ICommand {
  agentId: string;
  userId: string;
  payload: Record<string, unknown>;
}

export class ExecuteAgentCommandHandler implements ICommandHandler<ExecuteAgentCommand> {
  async execute(command: ExecuteAgentCommand): Promise<string> {
    const executionId = nodeCrypto.randomUUID();

    // 1. Grava o evento inicial de solicitação de execução
    await EventStore.append({
      tenantId: command.tenantId,
      aggregateType: 'EXECUTION',
      aggregateId: executionId,
      eventType: 'AgentExecutionRequested',
      payload: {
        agentId: command.agentId,
        userId: command.userId,
        payload: command.payload,
        timestamp: new Date().toISOString()
      }
    });

    return executionId;
  }
}

export const executeAgentCommandHandler = new ExecuteAgentCommandHandler();
