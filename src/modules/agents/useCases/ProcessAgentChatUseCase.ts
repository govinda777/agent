import { IAgentRepository } from '../repositories/IAgentRepository';
import { EventStore } from '@/lib/cqrs/EventStore';
import { AGENT_CHAT_STARTED, AGENT_CHAT_COMPLETED } from '../events/AgentEvents';
import crypto from 'crypto';

export interface ProcessAgentChatDTO {
  agentId: string;
  tenantId: string;
  userId: string;
  privyId: string;
  payload: Record<string, any>;
}

export class ProcessAgentChatUseCase {
  constructor(private readonly agentRepository: IAgentRepository) {}

  async execute(data: ProcessAgentChatDTO) {
    const chatSessionId = crypto.randomUUID();

    const agent = await this.agentRepository.getDecryptedById(data.agentId);
    if (!agent) throw new Error('Agent not found');

    await EventStore.append({
      tenantId: data.tenantId,
      aggregateType: 'AGENT_CHAT',
      aggregateId: chatSessionId,
      eventType: AGENT_CHAT_STARTED,
      payload: {
        agentId: data.agentId,
        userId: data.userId,
        timestamp: new Date().toISOString()
      }
    });

    try {
      const response = await fetch(agent.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${agent.n8nAuthToken}`,
        },
        body: JSON.stringify(data.payload),
      });

      if (!response.ok) {
         throw new Error(`Error communicating with n8n workflow (Status: ${response.status})`);
      }

      const result = await response.json();

      await EventStore.append({
        tenantId: data.tenantId,
        aggregateType: 'AGENT_CHAT',
        aggregateId: chatSessionId,
        eventType: AGENT_CHAT_COMPLETED,
        payload: {
          agentId: data.agentId,
          userId: data.userId,
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        }
      });

      return result;
    } catch (error: any) {
      await EventStore.append({
        tenantId: data.tenantId,
        aggregateType: 'AGENT_CHAT',
        aggregateId: chatSessionId,
        eventType: AGENT_CHAT_COMPLETED,
        payload: {
          agentId: data.agentId,
          userId: data.userId,
          status: 'FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
      throw error;
    }
  }
}
