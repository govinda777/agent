import { tokenVerifier } from '../di';
import { prisma } from '@/lib/prisma';

export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  let privyId: string;

  try {
    privyId = await tokenVerifier.verifyToken(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }

  // Find or create User and ensure they have a Tenant
  let user = await prisma.user.findUnique({
    where: { privyId },
    include: { tenants: { include: { tenant: true } } },
  });

  if (!user) {
    const existingTenant = await prisma.tenant.findFirst();

    if (existingTenant) {
      user = await prisma.user.create({
        data: {
          privyId,
          tenants: {
            create: {
              tenantId: existingTenant.id,
              role: 'OWNER',
            },
          },
        },
        include: { tenants: { include: { tenant: true } } },
      });
    } else {
      user = await prisma.user.create({
        data: {
          privyId,
          tenants: {
            create: {
              role: 'OWNER',
              tenant: {
                create: {
                  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
                },
              },
            },
          },
        },
        include: { tenants: { include: { tenant: true } } },
      });
    }
  } else if (user.tenants.length === 0) {
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
