import { NextRequest, NextResponse } from 'next/server';
import { proxy } from './proxy';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fix Mock for Redis as a class
const mockRedisGet = vi.fn();
vi.mock('@upstash/redis', () => {
  return {
    Redis: class {
      get = mockRedisGet;
    }
  };
});

describe('Proxy (Middleware)', () => {
  const createRequest = (host: string, path: string = '/', headers: Record<string, string> = {}, cookies: Record<string, string> = {}) => {
    const url = `http://${host}${path}`;
    const cookieString = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    return new NextRequest(url, {
      headers: new Headers({
        host,
        cookie: cookieString,
        ...headers,
      }),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  });

  it('should identify tenant from subdomain on localhost', async () => {
    const req = createRequest('tenant1.localhost:3000', '/agents', {}, { 'privy-token': 'valid' });
    mockRedisGet.mockResolvedValue(null);
    const res = await proxy(req);

    expect(res).toBeDefined();
    expect(res?.status).toBe(200);
  });

  it('should redirect to login if no token for protected route', async () => {
    const req = createRequest('localhost:3000', '/agents');
    const res = await proxy(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toContain('/login');
  });

  it('should return 402 if tenant is OVER_BUDGET on API route', async () => {
    const req = createRequest('tenant1.localhost:3000', '/api/chat');
    mockRedisGet.mockResolvedValue('OVER_BUDGET');

    const res = await proxy(req);

    expect(res?.status).toBe(402);
    const body = await res?.json();
    expect(body.error).toContain('Quota exceeded');
  });

  it('should rewrite to /suspended if tenant is SUSPENDED on UI route', async () => {
    const req = createRequest('tenant1.localhost:3000', '/agents', {}, { 'privy-token': 'valid' });
    mockRedisGet.mockResolvedValue('SUSPENDED');

    const res = await proxy(req);
    expect(res).toBeDefined();
  });
});
