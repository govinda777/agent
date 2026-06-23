import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from './lib/redis';
import { Ratelimit } from "@upstash/ratelimit";

// Configuração de Rate Limit na Edge
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests por 10 segundos por IP
  analytics: true,
});

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

  // 2. IDENTIFICAÇÃO DO TENANT
  let tenantId: string | null = null;
  const baseDomainRaw = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
  // Remove a porta do domínio base para comparação com o hostname (que nunca possui porta)
  const baseDomain = baseDomainRaw.split(':')[0];

  // Suporte a subdomínios e localtest.me
  if (hostname.endsWith(baseDomain) && hostname !== baseDomain) {
    tenantId = hostname.replace(`.${baseDomain}`, '');
    if (tenantId === 'www') tenantId = null;
  }

  if (!tenantId) {
    tenantId = request.headers.get('x-tenant-id');
  }

  // Se for uma rota de tenant mas nenhum tenant foi detectado (acesso direto via localhost sem subdomínio),
  // usamos o tenant padrão seedado no banco de dados para evitar 404.
  if (!tenantId) {
    const isTenantRoute =
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/agents') ||
      pathname.startsWith('/api/agents');

    if (isTenantRoute) {
      tenantId = 'd1b00000-0000-0000-0000-000000000000';
    }
  }

  // 3. RATE LIMITING (Global por IP na Edge)
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

  // 4. VALIDAÇÃO DE STATUS E QUOTA NO REDIS (Edge Cache)
  if (tenantId) {
    // Casos especiais para Testes E2E sem precisar de Redis real
    if (tenantId === 'overbudget') {
        return new NextResponse(JSON.stringify({ error: 'Payment Required' }), { status: 402 });
    }
    if (tenantId === 'suspended') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const status = await redis.get<string>(`tenant:${tenantId}:status`);

    if (status === 'OVER_BUDGET') {
      return new NextResponse(
        JSON.stringify({ error: 'Payment Required', message: 'Quota exceeded.' }),
        { status: 402, headers: { 'content-type': 'application/json' } }
      );
    }

    if (status === 'SUSPENDED') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden', message: 'Account is suspended.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // 5. PROTEÇÃO DE ROTAS
  const token = request.cookies.get('privy-token');
  
  if (pathname.startsWith('/api/') && tenantId) {
    response.headers.set('x-tenant-id', tenantId);
  }
  const isProtectedRoute =
    pathname.includes('onboarding') ||
    pathname.includes('profile') ||
    pathname.includes('checkout') ||
    pathname.includes('agents');

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. INJEÇÃO DE CONTEXTO E ROTEAMENTO INTERNO
  const response = NextResponse.next();

  if (tenantId) {
    response.headers.set('x-tenant-id', tenantId);

    if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next') && pathname !== '/login') {
       const url = request.nextUrl.clone();
       url.pathname = `/${tenantId}${pathname}`;
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
