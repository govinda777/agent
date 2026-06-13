/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    },
  },
}));

// Mock tokenVerifier antes de importar requireAuth
vi.mock('@/modules/auth/di', () => ({
  tokenVerifier: {
    verifyToken: vi.fn(),
  },
  getUserByPrivyIdQuery: {
    execute: vi.fn(),
  },
}));

// Import after mock
const { requireAuth, tokenVerifier, getUserByPrivyIdQuery } =
  await import('@/modules/auth/server');

describe('Auth Middleware (requireAuth)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error if no authorization header is provided', async () => {
    const req = new Request('http://localhost', { headers: new Headers() });
    await expect(requireAuth(req)).rejects.toThrow('Missing or invalid authorization header');
  });

  it('returns session if user is provisioned', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({ authorization: 'Bearer valid-token' }),
    });

    (tokenVerifier.verifyToken as any).mockResolvedValue('did:privy:existing');

    // Simula execução da Query
    (getUserByPrivyIdQuery.execute as any).mockResolvedValue({
      userId: 'user-1',
      privyId: 'did:privy:existing',
      tenantId: 'tenant-1',
    });

    const session = await requireAuth(req);
    expect(session).toEqual({
      userId: 'user-1',
      privyId: 'did:privy:existing',
      tenantId: 'tenant-1',
    });
    expect(getUserByPrivyIdQuery.execute).toHaveBeenCalledWith({
      privyId: 'did:privy:existing',
      requestedTenantId: null,
    });
  });

  it('throws error if user is not provisioned', async () => {
    const req = new Request('http://localhost', {
      headers: new Headers({ authorization: 'Bearer valid-token' }),
    });

    (tokenVerifier.verifyToken as any).mockResolvedValue('did:privy:new');

    // Simula execução da Query retornando nulo
    (getUserByPrivyIdQuery.execute as any).mockResolvedValue(null);

    await expect(requireAuth(req)).rejects.toThrow('NOT_PROVISIONED');
  });
});
