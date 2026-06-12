import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('privy-token');
  const { pathname } = request.nextUrl;

  // Roteamento de proteção de rotas privadas (Área Logada)
  const isProtectedRoute =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/agents');

  // Redireciona usuários deslogados tentando acessar área logada
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Preserva a página que o usuário queria acessar para redirecionamento pós-login se necessário
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redireciona usuários logados tentando acessar tela de login
  if (pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

// Configuração do Matcher para filtrar apenas as rotas de interesse
export const config = {
  matcher: [
    '/onboarding/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/agents/:path*',
    '/login',
  ],
};
