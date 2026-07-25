import { IQuery } from '@/lib/cqrs/types';
import { tenantRepository } from '../di';
import { Tenant } from '@prisma/client';

export class GetTenantQuery implements IQuery<Tenant | null> {
  async execute(tenantId: string): Promise<Tenant | null> {
    return tenantRepository.findById(tenantId);
  }
}

export const getTenantQuery = new GetTenantQuery();
