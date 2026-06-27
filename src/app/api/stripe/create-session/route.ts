import { NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/infrastructure/require-auth';
import Stripe from 'stripe';
import { env } from '@/config/env';
import { EventStore } from '@/lib/cqrs/EventStore';
import { CHECKOUT_STARTED } from '@/modules/checkout/events/CheckoutEvents';

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(request: Request) {
  try {
    const { tenantId, userId } = await requireAuth(request);
    const { plan } = await request.json();

    const priceId = plan === 'premium' ? env.stripeProPriceId : env.stripeConsultingPriceId;

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${tenantId}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${tenantId}/checkout/cancel`,
      metadata: {
        tenantId,
        userId,
        plan
      },
    });

    // Registrar Evento CheckoutStarted
    await EventStore.append({
      tenantId,
      aggregateType: 'CHECKOUT',
      aggregateId: session.id,
      eventType: CHECKOUT_STARTED,
      payload: {
        tenantId,
        userId,
        stripeSessionId: session.id,
        plan
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
