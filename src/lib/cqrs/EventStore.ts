import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from './types';
import { eventBus } from './EventBus';
import { durableBus } from './DurableBus';
import { JsonValue } from '@prisma/client/runtime/library';

export class EventStore {
  static async append(event: IEvent) {
    const db = getPrismaWithRLS(event.tenantId);

    const storedEvent = await db.eventStore.create({
      data: {
        tenantId: event.tenantId,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload as JsonValue,
      }
    });

    const busEvent: IEvent = {
        tenantId: storedEvent.tenantId,
        aggregateType: storedEvent.aggregateType,
        aggregateId: storedEvent.aggregateId,
        eventType: storedEvent.eventType,
        payload: storedEvent.payload as Record<string, unknown>,
        createdAt: storedEvent.createdAt
    };

    // [TEST/SYCN] Propaga em memória para testes e reações ultra-rápidas
    // No ambiente 2026, projeções críticas podem ser síncronas se leves.
    await eventBus.publish(busEvent);

    // [ASYNC] Propaga para o mundo exterior via QStash
    await durableBus.publish(busEvent);

    return storedEvent;
  }

  static async getEvents(tenantId: string, aggregateId: string) {
    const db = getPrismaWithRLS(tenantId);
    return db.eventStore.findMany({
      where: { aggregateId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
