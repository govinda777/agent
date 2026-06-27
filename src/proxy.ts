import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from './lib/redis';
import { Ratelimit } from "@upstash/ratelimit";
import { jwtDecrypt } from 'jose';

// Configuração de Rate Limit na Edge
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests por 10 segundos por IP
  analytics: true,
});

const SESSION_COOKIE_NAME = 'app-session';
const SECRET_KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 64)
    ? process.env.ENCRYPTION_KEY.substring(0, 64)
    : '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'hex'
);

/**
 * AGENT 2026 EDGE PROXY
 */
export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // 1. IGNORAR ASSETS ESTÁTICOS
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. IDENTIFICAÇÃO DO TENANT PELA URL/HOSTNAME
  let urlTenantId: string | null = null;
  const baseDomainRaw = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
  const baseDomain = baseDomainRaw.split(':')[0];

  if (hostname.endsWith(baseDomain) && hostname !== baseDomain) {
    urlTenantId = hostname.replace(`.${baseDomain}`, '');
    if (urlTenantId === 'www') urlTenantId = null;
  }

  // 3. RECUPERAR SESSÃO JWE (Borda)
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let sessionPayload: any = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtDecrypt(sessionToken, SECRET_KEY, {
        contentEncryptionAlgorithms: ['A256GCM'],
      });
      sessionPayload = payload;
    } catch (error) {
      console.error('[Proxy] Session decryption failed');
    }
  }

  // 4. AUTORIZAÇÃO E RESOLUÇÃO DE TENANT
  const finalTenantId = urlTenantId || sessionPayload?.tenantId || request.headers.get('x-tenant-id');

  // Proteção de rotas e validação de tenant
  const isProtectedRoute =
    pathname.includes('onboarding') ||
    pathname.includes('profile') ||
    pathname.includes('checkout') ||
    pathname.includes('agents');

  if (isProtectedRoute) {
    if (!sessionPayload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_to', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Se o usuário tenta acessar um tenant específico, valida se ele tem permissão
    if (urlTenantId && !sessionPayload.tenants.includes(urlTenantId)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden', message: 'You do not have access to this tenant.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 5. RATE LIMITING (Global por IP na Edge)
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new NextResponse(
            JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded.' }),
            { status: 429, headers: { 'content-type': 'application/json' } }
        );
    }
  }

  // 6. VALIDAÇÃO DE QUOTA NO REDIS (Edge Cache)
  if (finalTenantId) {
    const status = await redis.get<string>(`tenant:${finalTenantId}:status`);
    if (status === 'OVER_BUDGET') {
      return new NextResponse(
        JSON.stringify({ error: 'Payment Required', message: 'Quota exceeded.' }),
        { status: 402, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 7. INJEÇÃO DE CONTEXTO E ROTEAMENTO
  const response = NextResponse.next();

  if (finalTenantId) {
    response.headers.set('x-tenant-id', finalTenantId);

    // Injeta o Privy Token original para os route handlers
    if (sessionPayload?.privyToken) {
      response.headers.set('Authorization', `Bearer ${sessionPayload.privyToken}`);
    }

    if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next') && pathname !== '/login') {
       const url = request.nextUrl.clone();
       url.pathname = `/${finalTenantId}${pathname}`;
       return NextResponse.rewrite(url, {
         request: { headers: response.headers },
       });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
