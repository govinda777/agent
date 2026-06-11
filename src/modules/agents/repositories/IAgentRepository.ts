import { Agent } from '../domain/Agent';

export interface IAgentRepository {
  save(tenantId: string, agentData: Omit<Agent, 'id' | 'createdAt'>): Promise<Agent>;
  findAll(tenantId: string): Promise<Agent[]>;
  findById(id: string, tenantId: string): Promise<Agent | null>;
  getDecryptedById(id: string): Promise<Agent | null>;
  
  // New methods for Tenant/Free Plan Limits
  getTenantDetails(tenantId: string): Promise<{
    status: string;
    trialEndsAt: Date;
    executionsUsed: number;
    agentsCount: number;
  } | null>;
  
  incrementExecutions(tenantId: string): Promise<void>;
  update(id: string, tenantId: string, agentData: Partial<Agent>): Promise<Agent>;
}
