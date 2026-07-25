import { eventBus } from '@/lib/cqrs/EventBus';
import { tenantRepository } from '../di';
import { IEvent } from '@/lib/cqrs/types';
import { TENANT_CREATED, TENANT_USER_ASSOCIATED } from '../events/TenantEvents';

/**
 * Atualiza o Read Model de Tenants.
 */
export const initTenantProjections = () => {

  eventBus.subscribe(TENANT_CREATED, async (event: IEvent) => {
    const { trialEndsAt } = event.payload;

    await tenantRepository.upsert(event.aggregateId, {
        trialEndsAt: new Date(trialEndsAt as string),
        status: 'FREE'
    });
  });

  eventBus.subscribe(TENANT_USER_ASSOCIATED, async (event: IEvent) => {
    const { userId, role } = event.payload;
    await tenantRepository.associateUser(event.tenantId, userId as string, role as string);
  });
};
