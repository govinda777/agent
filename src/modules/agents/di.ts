import { PrismaAgentRepository } from './infrastructure/PrismaAgentRepository';
import { PrismaExecutionRepository } from './infrastructure/PrismaExecutionRepository';
import { ProcessAgentChatUseCase } from './useCases/ProcessAgentChatUseCase';

export const agentRepository = new PrismaAgentRepository();
export const executionRepository = new PrismaExecutionRepository();
export const processAgentChatUseCase = new ProcessAgentChatUseCase(agentRepository);
