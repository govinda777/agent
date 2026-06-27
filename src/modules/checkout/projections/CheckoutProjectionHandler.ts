import { eventBus } from '@/lib/cqrs/EventBus';
import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from '@/lib/cqrs/types';
import { CHECKOUT_COMPLETED } from '../events/CheckoutEvents';

/**
 * Atualiza o status do Tenant após checkout completo.
 */
export const initCheckoutProjections = () => {

  eventBus.subscribe(CHECKOUT_COMPLETED, async (event: IEvent) => {
    const db = getPrismaWithRLS(event.tenantId);

    await db.tenant.update({
      where: { id: event.tenantId },
      data: {
        status: 'ACTIVE' // Premium status
      }
    });
  });
};
