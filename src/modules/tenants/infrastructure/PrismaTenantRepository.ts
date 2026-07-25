import { Tenant } from '@prisma/client';
import { getPrismaWithRLS } from '@/lib/prisma';
import { ITenantRepository } from '../repositories/ITenantRepository';

export class PrismaTenantRepository implements ITenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const db = getPrismaWithRLS(id);
    return db.tenant.findUnique({
      where: { id }
    });
  }

  async upsert(tenantId: string, data: { trialEndsAt: Date, status?: string }) {
    const db = getPrismaWithRLS(tenantId);
    return db.tenant.upsert({
      where: { id: tenantId },
      create: {
        id: tenantId,
        trialEndsAt: data.trialEndsAt,
        status: data.status || 'FREE'
      },
      update: {
        trialEndsAt: data.trialEndsAt,
        status: data.status
      }
    });
  }

  async associateUser(tenantId: string, userId: string, role: string) {
    const db = getPrismaWithRLS(tenantId);
    await db.tenantUser.upsert({
      where: {
        userId_tenantId: {
          userId,
          tenantId
        }
      },
      create: {
        userId,
        tenantId,
        role
      },
      update: {
        role
      }
    });
  }
}
