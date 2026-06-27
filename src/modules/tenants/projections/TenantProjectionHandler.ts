import { eventBus } from '@/lib/cqrs/EventBus';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from '@/lib/cqrs/types';
import { TENANT_CREATED, TENANT_USER_ASSOCIATED } from '../events/TenantEvents';

/**
 * Atualiza o Read Model de Tenants (Tabela Tenant e TenantUser).
 */
export const initTenantProjections = () => {

  eventBus.subscribe(TENANT_CREATED, async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const { trialEndsAt } = event.payload;

    await db.tenant.upsert({
      where: { id: event.aggregateId },
      create: {
        id: event.aggregateId,
        trialEndsAt: new Date(trialEndsAt as string),
        status: 'FREE'
      },
      update: {
        trialEndsAt: new Date(trialEndsAt as string)
      }
    });
  });

  eventBus.subscribe(TENANT_USER_ASSOCIATED, async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);
    const { userId, role } = event.payload;

    await db.tenantUser.upsert({
      where: {
        userId_tenantId: {
          userId: userId as string,
          tenantId: event.tenantId
        }
      },
      create: {
        userId: userId as string,
        tenantId: event.tenantId,
        role: role as string
      },
      update: {
        role: role as string
      }
    });
  });
};
