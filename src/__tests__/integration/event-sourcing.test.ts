import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventStore } from '@/lib/cqrs/EventStore';
import { getPrismaWithRLS } from '@/lib/prisma';
import { initAgentProjections } from '@/modules/agents/projections/AgentProjectionHandler';

// Mock do DurableBus
vi.mock('@/lib/cqrs/DurableBus', () => ({
  durableBus: {
    publish: vi.fn(),
  },
}));

// Mock do Prisma/Neon RLS
const mockStore: any[] = [];
const mockAgents: any[] = [];

vi.mock('@/lib/prisma', () => ({
  prisma: {},
  getPrismaWithRLS: vi.fn((tenantId: string) => ({
    eventStore: {
      create: vi.fn(({ data }) => {
        const entry = { ...data, id: 'evt-1', createdAt: new Date() };
        mockStore.push(entry);
        return entry;
      }),
      findMany: vi.fn(() => mockStore.filter(e => e.tenantId === tenantId))
    },
    agent: {
      create: vi.fn(({ data }) => {
        mockAgents.push(data);
        return data;
      }),
      findMany: vi.fn(() => mockAgents.filter(a => a.tenantId === tenantId)),
      findUnique: vi.fn(({ where }) => mockAgents.find(a => a.id === where.id && a.tenantId === tenantId)), upsert: vi.fn(({ where, create, update }) => { const existing = mockAgents.find(a => a.id === where.id); if (existing) { Object.assign(existing, update); return existing; } mockAgents.push(create); return create; })
    }
  }))
}));

describe('Fluxo Event Sourcing & RLS (Integração Mockada)', () => {
  const TENANT_A = 'tenant-a';
  const TENANT_B = 'tenant-b';

  beforeEach(() => {
    mockStore.length = 0;
    mockAgents.length = 0;
    vi.clearAllMocks();
    initAgentProjections();
  });

  it('deve garantir que eventos do Tenant A não vazem para o Tenant B via RLS', async () => {
    await EventStore.append({
      tenantId: TENANT_A,
      aggregateType: 'AGENT',
      aggregateId: 'agent-1',
      eventType: 'AgentCreated',
      payload: { name: 'Agente A', n8nWebhookUrl: 'https://a.com', channels: {} }
    });

    const dbB = getPrismaWithRLS(TENANT_B);
    const agentsB = await dbB.agent.findMany();
    expect(agentsB.length).toBe(0);

    const dbA = getPrismaWithRLS(TENANT_A);
    const agentsA = await dbA.agent.findMany();
    expect(agentsA.length).toBe(1);
    expect(agentsA[0].name).toBe('Agente A');
  });

  it('deve atualizar a projeção de agentes após o disparo do evento', async () => {
    const aggregateId = 'agent-unique-123';

    await EventStore.append({
      tenantId: TENANT_A,
      aggregateType: 'AGENT',
      aggregateId,
      eventType: 'AgentCreated',
      payload: {
        name: 'Agente Reativo',
        n8nWebhookUrl: 'https://test.com',
        n8nAuthToken: 'secret',
        channels: { web: true }
      }
    });

    const db = getPrismaWithRLS(TENANT_A);
    const agent = await db.agent.findUnique({ where: { id: aggregateId } });

    expect(agent).toBeDefined();
    expect(agent?.name).toBe('Agente Reativo');
  });
});
