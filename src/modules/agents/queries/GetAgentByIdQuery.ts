import { IQuery } from '@/lib/cqrs/types';
import { agentRepository } from '../di';
import { Agent } from '../domain/Agent';

export class GetAgentByIdQuery implements IQuery<Agent | null> {
  async execute(agentId: string, tenantId: string): Promise<Agent | null> {
    return agentRepository.findById(agentId, tenantId);
  }
}

export const getAgentByIdQuery = new GetAgentByIdQuery();
