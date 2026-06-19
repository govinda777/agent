import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * Initializes the Redis client for the Edge.
 */
let redisInstance: Redis | null = null;
function getRedis() {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    redisInstance = new Redis({ url, token });
  }
  return redisInstance;
}

async function getTenantStatusFromCache(tenant: string): Promise<{ blocked: boolean; reason?: string }> {
  const redis = getRedis();
  if (!redis) {
    return { blocked: false };
  }

  try {
    const status: string | null = await redis.get(`tenant:${tenant}:status`);

    if (status === 'OVER_BUDGET') {
      return { blocked: true, reason: 'OVER_BUDGET' };
    }

    if (status === 'SUSPENDED') {
      return { blocked: true, reason: 'SUSPENDED' };
    }

    return { blocked: false };
  } catch (error) {
    console.error('Proxy Cache Error:', error);
    return { blocked: false };
  }
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const hostname = request.headers.get('host') || '';
  const token = request.cookies.get('privy-token');

  // 1. Identify the Tenant (Subdomain vs Header)
  let tenant = request.headers.get('x-tenant-id');

  if (!tenant) {
    const parts = hostname.split('.');
    const isLocalhost = hostname.includes('localhost');

    if (isLocalhost) {
      if (parts.length > 1) {
        tenant = parts[0];
      }
    } else {
      if (parts.length > 2) {
        tenant = parts[0];
      }
    }
  }

  // 2. Auth Protection Logic (from original proxy)
  const isProtectedRoute = 
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/agents');

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 3. Quota & Status Validation Logic
  const isApiPath = pathname.startsWith('/api/');

  // We'll perform the async check here.
  // Note: proxy function can be async if it returns a Promise<NextResponse>

  return (async () => {
    if (tenant) {
      const { blocked, reason } = await getTenantStatusFromCache(tenant);

      if (blocked) {
        const status = reason === 'OVER_BUDGET' ? 402 : 403;
        const message = reason === 'OVER_BUDGET'
          ? 'Quota exceeded. Please upgrade your plan.'
          : 'Account suspended.';

        if (isApiPath) {
          return new NextResponse(
            JSON.stringify({ error: message, tenant }),
            { status, headers: { 'content-type': 'application/json' } }
          );
        }

        url.pathname = '/suspended';
        url.searchParams.set('reason', reason || 'unknown');
        url.searchParams.set('tenant', tenant);
        return NextResponse.rewrite(url);
      }
    }

    // 4. Inject Tenant ID for downstream
    const requestHeaders = new Headers(request.headers);
    if (tenant) {
      requestHeaders.set('x-tenant-id', tenant);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  })();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};
