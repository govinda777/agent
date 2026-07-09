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
}
