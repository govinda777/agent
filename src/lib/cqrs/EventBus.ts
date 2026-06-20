import { IEvent } from './types';

type EventHandler = (event: IEvent) => Promise<void>;

/**
 * EventBus simples para despachar eventos para Projections e Side Effects.
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler) {
    const current = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...current, handler]);
  }

  async publish(event: IEvent) {
    const handlers = this.handlers.get(event.eventType) || [];
    // Executa handlers em paralelo para performance
    await Promise.all(handlers.map(handler => handler(event)));
  }
}

export const eventBus = new EventBus();
