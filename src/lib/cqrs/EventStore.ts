import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from './types';
import { eventBus } from './EventBus';
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

    // Despacha para o bus assincronamente
    const busEvent: IEvent = {
        tenantId: storedEvent.tenantId,
        aggregateType: storedEvent.aggregateType,
        aggregateId: storedEvent.aggregateId,
        eventType: storedEvent.eventType,
        payload: storedEvent.payload as Record<string, unknown>,
        createdAt: storedEvent.createdAt
    };

    await eventBus.publish(busEvent);

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
