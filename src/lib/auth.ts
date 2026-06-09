import { privy } from './privy';
import { prisma } from './prisma';

export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  let privyId: string;

  try {
    const verifiedClaims = await privy.verifyAuthToken(token);
    privyId = verifiedClaims.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }

  // Find or create User and ensure they have a Tenant
  let user = await prisma.user.findUnique({
    where: { privyId },
    include: { tenants: { include: { tenant: true } } },
  });

  if (!user) {
    // Primeiro login do usuário - criar User e um Tenant inicial para ele como OWNER
    user = await prisma.user.create({
      data: {
        privyId,
        tenants: {
          create: {
            role: 'OWNER',
            tenant: {
              create: {
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
              }
            }
          }
        }
      },
      include: { tenants: { include: { tenant: true } } }
    });
  } else if (user.tenants.length === 0) {
    // User exists but has no tenant somehow, create one
    const newTenant = await prisma.tenant.create({
      data: {
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    });
    await prisma.tenantUser.create({
      data: {
        userId: user.id,
        tenantId: newTenant.id,
        role: 'OWNER'
      }
    });
    user = await prisma.user.findUnique({
      where: { privyId },
      include: { tenants: { include: { tenant: true } } },
    }) as any;
  }

  // By default, return the user's first tenant. 
  // In a real B2B app, the client might pass `x-tenant-id` header to specify which tenant they are acting as.
  if (!user) {
    throw new Error('User not found or created successfully');
  }

  const requestedTenantId = request.headers.get('x-tenant-id');
  
  let activeTenantId = user.tenants[0].tenantId;

  if (requestedTenantId) {
    const hasAccess = user.tenants.some((t: any) => t.tenantId === requestedTenantId);
    if (!hasAccess) {
      throw new Error('User does not have access to the requested tenant');
    }
    activeTenantId = requestedTenantId;
  }

  return {
    userId: user.id,
    privyId: user.privyId,
    tenantId: activeTenantId,
  };
}
