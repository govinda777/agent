import { IQuery } from '@/lib/cqrs/types';
import { agentRepository } from '../di';
import { Agent } from '../domain/Agent';

export class GetAgentsQuery implements IQuery<Agent[]> {
  async execute(tenantId: string): Promise<Agent[]> {
    return agentRepository.findAll(tenantId);
  }
}

export const getAgentsQuery = new GetAgentsQuery();
