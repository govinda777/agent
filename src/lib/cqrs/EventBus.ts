import { IEvent } from './types';

type EventHandler = (event: IEvent) => Promise<void>;

/**
 * EVENT BUS (SISTEMA CIRCULATÓRIO 2026)
 *
 * O EventBus é responsável por orquestrar a propagação de eventos imutáveis
 * para diferentes partes do sistema após sua persistência na EventStore.
 *
 * Características:
 * - Reactive: Projeções (Read Models) são atualizadas em tempo real.
 * - Parallel: Executa múltiplos handlers simultaneamente para máxima performance.
 * - Decoupled: O domínio de escrita não conhece quem está ouvindo os eventos.
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Assina um tipo de evento específico.
   * Geralmente usado por Handlers de Projeção em src/modules/*/projections.
   */
  subscribe(eventType: string, handler: EventHandler) {
    const current = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...current, handler]);
  }

  /**
   * Publica um evento para todos os assinantes interessados.
   * Chamado automaticamente pela EventStore após o commit no Postgres.
   */
  async publish(event: IEvent) {
    const handlers = this.handlers.get(event.eventType) || [];

    // Log de auditoria simples na console (Edge compatible)
    console.log(`[EventBus] Publishing ${event.eventType} for aggregate ${event.aggregateId}`);

    // Executa handlers em paralelo para não bloquear o fluxo principal
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
