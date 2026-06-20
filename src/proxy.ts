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
    pathname.includes('.')
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

    if (!status && (pathname.startsWith('/api/') || pathname.includes('dashboard') || pathname.includes('onboarding'))) {
        // Fallback or 404
        // Em um cenário real, poderíamos provisionar ou buscar no banco
    }
  }

  // 4. PROTEÇÃO DE ROTAS (Privy Auth)
  const token = request.cookies.get('privy-token');
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

  // 5. INJEÇÃO DE CONTEXTO E ROTEAMENTO INTERNO
  const response = NextResponse.next();

  if (tenantId) {
    response.headers.set('x-tenant-id', tenantId);

    // Rewrite para app/[tenant]/...
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
