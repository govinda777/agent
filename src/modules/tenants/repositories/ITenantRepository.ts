import { Tenant } from '@prisma/client';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  upsert(tenantId: string, data: { trialEndsAt: Date, status?: string }): Promise<Tenant>;
  associateUser(tenantId: string, userId: string, role: string): Promise<void>;
}
