import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { privy } from '@/lib/privy';

// Mock dependências externas
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    tenant: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    tenantUser: {
      create: vi.fn(),
    }
  }
}));

vi.mock('@/lib/privy', () => ({
  privy: {
    verifyAuthToken: vi.fn(),
  }
}));

describe('Auth Middleware (requireAuth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error if no authorization header is provided', async () => {
    const req = new Request('http://localhost', { headers: new Headers() });
    await expect(requireAuth(req)).rejects.toThrow('Missing or invalid authorization header');
  });

  it('creates user and tenant on first login', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({ 'authorization': 'Bearer valid-token' })
    });

    (privy.verifyAuthToken as any).mockResolvedValue({ userId: 'did:privy:newuser' });
    
    // Simula usuário não existente
    (prisma.user.findUnique as any).mockResolvedValue(null);
    
    // Simula criação do usuário e tenant
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-1',
      privyId: 'did:privy:newuser',
      tenants: [
        { tenantId: 'tenant-1' }
      ]
    });

    const session = await requireAuth(req);
    expect(session).toEqual({
      userId: 'user-1',
      privyId: 'did:privy:newuser',
      tenantId: 'tenant-1',
    });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('returns existing user and defaults to first tenant', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({ 'authorization': 'Bearer valid-token' })
    });

    (privy.verifyAuthToken as any).mockResolvedValue({ userId: 'did:privy:existing' });
    
    // Simula usuário existente com tenant
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-2',
      privyId: 'did:privy:existing',
      tenants: [
        { tenantId: 'tenant-2' }
      ]
    });

    const session = await requireAuth(req);
    expect(session).toEqual({
      userId: 'user-2',
      privyId: 'did:privy:existing',
      tenantId: 'tenant-2',
    });
  });
});
