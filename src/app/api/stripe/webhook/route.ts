import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/config/env';
import { EventStore } from '@/lib/cqrs/EventStore';
import { CHECKOUT_COMPLETED } from '@/modules/checkout/events/CheckoutEvents';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { tenantId, userId, plan } = session.metadata || {};

    if (!tenantId || !userId) {
      console.error('Missing metadata in Stripe session');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    try {
      // REGISTRO IDEMPOTENTE NA EVENTSTORE
      // A constraint UNIQUE(tenantId, externalEventId) garante a atomicidade
      await EventStore.append({
        tenantId,
        aggregateType: 'CHECKOUT',
        aggregateId: session.id,
        eventType: CHECKOUT_COMPLETED,
        externalEventId: event.id, // ID do Evento do Stripe para Idempotência
        payload: {
          tenantId,
          userId,
          stripeSessionId: session.id,
          externalEventId: event.id,
          plan: plan || 'premium'
        }
      });

      console.log(`[StripeWebhook] Processed checkout.session.completed for tenant ${tenantId}`);
    } catch (error: any) {
      // Se for erro de duplicidade (P2002), retornamos 200 para o Stripe não repetir
      if (error.code === 'P2002') {
        console.warn(`[StripeWebhook] Event ${event.id} already processed for tenant ${tenantId}`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }
      throw error;
    }
  }

  return NextResponse.json({ success: true });
}
