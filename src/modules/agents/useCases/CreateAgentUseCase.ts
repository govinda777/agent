import { Agent } from '../domain/Agent';
import { IAgentRepository } from '../repositories/IAgentRepository';
import { env } from '@/config/env';

export interface CreateAgentDTO {
  tenantId: string;
  name: string;
  n8nWebhookUrl: string;
  n8nAuthToken?: string;
  channels?: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
}

export class CreateAgentUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(data: CreateAgentDTO): Promise<Agent> {
    if (!data.name || !data.n8nWebhookUrl) {
      throw new Error('Name and Webhook URL are required');
    }

    // Tenant Limits Check
    const tenantDetails = await this.agentRepository.getTenantDetails(data.tenantId);
    
    if (tenantDetails && tenantDetails.status === 'FREE') {
      const maxAgents = env.freePlanMaxAgents;
      if (tenantDetails.agentsCount >= maxAgents) {
        throw new Error('Limite de agentes atingido. Faça upgrade.');
      }

      // Enforce Free Plan allowed channels (e.g. only web)
      const allowedChannelsEnv = env.freePlanChannels;
      const allowedChannels = allowedChannelsEnv.split(',');
      
      if (data.channels) {
        if (data.channels.whatsapp && !allowedChannels.includes('whatsapp')) {
          data.channels.whatsapp = false; // Block
        }
        if (data.channels.instagram && !allowedChannels.includes('instagram')) {
          data.channels.instagram = false; // Block
        }
      }
    }

    const agentData = {
      name: data.name,
      n8nWebhookUrl: data.n8nWebhookUrl,
      n8nAuthToken: data.n8nAuthToken || '',
      channels: data.channels || { web: false, whatsapp: false, instagram: false }
    };

    return this.agentRepository.save(data.tenantId, agentData);
  }
}
