import { prisma } from '@/lib/prisma';
import { UserRepository, UserWithTenants } from '../domain/repositories/UserRepository';
import { Tenant } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  async findByPrivyId(privyId: string): Promise<UserWithTenants | null> {
    return prisma.user.findUnique({
      where: { privyId },
      include: { tenants: { include: { tenant: true } } },
    });
  }

  async createUserWithTenant(privyId: string, trialEndsAt: Date): Promise<UserWithTenants> {
    return prisma.user.create({
      data: {
        privyId,
        tenants: {
          create: {
            role: 'OWNER',
            tenant: {
              create: {
                trialEndsAt,
              },
            },
          },
        },
      },
      include: { tenants: { include: { tenant: true } } },
    });
  }

  async createTenantForUser(userId: string, trialEndsAt: Date): Promise<Tenant> {
    const tenant = await prisma.tenant.create({
      data: {
        trialEndsAt,
      },
    });

    await prisma.tenantUser.create({
      data: {
        userId,
        tenantId: tenant.id,
        role: 'OWNER',
      },
    });

    return tenant;
  }
}
