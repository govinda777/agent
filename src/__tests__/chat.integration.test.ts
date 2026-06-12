/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/agents/[agentId]/chat/route';
import { processAgentChatUseCase } from '@/modules/agents/di';

// Mock dependencies
vi.mock('@/modules/auth/di', () => ({
  tokenVerifier: {
    verifyToken: vi.fn(),
  },
}));

vi.mock('@/modules/auth/infrastructure/require-auth', () => ({
  requireAuth: vi.fn(),
}));

// Import mocked requireAuth
const { requireAuth } = await import('@/modules/auth/infrastructure/require-auth');

vi.mock('@/modules/agents/di', () => ({
  processAgentChatUseCase: {
    execute: vi.fn(),
  },
}));

describe('Agent Chat API Route Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully streams chat response from n8n agent', async () => {
    // Mock user auth session
    (requireAuth as any).mockResolvedValue({
      userId: 'user-id-123',
      privyId: 'privy-id-456',
      tenantId: 'tenant-id-789',
    });

    // Mock n8n workflow output response
    (processAgentChatUseCase.execute as any).mockResolvedValue({
      response: 'Olá, sou o seu assistente de teste!',
    });

    // Construct request
    const request = new Request('http://localhost/api/agents/agent-id-999/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Olá!' }],
      }),
    });

    // Call POST handler
    const response = await POST(request, {
      params: Promise.resolve({ agentId: 'agent-id-999' }),
    });

    expect(response.status).toBe(200);

    // Read stream response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
    }

    // Verify stream output contents
    expect(result).toContain('Olá, sou o seu assistente de teste!');
    expect(processAgentChatUseCase.execute).toHaveBeenCalledWith({
      agentId: 'agent-id-999',
      tenantId: 'tenant-id-789',
      userId: 'user-id-123',
      privyId: 'privy-id-456',
      payload: {
        messages: [{ role: 'user', content: 'Olá!' }],
        message: 'Olá!',
        channel: 'web',
      },
    });
  });

  it('returns structured error message if n8n communication fails', async () => {
    (requireAuth as any).mockResolvedValue({
      userId: 'user-id-123',
      privyId: 'privy-id-456',
      tenantId: 'tenant-id-789',
    });

    // Simulate n8n 404 error
    (processAgentChatUseCase.execute as any).mockRejectedValue(
      new Error('Error communicating with n8n workflow (Status: 404)')
    );

    const request = new Request('http://localhost/api/agents/agent-id-999/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Olá!' }],
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ agentId: 'agent-id-999' }),
    });

    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
    }

    // Should return the friendly error message
    expect(result).toContain('Erro 404: O n8n retornou que a URL do Webhook não existe');
  });
});
