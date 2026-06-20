import { getPrismaWithRLS } from '@/lib/prisma';
import { IEvent } from './types';
import { durableBus } from './DurableBus';
import { JsonValue } from '@prisma/client/runtime/library';

/**
 * EVENT STORE (FONTE DA VERDADE 2026)
 *
 * Responsável por garantir a persistência atômica de eventos imutáveis no Postgres.
 * O isolamento de tenants é garantido via Neon Row Level Security (RLS).
 */
export class EventStore {
  /**
   * Persiste um novo evento no banco e o propaga via Broker Durável.
   *
   * @param event O evento a ser gravado.
   */
  static async append(event: IEvent) {
    const db = getPrismaWithRLS(event.tenantId);

    // 1. Grava no Postgres (Single Source of Truth) - Bloco Síncrono Obrigatório
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

    // 2. Propaga via Mensageria Durável (Upstash QStash)
    // O processamento de Projeções e Side Effects ocorre fora do ciclo de vida desta requisição.
    // Isso garante latência mínima para o usuário e resiliência total.
    await durableBus.publish(busEvent);

    return storedEvent;
  }

  /**
   * Recupera o histórico de eventos de um agregado para Replay de Estado.
   */
  static async getEvents(tenantId: string, aggregateId: string) {
    const db = getPrismaWithRLS(tenantId);
    return db.eventStore.findMany({
      where: { aggregateId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
