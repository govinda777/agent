import { eventBus } from '@/lib/cqrs/EventBus';
import { redis } from '@/lib/redis';
import { IEvent } from '@/lib/cqrs/types';

/**
 * Reage a eventos de cota para atualizar o cache da Edge.
 */
export const initQuotaEvents = () => {

  eventBus.subscribe('QuotaExceeded', async (event: IEvent) => {
    // Atualiza o Redis imediatamente para o Proxy bloquear na borda
    await redis.set(`tenant:${event.tenantId}:status`, 'OVER_BUDGET');
    console.log(`[Quota] Tenant ${event.tenantId} marked as OVER_BUDGET in Edge Cache.`);
  });

  eventBus.subscribe('PaymentReceived', async (event: IEvent) => {
    await redis.set(`tenant:${event.tenantId}:status`, 'ACTIVE');
  });
};
