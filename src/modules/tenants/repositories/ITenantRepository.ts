import { Tenant } from '@prisma/client';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
}
