import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateAgentCommandHandler } from './CreateAgentCommand';
import { EventStore } from '@/lib/cqrs/EventStore';

// Mock do EventStore para não tocar no banco nos testes de unidade
vi.mock('@/lib/cqrs/EventStore', () => ({
  EventStore: {
    append: vi.fn(),
  },
}));

describe('CreateAgentCommandHandler (Unit)', () => {
  let handler: CreateAgentCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new CreateAgentCommandHandler();
  });

  it('deve emitir AgentCreated quando o comando for válido', async () => {
    const command = {
      tenantId: 'tenant-123',
      name: 'Agente de Teste',
      n8nWebhookUrl: 'https://n8n.test',
      n8nAuthToken: 'token-secret',
      channels: { web: true, whatsapp: false, instagram: false }
    };

    const agentId = await handler.execute(command);

    expect(agentId).toBeDefined();
    expect(EventStore.append).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'AgentCreated',
      tenantId: 'tenant-123',
      payload: expect.objectContaining({
        name: 'Agente de Teste'
      })
    }));
  });

  it('deve falhar se o nome do agente estiver vazio (Validação de Domínio)', async () => {
    const command = {
      tenantId: 'tenant-123',
      name: '',
      n8nWebhookUrl: 'https://n8n.test',
      n8nAuthToken: 'token',
      channels: { web: true, whatsapp: false, instagram: false }
    };

    // Supondo que adicionaremos validação no handler
    await expect(handler.execute(command)).rejects.toThrow();
    expect(EventStore.append).not.toHaveBeenCalled();
  });
});
