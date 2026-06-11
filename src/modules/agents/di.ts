import { PrismaAgentRepository } from './infrastructure/PrismaAgentRepository';
import { CreateAgentUseCase } from './useCases/CreateAgentUseCase';
import { GetAgentsUseCase } from './useCases/GetAgentsUseCase';
import { ProcessAgentChatUseCase } from './useCases/ProcessAgentChatUseCase';
import { UpdateAgentUseCase } from './useCases/UpdateAgentUseCase';

// Single repository instance (Composition Root)
export const agentRepository = new PrismaAgentRepository();

// Use cases initialized with the repository instance (Constructor Injection)
export const createAgentUseCase = new CreateAgentUseCase(agentRepository);
export const getAgentsUseCase = new GetAgentsUseCase(agentRepository);
export const processAgentChatUseCase = new ProcessAgentChatUseCase(agentRepository);
export const updateAgentUseCase = new UpdateAgentUseCase(agentRepository);
