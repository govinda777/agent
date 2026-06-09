import { Agent } from '../domain/Agent';
import { IAgentRepository } from '../repositories/IAgentRepository';

export class GetAgentsUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(tenantId: string): Promise<Agent[]> {
    return this.agentRepository.findAll(tenantId);
  }
}
