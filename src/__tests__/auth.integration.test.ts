import { describe, it, expect, vi, beforeEach } from 'vitest';

// Criamos o objeto de mock globalmente para persistência
const mockDb = {
  tenantUser: {
      findFirst: vi.fn(),
      create: vi.fn(),
  },
  tenant: {
      findUnique: vi.fn(),
  },
  agent: {
      findMany: vi.fn(),
  }
};

// Mock dependências externas
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  },
  getPrismaWithRLS: vi.fn(() => mockDb)
}));

// Mock tokenVerifier antes de importar requireAuth
vi.mock('@/modules/auth/di', () => ({
  tokenVerifier: {
    verifyToken: vi.fn(),
  }
}));

// Import after mock
const { requireAuth, tokenVerifier } = await import('@/modules/auth/server');
const { prisma } = await import('@/lib/prisma');

describe('Auth Middleware (requireAuth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error if no authorization header is provided', async () => {
    const req = new Request('http://localhost', { headers: new Headers() });
    await expect(requireAuth(req)).rejects.toThrow('Missing or invalid authorization header');
  });

  it('throws error if no tenant header is provided', async () => {
    const req = new Request('http://localhost', {
        headers: new Headers({ 'authorization': 'Bearer valid-token' })
    });
    await expect(requireAuth(req)).rejects.toThrow('Tenant identification is required in 2026 architecture');
  });

  it('creates user and links to tenant on first login', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({
        'authorization': 'Bearer valid-token',
        'x-tenant-id': 'tenant-1'
      })
    });

    (tokenVerifier.verifyToken as any).mockResolvedValue('did:privy:newuser');
    
    // Simula usuário não vinculado ao tenant no contexto RLS
    mockDb.tenantUser.findFirst.mockResolvedValue(null);
    
    // Simula usuário não existente globalmente
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ id: 'user-1', privyId: 'did:privy:newuser' });

    // Simula vinculação ao tenant
    mockDb.tenantUser.create.mockResolvedValue({
        user: { id: 'user-1', privyId: 'did:privy:newuser' },
        tenantId: 'tenant-1'
    });

    const session = await requireAuth(req);
    expect(session.userId).toBe('user-1');
    expect(session.tenantId).toBe('tenant-1');
  });

  it('returns existing user from tenant context', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({
        'authorization': 'Bearer valid-token',
        'x-tenant-id': 'tenant-2'
      })
    });

    (tokenVerifier.verifyToken as any).mockResolvedValue('did:privy:existing');
    
    // Simula usuário já existente e vinculado
    mockDb.tenantUser.findFirst.mockResolvedValue({
        user: { id: 'user-2', privyId: 'did:privy:existing' },
        tenantId: 'tenant-2'
    });

    const session = await requireAuth(req);
    expect(session.userId).toBe('user-2');
    expect(session.tenantId).toBe('tenant-2');
  });
});
