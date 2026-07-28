import { NextResponse } from 'next/server';
import { IEvent } from '@/lib/cqrs/types';
import { eventBus } from '@/lib/cqrs/EventBus';
import { initAgentProjections } from '@/modules/agents/projections/AgentProjectionHandler';
import { initExecutionProjections } from '@/modules/agents/projections/ExecutionProjectionHandler';
import { initQuotaEvents } from '@/modules/agents/projections/QuotaEventHandler';
import { initTenantProjections } from '@/modules/tenants/projections/TenantProjectionHandler';
import { initCheckoutProjections } from '@/modules/checkout/projections/CheckoutProjectionHandler';
import { initUserProjections } from '@/modules/users/projections/UserProjectionHandler';

// Inicializa os handlers de projeção
initAgentProjections();
initExecutionProjections();
initQuotaEvents();
initTenantProjections();
initCheckoutProjections();
initUserProjections();

/**
 * WEBHOOK DE PROJEÇÕES (ASYNC WORKER)
 */
export async function POST(request: Request) {
  try {
    const event = await request.json() as IEvent;

    console.log(`[ProjectionWebhook] Received event: ${event.eventType} for tenant ${event.tenantId}`);

    // Dispara o processamento local dos handlers
    await eventBus.publish(event);

    return NextResponse.json({ success: true, processed: event.eventType });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ProjectionWebhook] Critical failure:', message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
