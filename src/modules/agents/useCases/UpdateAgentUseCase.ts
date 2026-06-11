import { Agent } from '../domain/Agent';
import { IAgentRepository } from '../repositories/IAgentRepository';
import { env } from '@/config/env';

export interface UpdateAgentDTO {
  id: string;
  tenantId: string;
  name?: string;
  n8nWebhookUrl?: string;
  n8nAuthToken?: string;
  channels?: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
}

export class UpdateAgentUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(data: UpdateAgentDTO): Promise<Agent> {
    if (data.name !== undefined && !data.name) {
      throw new Error('Name cannot be empty');
    }
    if (data.n8nWebhookUrl !== undefined && !data.n8nWebhookUrl) {
      throw new Error('Webhook URL cannot be empty');
    }

    // Tenant Limits Check
    const tenantDetails = await this.agentRepository.getTenantDetails(data.tenantId);
    
    if (tenantDetails && tenantDetails.status === 'FREE' && data.channels) {
      // Enforce Free Plan allowed channels (e.g. only web)
      const allowedChannelsEnv = env.freePlanChannels;
      const allowedChannels = allowedChannelsEnv.split(',');
      
      if (data.channels.whatsapp && !allowedChannels.includes('whatsapp')) {
        data.channels.whatsapp = false; // Block
      }
      if (data.channels.instagram && !allowedChannels.includes('instagram')) {
        data.channels.instagram = false; // Block
      }
    }

    const agentData: Partial<Agent> = {};
    if (data.name !== undefined) agentData.name = data.name;
    if (data.n8nWebhookUrl !== undefined) agentData.n8nWebhookUrl = data.n8nWebhookUrl;
    if (data.n8nAuthToken !== undefined) agentData.n8nAuthToken = data.n8nAuthToken;
    if (data.channels !== undefined) agentData.channels = data.channels;

    return this.agentRepository.update(data.id, data.tenantId, agentData);
  }
}
