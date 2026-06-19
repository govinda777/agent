import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redis } from './lib/redis';

/**
 * AGENT 2026 EDGE PROXY
 * Gerencia Identificação de Tenant, Controle de Cota e Roteamento Dinâmico.
 */
export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // 1. IGNORAR ASSETS ESTÁTICOS E PÚBLICOS
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // Arquivos com extensão (png, jpg, svg, etc)
  ) {
    return NextResponse.next();
  }

  // 2. IDENTIFICAÇÃO DO TENANT
  let tenantId: string | null = null;

  // Prioridade 1: Subdomínio
  const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
  if (hostname !== baseDomain && hostname.endsWith(baseDomain)) {
    tenantId = hostname.replace(`.${baseDomain}`, '');
    if (tenantId === 'www') tenantId = null;
  }

  // Prioridade 2: Header x-tenant-id (Fallback para APIs)
  if (!tenantId) {
    tenantId = request.headers.get('x-tenant-id');
  }

  // 3. VALIDAÇÃO DE STATUS E QUOTA NA EDGE (Via Redis)
  if (tenantId) {
    // Busca status no cache da Edge (Latência < 5ms)
    const status = await redis.get<string>(`tenant:${tenantId}:status`);

    if (status === 'OVER_BUDGET') {
      return new NextResponse(
        JSON.stringify({ error: 'Payment Required', message: 'Quota exceeded for this tenant.' }),
        { status: 402, headers: { 'content-type': 'application/json' } }
      );
    }

    if (status === 'SUSPENDED') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden', message: 'Account is suspended.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    // Se não houver status no cache (Tenant desconhecido na borda)
    if (!status && (pathname.startsWith('/api/') || pathname.startsWith('/agents'))) {
        // Em um cenário real, poderíamos fazer um fetch para uma API interna que consulta o Neon
        // Aqui retornamos 404 para tenants não provisionados
        return new NextResponse(
            JSON.stringify({ error: 'Not Found', message: 'Tenant not registered.' }),
            { status: 404, headers: { 'content-type': 'application/json' } }
        );
    }
  }

  // 4. INJEÇÃO DE CONTEXTO E ROTEAMENTO INTERNO (NextResponse.rewrite)
  const response = NextResponse.next();

  if (tenantId) {
    // Injeta o ID do tenant nos headers para consumo downstream (API Routes / Server Components)
    response.headers.set('x-tenant-id', tenantId);

    // Rewrite para o padrão app/[tenant]/...
    // Ex: tenantA.localhost:3000/dashboard -> app/[tenant]/dashboard
    if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next')) {
       const url = request.nextUrl.clone();
       url.pathname = `/${tenantId}${pathname}`;
       return NextResponse.rewrite(url, {
         request: {
           headers: response.headers,
         },
       });
    }
  }

  // 5. PROTEÇÃO DE ROTAS (Privy Auth Simulado)
  const token = request.cookies.get('privy-token');
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

  return response;
}

/**
 * Matcher otimizado para rotas de negócio e IA.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> Queremos processar as APIs de IA
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
