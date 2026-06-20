import { IEvent } from './types';

type EventHandler = (event: IEvent) => Promise<void>;

/**
 * EVENT BUS (SISTEMA CIRCULATÓRIO 2026)
 *
 * O EventBus é responsável por orquestrar a propagação de eventos imutáveis
 * para diferentes partes do sistema.
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler) {
    const current = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...current, handler]);
  }

  async publish(event: IEvent) {
    const handlers = this.handlers.get(event.eventType) || [];

    console.log(`[EventBus] Publishing ${event.eventType} for aggregate ${event.aggregateId}`);

    await Promise.all(handlers.map(async (handler) => {
        try {
            await handler(event);
        } catch (error) {
            console.error(`[EventBus] Error in handler for ${event.eventType}:`, error);
        }
    }));
  }
}

export const eventBus = new EventBus();
