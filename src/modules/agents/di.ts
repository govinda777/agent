import { PrismaAgentRepository } from './infrastructure/PrismaAgentRepository';

/**
 * COMPOSITION ROOT: 2026 REFACTORED
 *
 * Agora focada em Repositórios e Infraestrutura de suporte ao CQRS.
 * UseCases legados foram substituídos por Command Handlers.
 */

export const agentRepository = new PrismaAgentRepository();

// Os Command Handlers são exportados diretamente de seus respectivos arquivos
// para evitar dependências circulares pesadas no Composition Root.
