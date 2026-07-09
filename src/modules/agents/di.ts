import { PrismaAgentRepository } from './infrastructure/PrismaAgentRepository';
import { PrismaExecutionRepository } from './infrastructure/PrismaExecutionRepository';

export const agentRepository = new PrismaAgentRepository();
export const executionRepository = new PrismaExecutionRepository();
