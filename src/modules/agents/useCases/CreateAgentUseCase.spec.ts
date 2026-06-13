import { describe, it, expect, vi } from 'vitest';
import { CreateAgentUseCase } from './CreateAgentUseCase';
import { AgentRepository } from '../domain/repositories/AgentRepository';

describe('CreateAgentUseCase', () => {
  const mockAgentRepository: AgentRepository = {
    save: vi.fn().mockImplementation(async (tenantId, data) => {
      return {
        id: 'agent-123',
        name: data.name,
        n8nWebhookUrl: data.n8nWebhookUrl,
        n8nAuthToken: data.n8nAuthToken || '',
        channels: data.channels,
        createdAt: new Date().toISOString(),
      };
    }),
    findAll: vi.fn(),
    findById: vi.fn(),
    getDecryptedById: vi.fn(),
    getTenantDetails: vi.fn().mockResolvedValue({
      status: 'FREE',
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      executionsUsed: 0,
      agentsCount: 0,
    }),
    incrementExecutions: vi.fn(),
    update: vi.fn(),
  };

  it('should successfully create an agent when valid data is provided', async () => {
    const useCase = new CreateAgentUseCase(mockAgentRepository);
    const agent = await useCase.execute({
      tenantId: 'tenant-123',
      name: 'Test Agent',
      n8nWebhookUrl: 'http://localhost:5678/webhook/test',
      channels: {
        web: true,
        whatsapp: false,
        instagram: false,
      },
    });

    expect(agent.id).toBe('agent-123');
    expect(agent.name).toBe('Test Agent');
    expect(mockAgentRepository.save).toHaveBeenCalled();
  });

  it('should throw an error if name is missing', async () => {
    const useCase = new CreateAgentUseCase(mockAgentRepository);
    await expect(
      useCase.execute({
        tenantId: 'tenant-123',
        name: '',
        n8nWebhookUrl: 'http://localhost:5678/webhook/test',
      })
    ).rejects.toThrow('Name and Webhook URL are required');
  });
});
