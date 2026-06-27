import { NextResponse } from 'next/server';
import { IEvent } from '@/lib/cqrs/types';
import { eventBus } from '@/lib/cqrs/EventBus';
import { initAgentProjections } from '@/modules/agents/projections/AgentProjectionHandler';
import { initExecutionProjections } from '@/modules/agents/projections/ExecutionProjectionHandler';
import { initQuotaEvents } from '@/modules/agents/projections/QuotaEventHandler';
import { initTenantProjections } from '@/modules/tenants/projections/TenantProjectionHandler';
import { initCheckoutProjections } from '@/modules/checkout/projections/CheckoutProjectionHandler';

// Inicializa os handlers de projeção
initAgentProjections();
initExecutionProjections();
initQuotaEvents();
initTenantProjections();
initCheckoutProjections();

/**
 * WEBHOOK DE PROJEÇÕES (ASYNC WORKER)
 *
 * Este endpoint é chamado pelo QStash para processar eventos de forma resiliente.
 * Ele re-publica o evento no EventBus local, mas agora em um processo
 * separado da requisição original do usuário.
 */
export async function POST(request: Request) {
  try {
    // Nota: Em produção, validar a assinatura do QStash aqui
    // const signature = request.headers.get("upstash-signature");

    const event = await request.json() as IEvent;

    console.log(`[ProjectionWebhook] Received event: ${event.eventType} for tenant ${event.tenantId}`);

    // Dispara o processamento local dos handlers
    await eventBus.publish(event);

    return NextResponse.json({ success: true, processed: event.eventType });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ProjectionWebhook] Critical failure:', message);

    // Retornamos 500 para o QStash tentar o retry automaticamente
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
