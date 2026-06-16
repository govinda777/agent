import { apiClient } from './api-client';
import { getAuthToken } from './token-manager';

export interface AgentData {
  id: string;
  name: string;
  n8nWebhookUrl: string;
  n8nAuthToken: string;
  channelWeb: boolean;
  channelWhatsapp: boolean;
  channelInstagram: boolean;
  channels?: {
    web: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
}

export const AgentService = {
  getAgents: async () => {
    const token = await getAuthToken();
    const res = await apiClient<{ agents: AgentData[] }>('/api/agents', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.agents;
  },

  getAgent: async (agentId: string) => {
    const token = await getAuthToken();
    const res = await apiClient<{ agent: AgentData }>(`/api/agents/${agentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.agent;
  },

  createAgent: async (data: Omit<AgentData, 'id'>) => {
    const token = await getAuthToken();
    const res = await apiClient<{ agent: AgentData }>('/api/agents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.agent;
  },

  updateAgent: async (agentId: string, data: Partial<AgentData>) => {
    const token = await getAuthToken();
    const res = await apiClient<{ agent: AgentData }>(`/api/agents/${agentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.agent;
  },
};
