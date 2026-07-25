import { eventBus } from '@/lib/cqrs/EventBus';
import { tenantRepository } from '@/modules/tenants/di';
import { IEvent } from '@/lib/cqrs/types';
import { CHECKOUT_COMPLETED } from '../events/CheckoutEvents';

/**
 * Atualiza o status do Tenant após checkout completo.
 */
export const initCheckoutProjections = () => {

  eventBus.subscribe(CHECKOUT_COMPLETED, async (event: IEvent) => {
    // Re-use tenant repository to update status
    const tenant = await tenantRepository.findById(event.tenantId);
    if (tenant) {
        await tenantRepository.upsert(event.tenantId, {
            trialEndsAt: tenant.trialEndsAt,
            status: 'ACTIVE'
        });
    }
  });
};
