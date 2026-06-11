import { IAgentRepository } from '../repositories/IAgentRepository';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { CryptoService } from '@/lib/crypto';

export interface ChatDTO {
  agentId: string;
  tenantId: string;
  userId: string;
  privyId: string;
  payload: any;
}

export class ProcessAgentChatUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(data: ChatDTO): Promise<any> {
    const { agentId, tenantId, userId, privyId, payload } = data;
    
    // Check Limits First
    const tenantDetails = await this.agentRepository.getTenantDetails(tenantId);
    if (tenantDetails && tenantDetails.status === 'FREE') {
      const now = new Date();
      if (now > tenantDetails.trialEndsAt) {
        throw new Error('TRIAL_EXPIRED');
      }

      const maxExecutions = env.freePlanMaxExecutions;
      if (tenantDetails.executionsUsed >= maxExecutions) {
        throw new Error('QUOTA_EXCEEDED');
      }
    }

    const agent = await this.agentRepository.getDecryptedById(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.n8nWebhookUrl) {
      throw new Error('n8n Webhook URL is not configured for this agent');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (agent.n8nAuthToken) {
      headers['X-API-KEY'] = agent.n8nAuthToken;
    }

    // Fetch User to get LLM keys
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { llmProvider: true, llmApiKey: true }
    });

    let decryptedLlmApiKey = undefined;
    if (user?.llmApiKey) {
      decryptedLlmApiKey = CryptoService.decryptWithPrivy(user.llmApiKey, privyId);
    }

    // Proxy the request to n8n
    const n8nResponse = await fetch(agent.n8nWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        _agentId: agent.id,
        _channel: payload.channel || 'unknown',
        _llmProvider: user?.llmProvider || undefined,
        _llmApiKey: decryptedLlmApiKey,
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`Error communicating with n8n workflow (Status: ${n8nResponse.status})`);
    }

    // Increment executions if successful
    await this.agentRepository.incrementExecutions(tenantId);

    return n8nResponse.json();
  }
}
