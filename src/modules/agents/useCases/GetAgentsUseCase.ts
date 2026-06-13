import { Agent } from '../domain/Agent';
import { AgentRepository } from '../domain/repositories/AgentRepository';

export class GetAgentsUseCase {
  constructor(private agentRepository: AgentRepository) {}

  async execute(tenantId: string): Promise<Agent[]> {
    return this.agentRepository.findAll(tenantId);
  }
}
