import { tokenVerifier } from '../di';
import { prisma, getPrismaWithRLS } from '@/lib/prisma';

/**
 * REQUIRE AUTH 2026: AGNOSTIC & SECURE
 *
 * Esta função agora confia na validação inicial feita na Edge (Proxy).
 * Ela extrai o tenantId e userId, garantindo o isolamento via Neon RLS.
 */
export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  const tenantId = request.headers.get('x-tenant-id');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  if (!tenantId) {
    throw new Error('Tenant identification is required in 2026 architecture');
  }

  const token = authHeader.split(' ')[1];
  let privyId: string;

  try {
    // Validação criptográfica do Token
    privyId = await tokenVerifier.verifyToken(token);
  } catch (_error: unknown) {
    throw new Error('Invalid or expired token');
  }

  /**
   * ACESSO AO BANCO COM RLS
   */
  const db = getPrismaWithRLS(tenantId);

  // Busca o usuário no contexto do tenant
  let tenantUser = await db.tenantUser.findFirst({
    where: { user: { privyId }, tenantId },
    include: { user: true },
  });

  // Fallback: Se o usuário existe mas não está vinculado a este tenant
  if (!tenantUser) {
    // 1. Verifica se o usuário existe globalmente
    let user = await prisma.user.findUnique({ where: { privyId } });

    if (!user) {
      user = await prisma.user.create({ data: { privyId } });
    }

    // 2. Vincula ao tenant
    try {
        tenantUser = await db.tenantUser.create({
            data: {
                userId: user.id,
                tenantId: tenantId,
                role: 'MEMBER'
            },
            include: { user: true }
        });
    } catch (_e) {
        throw new Error('Could not link user to tenant. Ensure tenant exists.');
    }
  }

  return {
    userId: tenantUser.user.id,
    privyId: tenantUser.user.privyId,
    tenantId: tenantId,
    db,
  };
}
