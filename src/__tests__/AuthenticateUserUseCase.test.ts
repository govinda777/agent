/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from '../modules/auth/useCases/AuthenticateUserUseCase';
import { UserRepository } from '../modules/auth/domain/repositories/UserRepository';
import { CreateAgentUseCase } from '../modules/agents/useCases/CreateAgentUseCase';

// Mock env
vi.mock('@/config/env', () => ({
  env: {
    freePlanTrialDays: 14,
    n8nWebhookUrl: 'http://localhost/webhook',
    n8nAuthToken: 'secret-token',
  },
}));

describe('AuthenticateUserUseCase', () => {
  let mockUserRepository: UserRepository;
  let mockCreateAgentUseCase: CreateAgentUseCase;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByPrivyId: vi.fn(),
      createUserWithTenant: vi.fn(),
      createTenantForUser: vi.fn(),
    };

    mockCreateAgentUseCase = {
      execute: vi.fn(),
    } as any;

    useCase = new AuthenticateUserUseCase(mockUserRepository, mockCreateAgentUseCase);
    vi.clearAllMocks();
  });

  it('creates a new user, tenant, and automatic agent when user does not exist', async () => {
    (mockUserRepository.findByPrivyId as any).mockResolvedValue(null);
    (mockUserRepository.createUserWithTenant as any).mockResolvedValue({
      id: 'user-1',
      privyId: 'did:privy:new',
      tenants: [{ tenantId: 'tenant-1', tenant: {} }],
    });

    const result = await useCase.execute({ privyId: 'did:privy:new' });

    expect(result).toEqual({
      userId: 'user-1',
      privyId: 'did:privy:new',
      tenantId: 'tenant-1',
    });

    expect(mockUserRepository.createUserWithTenant).toHaveBeenCalledWith(
      'did:privy:new',
      expect.any(Date)
    );
    expect(mockCreateAgentUseCase.execute).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      name: 'Agente n8n Padrão',
      n8nWebhookUrl: 'http://localhost/webhook',
      n8nAuthToken: 'secret-token',
      channels: {
        web: true,
        whatsapp: false,
        instagram: false,
      },
    });
  });

  it('returns existing user details without creating a new tenant or agent if already configured', async () => {
    (mockUserRepository.findByPrivyId as any).mockResolvedValue({
      id: 'user-2',
      privyId: 'did:privy:existing',
      tenants: [{ tenantId: 'tenant-2', tenant: {} }],
    });

    const result = await useCase.execute({ privyId: 'did:privy:existing' });

    expect(result).toEqual({
      userId: 'user-2',
      privyId: 'did:privy:existing',
      tenantId: 'tenant-2',
    });

    expect(mockUserRepository.createUserWithTenant).not.toHaveBeenCalled();
    expect(mockCreateAgentUseCase.execute).not.toHaveBeenCalled();
  });
});
